/**
 * xAI-assisted mapping helpers — always validate after.
 * Deterministic fallbacks when XAI_API_KEY is missing.
 */

import { xaiChat, isXaiConfigured } from './xai-client.js';
import { draftToProductBody } from '../catalog-sync.js';
import { validateAndNormalizeProduct } from '../product-admin.js';

/**
 * Deterministic map of a messy row object → ProductDraft (no AI).
 * @param {Record<string, unknown>} row
 */
export function deterministicMapRow(row) {
  const r = row && typeof row === 'object' ? row : {};
  const name = String(r.name || r.product_name || r.Name || r.title || '').trim();
  const wholesale = Number(r.wholesale_price ?? r.wholesale ?? r.cost ?? r.Wholesale);
  const sku = String(r.skin_script_sku || r.sku || r.SKU || r.supplier_sku || '').trim();
  if (!name || !sku || Number.isNaN(wholesale)) return null;

  return {
    name,
    skin_script_sku: sku,
    wholesale_price: wholesale,
    retail_price: r.retail_price != null ? Number(r.retail_price) : undefined,
    category: String(r.category || 'Serum'),
    size: String(r.size || ''),
    description_short: String(r.description_short || r.description || ''),
    stock_status: String(r.stock_status || 'in_stock'),
    active: r.active !== false,
    ai_assisted: false
  };
}

/**
 * Map messy rows to validated product drafts.
 * Uses xAI when configured; falls back to deterministic mapping.
 * AI drafts are always marked ai_assisted and must pass validateAndNormalizeProduct.
 *
 * @param {object[]} rows
 * @param {{ useAi?: boolean, existingIds?: string[] }} [opts]
 */
export async function mapCatalogRows(rows, opts = {}) {
  const useAi = opts.useAi !== false && isXaiConfigured();
  const results = [];

  if (useAi && rows?.length) {
    const promptRows = rows.slice(0, 40).map((r) => {
      // Redact obvious PII keys if present
      const copy = { ...r };
      delete copy.email;
      delete copy.phone;
      delete copy.customer;
      return copy;
    });

    const ai = await xaiChat({
      json: true,
      messages: [
        {
          role: 'system',
          content:
            'You map wholesale catalog rows to JSON ProductDraft objects for Dew Theory. ' +
            'Return {"drafts":[{name,skin_script_sku,wholesale_price,category?,size?,description_short?,stock_status?,id?}]}. ' +
            'Do not invent ingredients or prices not implied by the row. wholesale_price must be numeric.'
        },
        {
          role: 'user',
          content: JSON.stringify({ rows: promptRows })
        }
      ]
    });

    if (ai.ok) {
      try {
        const parsed = JSON.parse(ai.content);
        const drafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
        for (const d of drafts) {
          const draft = { ...d, ai_assisted: true };
          const body = draftToProductBody(draft);
          const validated = validateAndNormalizeProduct(body, {
            isNew: true,
            existingIds: opts.existingIds || []
          });
          if (validated.ok) {
            results.push({
              ok: true,
              draft: { ...validated.product, source: 'sync', ai_assisted: true },
              ai_assisted: true
            });
          } else {
            results.push({
              ok: false,
              error: validated.error,
              code: validated.code,
              draft,
              ai_assisted: true
            });
          }
        }
        if (results.length) return results;
      } catch {
        /* fall through to deterministic */
      }
    }
  }

  for (const row of rows || []) {
    const draft = deterministicMapRow(row);
    if (!draft) {
      results.push({ ok: false, error: 'unmappable_row', code: 'unmappable_row', row });
      continue;
    }
    const body = draftToProductBody(draft);
    const validated = validateAndNormalizeProduct(body, {
      isNew: true,
      existingIds: opts.existingIds || []
    });
    if (!validated.ok) {
      results.push({
        ok: false,
        error: validated.error,
        code: validated.code,
        draft
      });
      continue;
    }
    results.push({
      ok: true,
      draft: { ...validated.product, source: 'sync', ai_assisted: false },
      ai_assisted: false
    });
  }
  return results;
}

const ERROR_ENUMS = [
  'sku_missing',
  'sku_unknown',
  'out_of_stock',
  'address_invalid',
  'auth_failed',
  'rate_limited',
  'network',
  'supplier_error',
  'unknown'
];

/**
 * Classify fulfillment error text → enum + suggested action.
 * Deterministic first; optional xAI enrichment.
 * @param {string} message
 */
export async function classifyFulfillmentError(message) {
  const m = String(message || '').toLowerCase();

  let code = 'unknown';
  let suggested_action = 'Review order in admin and retry or fulfill manually.';

  if (m.includes('skin_script_sku') || m.includes('missing')) {
    code = 'sku_missing';
    suggested_action = 'Set skin_script_sku on products and re-sync catalog.';
  } else if (m.includes('unknown supplier sku') || m.includes('sku_unknown')) {
    code = 'sku_unknown';
    suggested_action = 'Verify supplier SKU mapping for line items.';
  } else if (m.includes('stock') || m.includes('oos')) {
    code = 'out_of_stock';
    suggested_action = 'Mark product OOS and contact customer.';
  } else if (m.includes('address')) {
    code = 'address_invalid';
    suggested_action = 'Ask customer to update shipping address.';
  } else if (m.includes('unconfigured') || m.includes('401') || m.includes('403')) {
    code = 'auth_failed';
    suggested_action = 'Check SKIN_SCRIPT_API_KEY / adapter mode.';
  } else if (m.includes('429') || m.includes('rate')) {
    code = 'rate_limited';
    suggested_action = 'Wait and retry with backoff.';
  } else if (m.includes('network') || m.includes('fetch')) {
    code = 'network';
    suggested_action = 'Retry when supplier is reachable.';
  } else if (m.includes('supplier') || m.includes('http')) {
    code = 'supplier_error';
  }

  if (isXaiConfigured() && message) {
    const ai = await xaiChat({
      json: true,
      messages: [
        {
          role: 'system',
          content:
            `Classify wholesale dropship errors. Return JSON {"code": one of ${JSON.stringify(ERROR_ENUMS)}, "suggested_action": string}. No PII.`
        },
        { role: 'user', content: String(message).slice(0, 500) }
      ]
    });
    if (ai.ok) {
      try {
        const parsed = JSON.parse(ai.content);
        if (ERROR_ENUMS.includes(parsed.code)) {
          code = parsed.code;
          if (parsed.suggested_action) suggested_action = String(parsed.suggested_action).slice(0, 500);
        }
      } catch {
        /* keep deterministic */
      }
    }
  }

  return { code, suggested_action, ai_assisted: isXaiConfigured() };
}
