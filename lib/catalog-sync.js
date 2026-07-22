/**
 * Catalog sync orchestration — fetch supplier drafts, plan upserts, optional apply.
 * Match priority: skin_script_sku → id slug. Never wipe manual-only products.
 */

import { validateAndNormalizeProduct, defaultRetailFromWholesale } from './product-admin.js';
import { audit, mutateStore, readStore } from './store.js';
import { getSkinScriptAdapter } from './suppliers/skin-script/index.js';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Normalize a supplier draft into a product body for validateAndNormalizeProduct.
 * @param {object} draft
 */
export function draftToProductBody(draft) {
  const wholesale = Number(draft.wholesale_price);
  const retail =
    draft.retail_price != null && draft.retail_price !== ''
      ? Number(draft.retail_price)
      : defaultRetailFromWholesale(wholesale);

  const id = String(draft.id || slugify(draft.name)).toLowerCase();

  return {
    id,
    name: draft.name,
    category: draft.category || 'Serum',
    size: draft.size || '',
    wholesale_price: wholesale,
    retail_price: retail,
    description_short: draft.description_short || '',
    how_to_use: draft.how_to_use || '',
    key_actives: draft.key_actives || [],
    skin_types: draft.skin_types || [],
    conditions_addressed: draft.conditions_addressed || [],
    stock_status: draft.stock_status || 'in_stock',
    skin_script_sku: draft.skin_script_sku,
    active: draft.active !== false,
    images: draft.images || [],
    variants: draft.variants ?? null,
    source: 'sync',
    ai_assisted: Boolean(draft.ai_assisted)
  };
}

/**
 * Build create/update/skip/error plan without writing.
 * @param {object[]} drafts
 * @param {object[]} existingProducts
 */
export function planCatalogSync(drafts, existingProducts) {
  const existing = existingProducts || [];
  const bySku = new Map();
  const byId = new Map();
  for (const p of existing) {
    if (p.skin_script_sku) bySku.set(String(p.skin_script_sku), p);
    byId.set(p.id, p);
  }

  const plan = { create: [], update: [], skip: [], error: [] };
  const seenSkus = new Set();

  for (const draft of drafts || []) {
    const sku = String(draft.skin_script_sku || '').trim();
    if (!sku) {
      plan.error.push({ draft, reason: 'missing_skin_script_sku' });
      continue;
    }
    if (seenSkus.has(sku)) {
      plan.skip.push({ draft, reason: 'duplicate_sku_in_feed', sku });
      continue;
    }
    seenSkus.add(sku);

    const body = draftToProductBody({ ...draft, skin_script_sku: sku });
    const match = bySku.get(sku) || byId.get(body.id) || null;

    // Never overwrite pure manual products that have no sku unless id matches and we set sku
    if (match && match.source === 'manual' && !match.skin_script_sku && bySku.get(sku) !== match) {
      // id collision with manual product different sku path — skip unless same id intentional
      if (match.id === body.id && !match.skin_script_sku) {
        // allow attaching sku via update
      }
    }

    if (!match) {
      const validated = validateAndNormalizeProduct(body, {
        isNew: true,
        existingIds: existing.map((p) => p.id)
      });
      if (!validated.ok) {
        plan.error.push({
          draft,
          reason: validated.code || 'validation_failed',
          error: validated.error
        });
        continue;
      }
      plan.create.push({
        product: {
          ...validated.product,
          source: 'sync',
          skin_script_sku: sku,
          ai_assisted: Boolean(draft.ai_assisted)
        },
        sku
      });
      continue;
    }

    // Skip no-op if core fields unchanged
    const same =
      match.name === body.name &&
      Number(match.wholesale_price) === Number(body.wholesale_price) &&
      Number(match.retail_price) === Number(body.retail_price) &&
      match.stock_status === body.stock_status &&
      match.skin_script_sku === sku &&
      Boolean(match.active) === Boolean(body.active);

    if (same) {
      plan.skip.push({ draft, reason: 'unchanged', id: match.id, sku });
      continue;
    }

    const merged = {
      ...match,
      ...body,
      id: match.id,
      source: match.source === 'manual' ? 'sync' : match.source || 'sync'
    };
    const validated = validateAndNormalizeProduct(merged, { isNew: false });
    if (!validated.ok) {
      plan.error.push({
        draft,
        reason: validated.code || 'validation_failed',
        error: validated.error,
        id: match.id
      });
      continue;
    }
    plan.update.push({
      id: match.id,
      before: match,
      product: {
        ...match,
        ...validated.product,
        id: match.id,
        source: 'sync',
        skin_script_sku: sku,
        ai_assisted: Boolean(draft.ai_assisted)
      },
      sku
    });
  }

  return plan;
}

/**
 * @param {{ dry_run?: boolean, source?: string, adminId?: string, revalidate?: boolean }} opts
 */
export async function runCatalogSync(opts = {}) {
  const dryRun = opts.dry_run !== false; // default true for safety
  const adapter = getSkinScriptAdapter(opts.source);
  const drafts = await adapter.listCatalog();
  const existing = readStore().products || [];
  const plan = planCatalogSync(drafts, existing);

  const summary = {
    dry_run: dryRun,
    adapter: adapter.name,
    source: opts.source || process.env.SKIN_SCRIPT_MODE || 'mock',
    totals: {
      drafts: drafts.length,
      create: plan.create.length,
      update: plan.update.length,
      skip: plan.skip.length,
      error: plan.error.length
    },
    plan
  };

  if (dryRun) return summary;

  const touchedIds = [];
  mutateStore((s) => {
    for (const row of plan.create) {
      if (s.products.some((p) => p.id === row.product.id)) continue;
      s.products.push({
        ...row.product,
        source: 'sync',
        key_actives: row.product.key_actives || [],
        skin_types: row.product.skin_types || [],
        conditions_addressed: row.product.conditions_addressed || [],
        images: row.product.images || []
      });
      touchedIds.push(row.product.id);
    }
    for (const row of plan.update) {
      const idx = s.products.findIndex((p) => p.id === row.id);
      if (idx < 0) continue;
      s.products[idx] = {
        ...s.products[idx],
        ...row.product,
        id: row.id,
        source: 'sync'
      };
      touchedIds.push(row.id);
    }
    return s;
  });

  if (opts.adminId) {
    audit(opts.adminId, 'catalog.sync', 'Products', 'bulk', {
      adapter: adapter.name,
      create: plan.create.length,
      update: plan.update.length,
      skip: plan.skip.length,
      error: plan.error.length,
      touchedIds
    });
  }

  if (opts.revalidate !== false) {
    try {
      const { revalidateProductSurfaces } = await import('./revalidate-storefront.js');
      revalidateProductSurfaces(touchedIds);
    } catch {
      /* next/cache may be unavailable outside request / node:test */
    }
  }

  return { ...summary, applied: true, touchedIds };
}
