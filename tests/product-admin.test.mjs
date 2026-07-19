/**
 * G2 — Product admin validation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateAndNormalizeProduct,
  defaultRetailFromWholesale
} from '../lib/product-admin.js';
import { isShopVisible } from '../lib/shop.js';

describe('defaultRetailFromWholesale', () => {
  it('doubles wholesale', () => {
    assert.equal(defaultRetailFromWholesale(12.5), 25);
  });
  it('returns null for invalid', () => {
    assert.equal(defaultRetailFromWholesale('x'), null);
  });
});

describe('validateAndNormalizeProduct — create', () => {
  it('requires id and name', () => {
    const r = validateAndNormalizeProduct({ wholesale_price: 10 }, { isNew: true });
    assert.equal(r.ok, false);
    assert.equal(r.code, 'id_required');
  });

  it('rejects bad slug', () => {
    const r = validateAndNormalizeProduct(
      { id: 'Bad ID!', name: 'X', wholesale_price: 10 },
      { isNew: true }
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, 'id_invalid');
  });

  it('rejects duplicate id', () => {
    const r = validateAndNormalizeProduct(
      { id: 'serum-a', name: 'A', wholesale_price: 10 },
      { isNew: true, existingIds: ['serum-a'] }
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, 'id_exists');
  });

  it('auto retail ×2 when retail omitted', () => {
    const r = validateAndNormalizeProduct(
      { id: 'serum-a', name: 'A', wholesale_price: 14 },
      { isNew: true }
    );
    assert.equal(r.ok, true);
    assert.equal(r.product.retail_price, 28);
    assert.equal(r.product.active, true);
  });

  it('keeps explicit retail', () => {
    const r = validateAndNormalizeProduct(
      { id: 'serum-a', name: 'A', wholesale_price: 14, retail_price: 30 },
      { isNew: true }
    );
    assert.equal(r.product.retail_price, 30);
  });

  it('rejects negative prices', () => {
    const r = validateAndNormalizeProduct(
      { id: 'serum-a', name: 'A', wholesale_price: -1 },
      { isNew: true }
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, 'wholesale_invalid');
  });

  it('accepts active false', () => {
    const r = validateAndNormalizeProduct(
      { id: 'serum-a', name: 'A', wholesale_price: 10, active: false },
      { isNew: true }
    );
    assert.equal(r.product.active, false);
  });
});

describe('isShopVisible reflects active + discontinued', () => {
  it('hides inactive', () => {
    assert.equal(isShopVisible({ active: false, stock_status: 'in_stock' }), false);
  });
  it('hides discontinued', () => {
    assert.equal(isShopVisible({ active: true, stock_status: 'discontinued' }), false);
  });
  it('shows in-stock active', () => {
    assert.equal(isShopVisible({ active: true, stock_status: 'in_stock' }), true);
  });
});
