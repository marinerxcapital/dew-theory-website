/**
 * Curated Dew Theory catalog allowlist.
 * Sync may auto-list / refresh only these product_id + skin_script_sku pairs.
 */

import allowlistDoc from '../data/catalog-allowlist.json' with { type: 'json' };

/**
 * @typedef {object} CatalogAllowlistEntry
 * @property {string} product_id
 * @property {string} skin_script_sku
 * @property {boolean} sync_enabled
 * @property {string} [supplier_product_url]
 */

/**
 * @param {object} [doc]
 */
export function loadCatalogAllowlist(doc = allowlistDoc) {
  const products = Array.isArray(doc?.products) ? doc.products : [];
  return {
    meta: doc?._meta || {},
    products: products.map(normalizeEntry).filter(Boolean)
  };
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const product_id = String(raw.product_id || raw.id || '')
    .trim()
    .toLowerCase();
  const skin_script_sku = String(raw.skin_script_sku || raw.sku || '').trim();
  if (!product_id || !skin_script_sku) return null;
  return {
    product_id,
    skin_script_sku,
    sync_enabled: raw.sync_enabled !== false && raw.sync_enabled !== 0 && raw.sync_enabled !== 'false',
    supplier_product_url: raw.supplier_product_url ? String(raw.supplier_product_url) : null
  };
}

/**
 * @param {object} [doc]
 * @returns {CatalogAllowlistEntry[]}
 */
export function getEnabledAllowlistEntries(doc = allowlistDoc) {
  return loadCatalogAllowlist(doc).products.filter((p) => p.sync_enabled);
}

/**
 * @param {string} productId
 * @param {object} [doc]
 */
export function getAllowlistSkuForProductId(productId, doc = allowlistDoc) {
  const id = String(productId || '')
    .trim()
    .toLowerCase();
  if (!id) return null;
  const row = loadCatalogAllowlist(doc).products.find((p) => p.product_id === id);
  return row?.skin_script_sku || null;
}

/**
 * @param {{ product_id?: string, id?: string, skin_script_sku?: string, sku?: string }} ref
 * @param {object} [doc]
 */
export function findAllowlistEntry(ref, doc = allowlistDoc) {
  const productId = String(ref?.product_id || ref?.id || '')
    .trim()
    .toLowerCase();
  const sku = String(ref?.skin_script_sku || ref?.sku || '').trim();
  const all = loadCatalogAllowlist(doc).products;

  if (productId) {
    const byId = all.find((p) => p.product_id === productId);
    if (byId) return byId;
  }
  if (sku) {
    const bySku = all.find((p) => p.skin_script_sku === sku);
    if (bySku) return bySku;
  }
  return null;
}

/**
 * True only when the ref maps to an enabled allowlist row.
 * @param {{ product_id?: string, id?: string, skin_script_sku?: string, sku?: string }} ref
 * @param {object} [doc]
 */
export function isAllowlisted(ref, doc = allowlistDoc) {
  const entry = findAllowlistEntry(ref, doc);
  return Boolean(entry?.sync_enabled);
}

/**
 * Slim payload for RPA catalog fetch (allowlisted SKUs only).
 * @param {object} [doc]
 */
export function allowlistCatalogRequestItems(doc = allowlistDoc) {
  return getEnabledAllowlistEntries(doc).map((p) => ({
    product_id: p.product_id,
    sku: p.skin_script_sku,
    skin_script_sku: p.skin_script_sku,
    supplier_product_url: p.supplier_product_url
  }));
}
