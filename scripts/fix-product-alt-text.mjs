#!/usr/bin/env node
/**
 * Rewrite product image alt text that still describes the retired CLINICAL NOIR
 * photography ("on a black studio background with a hot pink rim light").
 *
 * The images are now transparent cut-outs of the real Skin Script packaging, so
 * the old text is simply false. This replaces it with a description that makes
 * no claim about lighting or background, and leaves every other field alone.
 *
 *   node scripts/fix-product-alt-text.mjs --dry-run
 *   node scripts/fix-product-alt-text.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILES = ['data/products.json', 'data/runtime/store.json'];
const STALE = /black studio|hot pink|rim light|\bvoid\b/i;
const dryRun = process.argv.includes('--dry-run');

function altFor(product) {
  return `Skin Script ${product.name} product photo`;
}

let totalChanged = 0;

for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.log(rel + ': not present, skipped');
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const doc = JSON.parse(raw);
  const products = Array.isArray(doc) ? doc : doc.products || [];

  let changed = 0;
  for (const product of products) {
    if (typeof product.image_alt === 'string' && STALE.test(product.image_alt)) {
      const next = altFor(product);
      if (!dryRun) product.image_alt = next;
      changed += 1;
    }
  }

  if (changed && !dryRun) {
    const indent = raw.startsWith('{') && /\n\s\s"/.test(raw) ? 2 : 2;
    fs.writeFileSync(file, JSON.stringify(doc, null, indent) + '\n');
  }

  totalChanged += changed;
  console.log(
    rel + ': ' + changed + ' alt text value(s) ' + (dryRun ? 'would be updated' : 'updated')
  );
}

console.log('\n' + totalChanged + ' value(s) ' + (dryRun ? 'matched' : 'rewritten'));
