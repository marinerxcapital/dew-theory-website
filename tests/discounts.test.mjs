/**
 * E3 — Discount engine tests (node:test).
 * percentage, fixed, expired, max_uses, inactive, case-insensitive
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyDiscount,
  resolveDiscountCode,
  cartTotals
} from '../lib/discounts.js';

const catalog = [
  {
    id: 'dc_pct',
    code: 'DEW15',
    type: 'percentage',
    value: 15,
    active: true,
    max_uses: null,
    uses_count: 0,
    expires_at: null
  },
  {
    id: 'dc_fixed',
    code: 'TAKE10',
    type: 'fixed',
    value: 10,
    active: true,
    max_uses: 100,
    uses_count: 3,
    expires_at: null
  },
  {
    id: 'dc_inactive',
    code: 'OLD20',
    type: 'percentage',
    value: 20,
    active: false,
    max_uses: null,
    uses_count: 0,
    expires_at: null
  },
  {
    id: 'dc_expired',
    code: 'GONE',
    type: 'percentage',
    value: 25,
    active: true,
    max_uses: null,
    uses_count: 0,
    expires_at: '2020-01-01T00:00:00.000Z'
  },
  {
    id: 'dc_maxed',
    code: 'ONCE',
    type: 'fixed',
    value: 5,
    active: true,
    max_uses: 1,
    uses_count: 1,
    expires_at: null
  },
  {
    id: 'dc_future',
    code: 'FUTURE',
    type: 'percentage',
    value: 10,
    active: true,
    max_uses: 5,
    uses_count: 2,
    expires_at: '2099-12-31T23:59:59.000Z'
  }
];

describe('applyDiscount — percentage', () => {
  it('applies 15% correctly', () => {
    const { discountAmount, code } = applyDiscount(100, {
      type: 'percentage',
      value: 15,
      code: 'DEW15',
      active: true
    });
    assert.equal(discountAmount, 15);
    assert.equal(code.code, 'DEW15');
  });

  it('rounds to cents', () => {
    const { discountAmount } = applyDiscount(33.33, {
      type: 'percentage',
      value: 15,
      active: true
    });
    // 33.33 * 0.15 = 4.9995 → 5.00
    assert.equal(discountAmount, 5);
  });

  it('caps percentage at 100%', () => {
    const { discountAmount } = applyDiscount(80, {
      type: 'percentage',
      value: 150,
      active: true
    });
    assert.equal(discountAmount, 80);
  });

  it('ignores zero or negative percentage', () => {
    assert.equal(applyDiscount(50, { type: 'percentage', value: 0, active: true }).discountAmount, 0);
    assert.equal(applyDiscount(50, { type: 'percentage', value: -5, active: true }).discountAmount, 0);
  });
});

describe('applyDiscount — fixed', () => {
  it('subtracts fixed amount', () => {
    const { discountAmount } = applyDiscount(40, {
      type: 'fixed',
      value: 10,
      code: 'TAKE10',
      active: true
    });
    assert.equal(discountAmount, 10);
  });

  it('cannot exceed subtotal', () => {
    const { discountAmount } = applyDiscount(8, {
      type: 'fixed',
      value: 25,
      active: true
    });
    assert.equal(discountAmount, 8);
  });

  it('ignores zero or negative fixed', () => {
    assert.equal(applyDiscount(50, { type: 'fixed', value: 0, active: true }).discountAmount, 0);
    assert.equal(applyDiscount(50, { type: 'fixed', value: -3, active: true }).discountAmount, 0);
  });
});

describe('applyDiscount — inactive / null', () => {
  it('returns zero for inactive', () => {
    const r = applyDiscount(100, { type: 'percentage', value: 50, active: false });
    assert.equal(r.discountAmount, 0);
    assert.equal(r.code, null);
  });

  it('returns zero for null/undefined code', () => {
    assert.equal(applyDiscount(100, null).discountAmount, 0);
    assert.equal(applyDiscount(100, undefined).discountAmount, 0);
  });

  it('treats missing active as active (truthy default for resolved codes)', () => {
    // applyDiscount only rejects active === false
    const r = applyDiscount(100, { type: 'percentage', value: 10 });
    assert.equal(r.discountAmount, 10);
  });
});

describe('resolveDiscountCode — case-insensitive', () => {
  it('matches lowercase input to stored code', () => {
    const r = resolveDiscountCode('dew15', catalog);
    assert.equal(r.ok, true);
    assert.equal(r.discount.code, 'DEW15');
    assert.equal(r.discount.type, 'percentage');
    assert.equal(r.discount.value, 15);
  });

  it('matches mixed case', () => {
    const r = resolveDiscountCode('  Take10  ', catalog);
    assert.equal(r.ok, true);
    assert.equal(r.discount.code, 'TAKE10');
  });

  it('rejects empty code', () => {
    const r = resolveDiscountCode('   ', catalog);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'discount_empty');
  });

  it('rejects unknown code', () => {
    const r = resolveDiscountCode('NOPE', catalog);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'discount_not_found');
  });
});

describe('resolveDiscountCode — inactive / expired / max_uses', () => {
  const now = new Date('2026-07-19T12:00:00.000Z');

  it('rejects inactive even if code string matches', () => {
    const r = resolveDiscountCode('old20', catalog, now);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'discount_inactive');
  });

  it('rejects expired codes', () => {
    const r = resolveDiscountCode('gone', catalog, now);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'discount_expired');
    assert.match(r.error, /expired/i);
  });

  it('rejects when uses_count >= max_uses', () => {
    const r = resolveDiscountCode('once', catalog, now);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'discount_exhausted');
  });

  it('allows code under max_uses with future expiry', () => {
    const r = resolveDiscountCode('future', catalog, now);
    assert.equal(r.ok, true);
    assert.equal(r.discount.value, 10);
  });

  it('allows unlimited max_uses (null)', () => {
    const r = resolveDiscountCode('DEW15', catalog, now);
    assert.equal(r.ok, true);
  });
});

describe('resolveDiscountCode → applyDiscount integration', () => {
  it('resolved percentage flows into cartTotals', () => {
    const r = resolveDiscountCode('dew15', catalog);
    assert.equal(r.ok, true);
    const t = cartTotals([{ unit_price: 100, quantity: 1 }], r.discount, 'pre_discount');
    assert.equal(t.discount_amount, 15);
    assert.equal(t.discount_code, 'DEW15');
    assert.equal(t.shipping_fee, 0);
    assert.equal(t.total, 85);
  });

  it('resolved fixed flows into cartTotals under free-ship threshold', () => {
    const r = resolveDiscountCode('take10', catalog);
    const t = cartTotals([{ unit_price: 40, quantity: 1 }], r.discount, 'pre_discount');
    assert.equal(t.discount_amount, 10);
    assert.equal(t.shipping_fee, 7);
    assert.equal(t.total, 37);
  });
});
