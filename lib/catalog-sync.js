/**
 * Catalog sync orchestration — fetch supplier drafts, plan upserts, optional apply.
 * Allowlist-only: never auto-list Skin Script SKUs that are not curated.
 * Match priority: skin_script_sku → Dew product id. Updates prefer commerce fields
 * (wholesale / retail / availability / SKU) over rewriting Emily-facing copy.
 */

import {
  validateAndNormalizeProduct,
  defaultRetailFromWholesale,
  parseHonestyFlag
} from './product-admin.js';
import { audit, mutateStore, readStore } from './store.js';
import { getSkinScriptAdapter } from './suppliers/skin-script/index.js';
import {
  findAllowlistEntry,
  getEnabledAllowlistEntries,
  loadCatalogAllowlist
} from './catalog-allowlist.js';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Normalize a supplier draft into a product body for validateAndNormalizeProduct.
 * Used for create (auto-list) only — updates use commercePatchFromDraft.
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
 * Commerce-only patch. Preserves existing editorial copy and honesty flags.
 * @param {object} existing
 * @param {object} draft
 * @param {string} sku
 */
export function commercePatchFromDraft(existing, draft, sku) {
  const wholesale = Number(draft.wholesale_price);
  const retail =
    draft.retail_price != null && draft.retail_price !== ''
      ? Number(draft.retail_price)
      : defaultRetailFromWholesale(wholesale);

  return {
    ...existing,
    wholesale_price: wholesale,
    retail_price: retail,
    stock_status: draft.stock_status || existing.stock_status || 'in_stock',
    skin_script_sku: sku,
    active: draft.active !== false,
    source: 'sync',
    retail_price_confirmed: parseHonestyFlag(existing.retail_price_confirmed, false)
  };
}

function commerceUnchanged(existing, next, sku) {
  return (
    Number(existing.wholesale_price) === Number(next.wholesale_price) &&
    Number(existing.retail_price) === Number(next.retail_price) &&
    existing.stock_status === next.stock_status &&
    existing.skin_script_sku === sku &&
    Boolean(existing.active) === Boolean(next.active)
  );
}

function slimSkip(row) {
  return {
    reason: row.reason,
    id: row.id || row.draft?.id || null,
    sku: row.sku || row.draft?.skin_script_sku || null
  };
}

/**
 * @param {object} [partial]
 */
export function recordCatalogSyncMeta(partial) {
  const now = new Date().toISOString();
  mutateStore((s) => {
    const prev = s.catalog_sync && typeof s.catalog_sync === 'object' ? s.catalog_sync : {};
    s.catalog_sync = {
      ...prev,
      ...partial,
      last_run_at: now,
      last_dry_run_at: partial.dry_run ? now : prev.last_dry_run_at || null,
      last_apply_at: !partial.dry_run && !partial.skipped ? now : prev.last_apply_at || null
    };
    return s;
  });
}

/**
 * Build create/update/skip/error plan without writing.
 * Allowlist is mandatory — drafts that are not curated never create.
 * @param {object[]} drafts
 * @param {object[]} existingProducts
 * @param {{ allowlist?: object }} [opts]
 */
