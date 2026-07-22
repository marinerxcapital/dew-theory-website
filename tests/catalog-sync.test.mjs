/**
 * Catalog sync plan + mock adapter
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { planCatalogSync, draftToProductBody } from '../lib/catalog-sync.js';
import { createMockSkinScriptAdapter } from '../lib/suppliers/skin-script/mock-adapter.js';
import { getSkinScriptAdapter } from '../lib/suppliers/skin-script/index.js';
import { deterministicMapRow } from '../lib/ai/map-catalog-rows.js';

describe('mock adapter listCatalog', () => {
  it('returns drafts with skin_script_sku and source sync fields', async () => {
    const a = createMockSkinScriptAdapter();
    const drafts = await a.listCatalog();
    assert.ok(drafts.length >= 8);
    assert.ok(drafts.every((d) => d.skin_script_sku && d.name));
    assert.equal(a.capabilities.dropship, true);
  });
});

describe('getSkinScriptAdapter factory', () => {
  it('defaults to mock', () => {
    const a = getSkinScriptAdapter('mock');
    assert.equal(a.name, 'skin-script-mock');
  });
  it('rejects unknown mode', () => {
    assert.throws(() => getSkinScriptAdapter('scrape'), /Unknown/);
  });
});

describe('planCatalogSync', () => {
  it('plans creates for empty store', async () => {
    const drafts = await createMockSkinScriptAdapter().listCatalog();
    const plan = planCatalogSync(drafts, []);
    assert.ok(plan.create.length >= 8);
    assert.equal(plan.error.length, 0);
    assert.ok(plan.create[0].product.skin_script_sku);
    assert.equal(plan.create[0].product.source, 'sync');
  });

  it('skips unchanged products', async () => {
    const drafts = await createMockSkinScriptAdapter().listCatalog();
    const existing = drafts.map((d) => ({
      ...draftToProductBody(d),
      source: 'sync'
    }));
    // validate shape needs retail etc — use plan create products
    const first = planCatalogSync(drafts, []);
    const products = first.create.map((c) => c.product);
    const plan = planCatalogSync(drafts, products);
    assert.equal(plan.create.length, 0);
    assert.ok(plan.skip.length >= 8);
  });

  it('errors on missing sku', () => {
    const plan = planCatalogSync([{ name: 'X', wholesale_price: 10 }], []);
    assert.equal(plan.error.length, 1);
    assert.equal(plan.error[0].reason, 'missing_skin_script_sku');
  });
});

describe('deterministicMapRow', () => {
  it('maps messy aliases', () => {
    const d = deterministicMapRow({
      product_name: 'Test Serum',
      cost: 12,
      SKU: 'SS-TEST'
    });
    assert.equal(d.name, 'Test Serum');
    assert.equal(d.wholesale_price, 12);
    assert.equal(d.skin_script_sku, 'SS-TEST');
  });
});
