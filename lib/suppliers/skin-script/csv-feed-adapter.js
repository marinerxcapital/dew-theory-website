/**
 * Authorized CSV/JSON feed adapter.
 * Reads SKIN_SCRIPT_FEED_URL (http(s) or file path) — no HTML scraping.
 */

import fs from 'fs';
import path from 'path';
import { parseCsv } from '../../csv-import.js';
import { defaultRetailFromWholesale } from '../../product-admin.js';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function rowToDraft(row) {
  const name = String(row.name || row.product_name || row.Name || '').trim();
  const wholesale = Number(row.wholesale_price ?? row.wholesale ?? row.cost ?? row.Wholesale);
  const sku = String(
    row.skin_script_sku || row.sku || row.SKU || row.supplier_sku || ''
  ).trim();
  if (!name || !sku || Number.isNaN(wholesale) || wholesale < 0) return null;

  const retailRaw = row.retail_price ?? row.retail;
  const retail =
    retailRaw != null && retailRaw !== ''
      ? Number(retailRaw)
      : defaultRetailFromWholesale(wholesale);

  return {
    id: String(row.id || row.slug || slugify(name)),
    name,
    category: String(row.category || 'Serum'),
    size: String(row.size || ''),
    wholesale_price: Math.round(wholesale * 100) / 100,
    retail_price: Math.round(Number(retail) * 100) / 100,
    skin_script_sku: sku,
    description_short: String(row.description_short || row.description || ''),
    how_to_use: String(row.how_to_use || ''),
    key_actives: [],
    skin_types: [],
    conditions_addressed: [],
    stock_status: String(row.stock_status || 'in_stock'),
    active: row.active !== false && row.active !== 'false' && row.active !== '0',
    images: row.image_url ? [String(row.image_url)] : [],
    variants: null,
    source: 'sync'
  };
}

async function loadFeedText(feedUrl) {
  if (!feedUrl) {
    const err = new Error('SKIN_SCRIPT_FEED_URL is required for csv_feed mode');
    err.code = 'feed_url_missing';
    throw err;
  }
  if (feedUrl.startsWith('http://') || feedUrl.startsWith('https://')) {
    const res = await fetch(feedUrl);
    if (!res.ok) {
      const err = new Error(`Feed HTTP ${res.status}`);
      err.code = 'feed_http_error';
      throw err;
    }
    return res.text();
  }
  // Local file path (authorized export dropped on disk)
  const abs = path.isAbsolute(feedUrl) ? feedUrl : path.join(process.cwd(), feedUrl);
  return fs.readFileSync(abs, 'utf8');
}

export function createCsvFeedSkinScriptAdapter(env = process.env) {
  const feedUrl = env.SKIN_SCRIPT_FEED_URL || '';

  return {
    name: 'skin-script-csv-feed',
    capabilities: {
      catalog: true,
      inventory: false,
      dropship: false,
      orderStatus: false
    },

    async listCatalog() {
      const text = await loadFeedText(feedUrl);
      let drafts = [];
      const trimmed = text.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const data = JSON.parse(trimmed);
        const rows = Array.isArray(data) ? data : data.products || data.items || [];
        drafts = rows.map(rowToDraft).filter(Boolean);
      } else {
        const { rows } = parseCsv(text);
        drafts = rows.map(rowToDraft).filter(Boolean);
      }
      return drafts;
    },

    async getInventory() {
      const err = new Error('csv_feed adapter does not support inventory');
      err.code = 'capability_unsupported';
      throw err;
    },

    async createDropshipOrder() {
      const err = new Error(
        'csv_feed adapter does not support dropship — use mock/http for orders'
      );
      err.code = 'capability_unsupported';
      throw err;
    },

    async getOrderStatus() {
      const err = new Error('csv_feed adapter does not support order status');
      err.code = 'capability_unsupported';
      throw err;
    }
  };
}
