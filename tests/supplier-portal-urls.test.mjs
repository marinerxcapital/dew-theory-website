import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const portal = JSON.parse(
  readFileSync(path.join(ROOT, 'data/supplier/skin-script-portal-urls.json'), 'utf8')
);
const catalog = JSON.parse(readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));

describe('skin-script portal URL registry', () => {
  it('covers every catalog product', () => {
    const catalogIds = new Set(catalog.products.map((p) => p.id));
    const portalIds = new Set(portal.products.map((p) => p.product_id));
    for (const id of catalogIds) {
      assert.ok(portalIds.has(id), `missing portal URL for ${id}`);
    }
  });

  it('uses skinscript.com product URLs', () => {
    for (const p of portal.products) {
      assert.match(p.supplier_product_url, /^https:\/\/skinscript\.com\/product\//);
      assert.ok(p.skin_script_sku, `SKU missing for ${p.product_id}`);
    }
  });

  it('marks verified products with portal SKUs', () => {
    const verified = portal.products.filter((p) => p.verified);
    assert.equal(verified.length, 8);
  });
});
