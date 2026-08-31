#!/usr/bin/env node
/**
 * Seed supplier mappings with verified public portal URLs from data/supplier/skin-script-portal-urls.json.
 * SKUs remain unverified (verified=0) until authenticated portal confirms wholesale SKU + price.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getCommerceBackend, resetCommerceBackendForTests } from '../lib/commerce/index.js';
import { commerceUpsertSupplierMapping } from '../lib/commerce/index.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const portal = JSON.parse(
  readFileSync(path.join(ROOT, 'data/supplier/skin-script-portal-urls.json'), 'utf8')
);

process.env.STORE_BACKEND = process.env.STORE_BACKEND || 'file';
resetCommerceBackendForTests();

const rows = [];
for (const p of portal.products || []) {
  const row = await commerceUpsertSupplierMapping({
    product_id: p.product_id,
    skin_script_sku: p.supplier_slug,
    supplier_product_url: p.supplier_product_url,
    supplier_product_name: p.supplier_product_name,
    supplier_size: p.supplier_size || null,
    expected_wholesale_price: p.expected_wholesale_price ?? null,
    verified: 0,
    verified_at: null,
    active: 1
  });
  rows.push(row);
}

console.log(`[seed-portal-url-mappings] ${new Date().toISOString()}`);
console.log(`Portal base: ${portal._meta?.portal_base_url}`);
console.log(`Seeded ${rows.length} URL mapping(s) (verified=0 — confirm SKU/price after login)`);
for (const row of rows) {
  console.log(`  - ${row.product_id} → ${row.supplier_product_url}`);
}
