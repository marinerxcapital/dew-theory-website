#!/usr/bin/env node
/**
 * Seed UNVERIFIED supplier mapping templates from data/products.json.
 * Production RPA requires verified=1 — operator must confirm real SKUs/URLs (Codex TASK-03).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getCommerceBackend, resetCommerceBackendForTests } from '../lib/commerce/index.js';
import { seedMappingsFromCatalog } from '../lib/suppliers/skin-script/mapping.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const catalog = JSON.parse(readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));

process.env.STORE_BACKEND = process.env.STORE_BACKEND || 'file';
resetCommerceBackendForTests();

const products = catalog.products || [];
const rows = await seedMappingsFromCatalog(products);

console.log(`[seed-supplier-mapping-templates] ${new Date().toISOString()}`);
console.log(`Seeded ${rows.length} mapping template(s) (verified=0 — NOT production-eligible)`);
for (const row of rows) {
  console.log(`  - ${row.product_id} → ${row.skin_script_sku} (verified=${row.verified})`);
}
console.log('\nCodex/owner: update verified=1 after portal recon with real SKU/URL/price.');
