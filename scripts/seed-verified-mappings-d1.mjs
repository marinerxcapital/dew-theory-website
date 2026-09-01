#!/usr/bin/env node
/**
 * Seed VERIFIED Skin Script supplier mappings into the REMOTE production D1
 * database via `wrangler d1 execute --remote`.
 *
 * The file-backend `seed:verified-mappings` script cannot resolve the D1 binding
 * from plain Node (it falls back to data/runtime/commerce.json), so this operator
 * script targets production D1 directly. Requires Wrangler OAuth with d1 write.
 *
 * Idempotent: uses INSERT ... ON CONFLICT(product_id) DO UPDATE.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const WRANGLER_JS = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const REGISTRY = path.join(ROOT, 'data', 'supplier', 'skin-script-portal-urls.json');
const D1_NAME = 'dew-theory-commerce';

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

const portal = JSON.parse(readFileSync(REGISTRY, 'utf8'));
const verifiedAt = portal._meta?.verified_at || new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

const statements = [];
for (const p of portal.products || []) {
  if (!p.verified) {
    console.warn(`[skip] ${p.product_id} not verified in registry`);
    continue;
  }
  const size = p.variant || null;
  statements.push(`
INSERT INTO supplier_mappings
  (product_id, skin_script_sku, supplier_product_url, supplier_product_name,
   supplier_size, variant, expected_wholesale_price, verified, verified_at, active, updated_at)
VALUES
  (${sqlValue(p.product_id)}, ${sqlValue(p.skin_script_sku)}, ${sqlValue(p.supplier_product_url)},
   ${sqlValue(p.supplier_product_name)}, ${sqlValue(size)}, ${sqlValue(size)},
   ${sqlValue(p.expected_wholesale_price ?? null)}, 1, ${sqlValue(verifiedAt)}, 1, ${sqlValue(now)})
ON CONFLICT(product_id) DO UPDATE SET
  skin_script_sku=excluded.skin_script_sku,
  supplier_product_url=excluded.supplier_product_url,
  supplier_product_name=excluded.supplier_product_name,
  supplier_size=excluded.supplier_size,
  variant=excluded.variant,
  expected_wholesale_price=excluded.expected_wholesale_price,
  verified=1,
  verified_at=excluded.verified_at,
  active=1,
  updated_at=excluded.updated_at;`.trim());
}

if (!existsSync(WRANGLER_JS)) {
  console.error('ERROR: wrangler not found. Run `npm ci` in the repo root first.');
  process.exit(1);
}

const sqlFile = path.join(os.tmpdir(), `dew-theory-seed-verified-mappings-${Date.now()}.sql`);
writeFileSync(sqlFile, `${statements.join('\n')}\n`, 'utf8');

console.log(`[seed-verified-mappings:d1] ${new Date().toISOString()}`);
console.log(`Remote D1: ${D1_NAME} (cd55d01f-2c27-4b53-a8aa-9b10555d3b17)`);
console.log(`Seeding ${statements.length} verified mapping(s) from registry`);

const run = spawnSync(
  process.execPath,
  [WRANGLER_JS, 'd1', 'execute', D1_NAME, '--remote', '--file', sqlFile],
  { encoding: 'utf8', cwd: ROOT }
);
const out = run.stdout || run.stderr || run.error?.message || '';
console.log(out);
if (run.status !== 0) {
  console.error('wrangler d1 execute failed');
  process.exit(run.status || 1);
}

const verify = spawnSync(
  process.execPath,
  [
    WRANGLER_JS, 'd1', 'execute', D1_NAME, '--remote', '--command',
    'SELECT product_id, skin_script_sku, verified, expected_wholesale_price FROM supplier_mappings ORDER BY product_id'
  ],
  { encoding: 'utf8', cwd: ROOT }
);
console.log(verify.stdout || verify.stderr || '');
console.log('Done.');
