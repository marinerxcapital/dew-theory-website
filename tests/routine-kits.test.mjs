import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listResolvedKits, resolveKit, STARTER_KITS } from '../lib/routine-kits.js';

const catalog = [
  {
    id: 'green-tea-citrus-cleanser',
    name: 'Cleanser',
    retail_price: 32,
    active: true,
    stock_status: 'in_stock'
  },
  {
    id: 'hydrating-skin-serum',
    name: 'Serum',
    retail_price: 50,
    active: true,
    stock_status: 'in_stock'
  },
  {
    id: 'ageless-moisturizer',
    name: 'Moisturizer',
    retail_price: 40,
    active: true,
    stock_status: 'in_stock'
  },
  {
    id: 'mandelic-brightening-serum',
    name: 'Mandelic',
    retail_price: 48,
    active: true,
    stock_status: 'in_stock'
  },
  {
    id: 'sheer-protection-spf',
    name: 'SPF',
    retail_price: 30,
    active: true,
    stock_status: 'in_stock'
  }
];

describe('routine kits', () => {
  it('defines starter kits with real ids', () => {
    assert.ok(STARTER_KITS.length >= 1);
    for (const k of STARTER_KITS) {
      assert.ok(k.product_ids.length >= 2);
    }
  });

  it('resolves barrier kit subtotal', () => {
    const kit = resolveKit(catalog, 'starter-barrier');
    assert.ok(kit);
    assert.equal(kit.products.length, 3);
    assert.equal(kit.subtotal, 32 + 50 + 40);
    assert.equal(kit.complete, true);
  });

  it('lists only resolvable kits', () => {
    const list = listResolvedKits(catalog);
    assert.ok(list.length >= 1);
    assert.ok(list.every((k) => k.products.length > 0));
  });
});
