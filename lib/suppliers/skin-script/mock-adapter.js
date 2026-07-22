/**
 * Offline Skin Script mock supplier — catalog + dropship for local automation tests.
 * No network. Not real wholesale data beyond mirroring seed catalog shape.
 */

import catalog from '../../../data/products.json' with { type: 'json' };

/** In-memory dropship ledger for getOrderStatus */
const orders = new Map();

function seedDrafts() {
  return (catalog.products || []).map((p) => {
    const sku = p.skin_script_sku || `SS-${String(p.id).toUpperCase().replace(/-/g, '_')}`;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      size: p.size || '',
      wholesale_price: p.wholesale_price,
      retail_price: p.retail_price,
      skin_script_sku: sku,
      description_short: p.description_short || '',
      how_to_use: p.how_to_use || '',
      key_actives: p.key_actives || [],
      skin_types: p.skin_types || [],
      conditions_addressed: p.conditions_addressed || [],
      stock_status: p.stock_status || 'in_stock',
      active: p.active !== false,
      images: p.images || [],
      variants: p.variants ?? null,
      source: 'sync'
    };
  });
}

export function createMockSkinScriptAdapter() {
  const drafts = seedDrafts();

  return {
    name: 'skin-script-mock',
    capabilities: {
      catalog: true,
      inventory: true,
      dropship: true,
      orderStatus: true
    },

    async listCatalog() {
      return drafts.map((d) => ({ ...d }));
    },

    async getInventory(skus) {
      const set = new Set((skus || []).map(String));
      return drafts
        .filter((d) => set.size === 0 || set.has(d.skin_script_sku))
        .map((d) => ({
          sku: d.skin_script_sku,
          stock_status: d.stock_status || 'in_stock',
          quantity: d.stock_status === 'out_of_stock' ? 0 : 25
        }));
    },

    async createDropshipOrder(payload) {
      if (!payload?.order_id) {
        const err = new Error('order_id required');
        err.code = 'dropship_invalid';
        throw err;
      }
      if (!payload.lines?.length) {
        const err = new Error('lines required');
        err.code = 'dropship_empty';
        throw err;
      }
      for (const line of payload.lines) {
        if (!line.skin_script_sku) {
          const err = new Error('line missing skin_script_sku');
          err.code = 'dropship_sku_missing';
          throw err;
        }
        const known = drafts.some((d) => d.skin_script_sku === line.skin_script_sku);
        if (!known) {
          const err = new Error(`Unknown supplier SKU: ${line.skin_script_sku}`);
          err.code = 'dropship_sku_unknown';
          throw err;
        }
      }

      // Idempotent by dew order id
      const existing = orders.get(payload.order_id);
      if (existing) {
        return {
          external_id: existing.external_id,
          status: existing.status,
          raw: { idempotent: true, order_id: payload.order_id }
        };
      }

      const external_id = `SSPO_${payload.order_id}`;
      const rec = {
        external_id,
        status: 'accepted',
        tracking_number: null,
        carrier: null,
        created_at: new Date().toISOString(),
        lines: payload.lines
      };
      orders.set(payload.order_id, rec);
      orders.set(external_id, rec);

      return {
        external_id,
        status: 'accepted',
        raw: {
          mock: true,
          order_id: payload.order_id,
          line_count: payload.lines.length
        }
      };
    },

    async getOrderStatus(externalId) {
      const rec = orders.get(externalId);
      if (!rec) {
        return { status: 'unknown' };
      }
      return {
        status: rec.status,
        tracking_number: rec.tracking_number || undefined,
        carrier: rec.carrier || undefined
      };
    }
  };
}

/** Test helper — clear mock PO ledger */
export function resetMockDropshipLedger() {
  orders.clear();
}
