/**
 * E2 — Shipping + discount/shipping matrix (node:test).
 * Run: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateShipping,
  FLAT_SHIPPING_USD,
  FREE_SHIPPING_THRESHOLD_USD,
  SHIPPING_THRESHOLD_BASIS,
  formatMoney
} from '../lib/shipping.js';
import { cartTotals, applyDiscount } from '../lib/discounts.js';

describe('calculateShipping — pre_discount basis (production default)', () => {
  it('exports confirmed constants', () => {
    assert.equal(FLAT_SHIPPING_USD, 7);
    assert.equal(FREE_SHIPPING_THRESHOLD_USD, 49);
    assert.equal(SHIPPING_THRESHOLD_BASIS, 'pre_discount');
  });

  it('charges $7 below threshold', () => {
    assert.equal(calculateShipping(0), 7);
    assert.equal(calculateShipping(48.99), 7);
    assert.equal(calculateShipping(1), 7);
  });

  it('waives shipping at exactly $49', () => {
    assert.equal(calculateShipping(49), 0);
  });

  it('waives shipping above $49', () => {
    assert.equal(calculateShipping(49.01), 0);
    assert.equal(calculateShipping(100), 0);
  });

  it('uses pre-discount subtotal even when post-discount is under threshold', () => {
    // $56 pre → free; 15% off → $47.6 post — still free under pre_discount
    assert.equal(calculateShipping(56, 47.6, 'pre_discount'), 0);
  });

  it('charges when pre-discount is under threshold even if post is higher (n/a)', () => {
    assert.equal(calculateShipping(40, 40, 'pre_discount'), 7);
  });
});

describe('calculateShipping — post_discount basis flip', () => {
  it('can flip to post_discount via third argument', () => {
    // pre $56 free if pre; post $47.6 pays shipping if post basis
    assert.equal(calculateShipping(56, 47.6, 'post_discount'), 7);
    assert.equal(calculateShipping(56, 49, 'post_discount'), 0);
    assert.equal(calculateShipping(40, 50, 'post_discount'), 0);
  });

  it('falls back to pre when post is null under post_discount', () => {
    assert.equal(calculateShipping(49, null, 'post_discount'), 0);
    assert.equal(calculateShipping(48, null, 'post_discount'), 7);
  });
});

describe('formatMoney', () => {
  it('formats whole dollars without cents', () => {
    assert.equal(formatMoney(7), '$7');
    assert.equal(formatMoney(49), '$49');
  });

  it('keeps cents when needed', () => {
    assert.equal(formatMoney(7.5), '$7.50');
    assert.equal(formatMoney(32.99), '$32.99');
  });
});

describe('discount + shipping matrix (cartTotals)', () => {
  const lines = (subtotal) => [{ unit_price: subtotal, quantity: 1 }];

  it('no discount, under threshold → $7 ship', () => {
    const t = cartTotals(lines(48), null, 'pre_discount');
    assert.equal(t.subtotal, 48);
    assert.equal(t.discount_amount, 0);
    assert.equal(t.shipping_fee, 7);
    assert.equal(t.total, 55);
  });

  it('no discount, at threshold → free ship', () => {
    const t = cartTotals(lines(49), null, 'pre_discount');
    assert.equal(t.shipping_fee, 0);
    assert.equal(t.total, 49);
  });

  it('15% off on $56: free ship on pre_discount (promo cannot remove free ship)', () => {
    const t = cartTotals(lines(56), { type: 'percentage', value: 15, code: 'DEW15', active: true }, 'pre_discount');
    assert.equal(t.subtotal, 56);
    assert.equal(t.discount_amount, 8.4);
    assert.equal(t.shipping_fee, 0); // pre still 56 ≥ 49
    assert.equal(t.total, 47.6);
    assert.equal(t.discount_code, 'DEW15');
  });

  it('15% off on $56 with post_discount basis → shipping returns', () => {
    const t = cartTotals(lines(56), { type: 'percentage', value: 15, code: 'DEW15', active: true }, 'post_discount');
    assert.equal(t.discount_amount, 8.4);
    assert.equal(t.shipping_fee, 7); // post 47.6 < 49
    assert.equal(t.total, 54.6);
  });

  it('fixed $10 off under threshold still pays flat ship (pre basis)', () => {
    const t = cartTotals(lines(40), { type: 'fixed', value: 10, code: 'TEN', active: true }, 'pre_discount');
    assert.equal(t.subtotal, 40);
    assert.equal(t.discount_amount, 10);
    assert.equal(t.shipping_fee, 7);
    assert.equal(t.total, 37);
  });

  it('fixed discount cannot exceed subtotal', () => {
    const { discountAmount } = applyDiscount(20, { type: 'fixed', value: 50, active: true });
    assert.equal(discountAmount, 20);
  });

  it('inactive discount is ignored', () => {
    const t = cartTotals(lines(100), { type: 'percentage', value: 50, code: 'X', active: false }, 'pre_discount');
    assert.equal(t.discount_amount, 0);
    assert.equal(t.shipping_fee, 0);
    assert.equal(t.total, 100);
  });

  it('multi-line subtotal drives shipping', () => {
    const t = cartTotals(
      [
        { unit_price: 32, quantity: 1 },
        { unit_price: 24, quantity: 1 }
      ],
      null,
      'pre_discount'
    );
    assert.equal(t.subtotal, 56);
    assert.equal(t.shipping_fee, 0);
    assert.equal(t.total, 56);
  });
});
