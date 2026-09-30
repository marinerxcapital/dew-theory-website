import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, SEED_PRODUCTS, toPublicProduct } from '../lib/products.js';

describe('public product DTO', () => {
  it('strips wholesale and internal flags from toPublicProduct', () => {
    const raw = {
      id: 'demo',
      name: 'Demo',
      retail_price: 40,
      wholesale_price: 20,
      retail_price_confirmed: false,
      size_confirmed: false,
      manufacturer_name_note: 'internal',
      category: 'Serum'
    };
    const pub = toPublicProduct(raw);
    assert.equal(pub.retail_price, 40);
    assert.equal(pub.name, 'Demo');
    assert.equal('wholesale_price' in pub, false);
    assert.equal('retail_price_confirmed' in pub, false);
    assert.equal('size_confirmed' in pub, false);
    assert.equal('manufacturer_name_note' in pub, false);
  });

  it('client PRODUCTS seed never includes wholesale_price', () => {
    assert.ok(PRODUCTS.length > 0);
    assert.ok(SEED_PRODUCTS.length > 0);
    for (const p of PRODUCTS) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(p, 'wholesale_price'),
        false,
        `${p.id} must not expose wholesale_price`
      );
    }
  });
});
