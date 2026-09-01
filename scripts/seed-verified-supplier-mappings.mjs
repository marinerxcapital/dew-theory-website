#!/usr/bin/env node
/**
 * Seed VERIFIED supplier mappings from data/supplier/skin-script-portal-urls.json.
 * Requires portal recon completed (verified=true in registry).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resetCommerceBackendForTests } from '../lib/commerce/index.js';
import { upsertVerifiedMapping } from '../lib/suppliers/skin-script/mapping.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const portal = JSON.parse(
  readFileSync(path.join(ROOT, 'data/supplier/skin-script-portal-urls.json'), 'utf8')
);

process.env.STORE_BACKEND = process.env.STORE_BACKEND || 'file';
resetCommerceBackendForTests();

const verifiedAt = portal._meta?.verified_at || new Date().toISOString().slice(0, 10);
const rows = [];
for (const p of portal.products || []) {
  if (!p.verified) {
    console.warn(`[skip] ${p.product_id} not marked verified in registry`);
    continue;
  }
  const row = await upsertVerifiedMapping({
    product_id: p.product_id,
    skin_script_sku: p.skin_script_sku,
    supplier_product_url: p.supplier_product_url,
    supplier_product_name: p.supplier_product_name,
    supplier_size: p.variant || null,
    variant: p.variant || null,
    expected_wholesale_price: p.expected_wholesale_price ?? null,
    verified: true,
    verified_at: verifiedAt,
    active: true
  });
  rows.push(row);
}

console.log(`[seed-verified-supplier-mappings] ${new Date().toISOString()}`);
console.log(`Seeded ${rows.length} verified mapping(s)`);
for (const row of rows) {
  console.log(`  - ${row.product_id} → SKU ${row.skin_script_sku} @ $${row.expected_wholesale_price}`);
}