export function planCatalogSync(drafts, existingProducts, opts = {}) {
  const allowlistDoc = opts.allowlist || loadCatalogAllowlist();
  const enabled = getEnabledAllowlistEntries(allowlistDoc);
  const existing = existingProducts || [];
  const bySku = new Map();
  const byId = new Map();
  for (const p of existing) {
    if (p.skin_script_sku) bySku.set(String(p.skin_script_sku), p);
    byId.set(p.id, p);
  }

  const plan = { create: [], update: [], skip: [], error: [] };
  const seenSkus = new Set();
  const seenAllowlistKeys = new Set();

  for (const draft of drafts || []) {
    const sku = String(draft.skin_script_sku || '').trim();
    if (!sku) {
      plan.error.push({ draft, reason: 'missing_skin_script_sku' });
      continue;
    }

    const entry = findAllowlistEntry(
      { id: draft.id, product_id: draft.product_id, skin_script_sku: sku },
      allowlistDoc
    );
    if (!entry) {
      plan.skip.push({ draft, reason: 'not_on_allowlist', sku });
      continue;
    }
    if (!entry.sync_enabled) {
      plan.skip.push({
        draft,
        reason: 'sync_disabled',
        sku: entry.skin_script_sku,
        id: entry.product_id
      });
      continue;
    }

    const canonicalSku = entry.skin_script_sku || sku;
    if (seenSkus.has(canonicalSku)) {
      plan.skip.push({ draft, reason: 'duplicate_sku_in_feed', sku: canonicalSku });
      continue;
    }
    seenSkus.add(canonicalSku);
    seenAllowlistKeys.add(entry.product_id);
    seenAllowlistKeys.add(canonicalSku);

    const body = draftToProductBody({
      ...draft,
      id: entry.product_id || draft.id,
      skin_script_sku: canonicalSku
    });
    const match = bySku.get(canonicalSku) || bySku.get(sku) || byId.get(entry.product_id) || byId.get(body.id) || null;

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
          id: entry.product_id || validated.product.id,
          source: 'sync',
          skin_script_sku: canonicalSku,
          ai_assisted: Boolean(draft.ai_assisted)
        },
        sku: canonicalSku
      });
      continue;
    }

    const patched = commercePatchFromDraft(match, { ...draft, skin_script_sku: canonicalSku }, canonicalSku);
    if (commerceUnchanged(match, patched, canonicalSku)) {
      plan.skip.push({ draft, reason: 'unchanged', id: match.id, sku: canonicalSku });
      continue;
    }

    const validated = validateAndNormalizeProduct(patched, { isNew: false });
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
        name: match.name,
        description_short: match.description_short,
        how_to_use: match.how_to_use,
        key_actives: match.key_actives,
        skin_types: match.skin_types,
        conditions_addressed: match.conditions_addressed,
        images: match.images,
        variants: match.variants,
        category: match.category,
        size: match.size,
        size_confirmed: match.size_confirmed,
        size_note: match.size_note,
        retail_price_confirmed: parseHonestyFlag(match.retail_price_confirmed, false),
        retail_price_note: match.retail_price_note,
        manufacturer_name_note: match.manufacturer_name_note,
        source: 'sync',
        skin_script_sku: canonicalSku,
        wholesale_price: validated.product.wholesale_price,
        retail_price: validated.product.retail_price,
        stock_status: validated.product.stock_status,
        active: validated.product.active
      },
      sku: canonicalSku
    });
  }

  for (const entry of enabled) {
    if (seenAllowlistKeys.has(entry.product_id) || seenAllowlistKeys.has(entry.skin_script_sku)) {
      continue;
    }
    plan.skip.push({
      reason: 'allowlisted_not_in_feed',
      id: entry.product_id,
      sku: entry.skin_script_sku
    });
  }

  return plan;
}

function slimResult(plan) {
  return {
    create: (plan.create || []).map((r) => ({
      id: r.product?.id,
      name: r.product?.name,
      sku: r.sku
    })),
    update: (plan.update || []).map((r) => ({
      id: r.id,
      name: r.product?.name,
      sku: r.sku
    })),
    skip: (plan.skip || []).slice(0, 80).map(slimSkip),
    error: (plan.error || []).map((r) => ({
      reason: r.reason,
      error: r.error,
      sku: r.sku || r.draft?.skin_script_sku,
      id: r.id
    }))
  };
}

/**
 * @param {{ dry_run?: boolean, source?: string, adminId?: string, revalidate?: boolean, record?: boolean }} opts
 */
export async function runCatalogSync(opts = {}) {
  const dryRun = opts.dry_run !== false; // default true for safety
  const adapter = getSkinScriptAdapter(opts.source);
  const drafts = await adapter.listCatalog();
  const existing = readStore().products || [];
  const plan = planCatalogSync(drafts, existing);
  const allowlist = loadCatalogAllowlist();

  const summary = {
    dry_run: dryRun,
    adapter: adapter.name,
    source: opts.source || process.env.SKIN_SCRIPT_MODE || 'mock',
    allowlist: {
      total: allowlist.products.length,
      enabled: getEnabledAllowlistEntries(allowlist).length
    },
    totals: {
      drafts: drafts.length,
      create: plan.create.length,
      update: plan.update.length,
      skip: plan.skip.length,
      error: plan.error.length
    },
    plan
  };

  if (dryRun) {
    if (opts.record !== false) {
      recordCatalogSyncMeta({
        dry_run: true,
        skipped: false,
        code: 'dry_run',
        last_source: summary.source,
        last_adapter: summary.adapter,
        last_totals: summary.totals,
        last_allowlist: summary.allowlist,
        ...slimResult(plan)
      });
    }
    return summary;
  }

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

  if (opts.record !== false) {
    recordCatalogSyncMeta({
      dry_run: false,
      skipped: false,
      code: 'applied',
      last_source: summary.source,
      last_adapter: summary.adapter,
      last_totals: summary.totals,
      last_allowlist: summary.allowlist,
      last_touched_ids: touchedIds,
      ...slimResult(plan)
    });
  }

  return { ...summary, applied: true, touchedIds };
}
