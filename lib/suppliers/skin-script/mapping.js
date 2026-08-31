/**
 * Verified Skin Script supplier product mapping.
 * Production RPA fulfillment requires verified=true mappings — never derived/mock SKUs.
 */
import {
  commerceGetSupplierMapping,
  commerceListSupplierMappings,
  commerceUpsertSupplierMapping
} from '../../commerce/index.js';

/**
 * @param {string} productId
 * @param {object} [catalogProduct]
 */
export async function getVerifiedMapping(productId, catalogProduct) {
  const row = await commerceGetSupplierMapping(productId);
  if (row && row.active !== 0 && row.verified === 1) {
    return normalizeMapping(row);
  }
  return null;
}

function normalizeMapping(row) {
  return {
    product_id: row.product_id,
    skin_script_sku: row.skin_script_sku,
    supplier_product_url: row.supplier_product_url || null,
    supplier_product_name: row.supplier_product_name || null,
    supplier_size: row.supplier_size || null,
    variant: row.variant || null,
    expected_wholesale_price: row.expected_wholesale_price ?? null,
    verified: row.verified === 1,
    verified_at: row.verified_at || null,
    active: row.active !== 0
  };
}

/**
 * Validate every line item has a verified mapping for production RPA mode.
 * @param {object[]} lines - { product_id, quantity, variant }
 */
export async function validateVerifiedMappingsForLines(lines, { requireVerified = true } = {}) {
  const missing = [];
  const unverified = [];
  const resolved = [];

  for (const line of lines || []) {
    const productId = line.product_id;
    if (!productId) {
      missing.push({ product_id: null, reason: 'missing_product_id' });
      continue;
    }
    const mapping = await commerceGetSupplierMapping(productId);
    if (!mapping || mapping.active === 0) {
      missing.push({ product_id: productId, reason: 'no_mapping' });
      continue;
    }
    if (requireVerified && mapping.verified !== 1) {
      unverified.push({ product_id: productId, skin_script_sku: mapping.skin_script_sku });
      continue;
    }
    if (mapping.variant && line.variant && mapping.variant !== line.variant) {
      missing.push({ product_id: productId, reason: 'variant_mismatch' });
      continue;
    }
    resolved.push({
      ...line,
      skin_script_sku: mapping.skin_script_sku,
      supplier_product_url: mapping.supplier_product_url,
      supplier_product_name: mapping.supplier_product_name,
      supplier_size: mapping.supplier_size,
      expected_wholesale_price: mapping.expected_wholesale_price,
      mapping_verified: mapping.verified === 1
    });
  }

  if (missing.length) {
    return {
      ok: false,
      code: 'blocked_supplier_mapping',
      missing,
      unverified,
      resolved
    };
  }
  if (unverified.length && requireVerified) {
    return {
      ok: false,
      code: 'blocked_supplier_mapping',
      missing: [],
      unverified,
      resolved
    };
  }

  return { ok: true, lines: resolved, missing: [], unverified: [] };
}

/**
 * Seed unverified template mappings from catalog (NOT production-eligible until verified).
 */
export async function seedMappingsFromCatalog(products) {
  const out = [];
  for (const p of products || []) {
    if (!p.id) continue;
    const existing = await commerceGetSupplierMapping(p.id);
    if (existing) {
      out.push(existing);
      continue;
    }
    const row = await commerceUpsertSupplierMapping({
      product_id: p.id,
      skin_script_sku: p.skin_script_sku || `UNVERIFIED-${p.id}`,
      supplier_product_url: null,
      supplier_product_name: p.name || null,
      supplier_size: p.size || null,
      expected_wholesale_price: p.wholesale_price ?? null,
      verified: 0,
      verified_at: null,
      active: 1
    });
    out.push(row);
  }
  return out;
}

export async function listAllMappings(opts) {
  const rows = await commerceListSupplierMappings(opts);
  return rows.map(normalizeMapping);
}

export async function upsertVerifiedMapping(mapping, { adminId } = {}) {
  const row = await commerceUpsertSupplierMapping({
    ...mapping,
    verified: mapping.verified ? 1 : 0,
    verified_at: mapping.verified ? mapping.verified_at || new Date().toISOString() : null,
    active: mapping.active === false ? 0 : 1
  });
  if (adminId) {
    const { commerceAudit } = await import('../../commerce/index.js');
    await commerceAudit(adminId, 'supplier_mapping.upsert', 'supplier_mappings', mapping.product_id, {
      verified: mapping.verified
    });
  }
  return normalizeMapping(row);
}
