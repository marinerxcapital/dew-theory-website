/**
 * Discount application + code resolution (pure / store-agnostic).
 * Stripe Promotion Codes back this in production; locally we resolve against DiscountCodes.
 */
import { calculateShipping, SHIPPING_THRESHOLD_BASIS } from './shipping.js';

/**
 * Apply a resolved discount object to a subtotal.
 * @param {number} subtotal
 * @param {{ type: 'percentage'|'fixed', value: number, active?: boolean, code?: string } | null} code
 * @returns {{ discountAmount: number, code: object|null }}
 */
export function applyDiscount(subtotal, code) {
  if (!code || code.active === false) {
    return { discountAmount: 0, code: null };
  }
  const sub = Math.max(0, Number(subtotal) || 0);
  let discountAmount = 0;
  if (code.type === 'percentage') {
    const pct = Number(code.value);
    if (!Number.isFinite(pct) || pct <= 0) {
      return { discountAmount: 0, code: null };
    }
    // Cap at 100%
    const safe = Math.min(100, pct);
    discountAmount = Math.round(sub * (safe / 100) * 100) / 100;
  } else if (code.type === 'fixed') {
    const amt = Number(code.value);
    if (!Number.isFinite(amt) || amt <= 0) {
      return { discountAmount: 0, code: null };
    }
    discountAmount = Math.min(sub, amt);
  }
  return { discountAmount, code };
}

/**
 * Resolve a raw promo string against a list of discount records (case-insensitive).
 * Checks active, expires_at, max_uses — pure function for unit tests.
 *
 * @param {string} rawCode
 * @param {Array} catalog - discount_codes rows
 * @param {Date} [now]
 * @returns {{ ok: true, discount: object } | { ok: false, error: string, code: string }}
 */
export function resolveDiscountCode(rawCode, catalog = [], now = new Date()) {
  const code = String(rawCode || '')
    .trim()
    .toUpperCase();
  if (!code) {
    return { ok: false, error: 'Enter a code', code: 'discount_empty' };
  }

  const list = Array.isArray(catalog) ? catalog : [];
  const match = list.find((d) => String(d.code || '').toUpperCase() === code);

  if (!match) {
    return { ok: false, error: 'Code not found or inactive', code: 'discount_not_found' };
  }

  if (match.active === false) {
    return { ok: false, error: 'Code not found or inactive', code: 'discount_inactive' };
  }

  if (match.expires_at) {
    const exp = new Date(match.expires_at);
    if (!Number.isNaN(exp.getTime()) && exp < now) {
      return { ok: false, error: 'Code expired', code: 'discount_expired' };
    }
  }

  if (match.max_uses != null) {
    const max = Number(match.max_uses);
    const used = Number(match.uses_count) || 0;
    if (Number.isFinite(max) && used >= max) {
      return { ok: false, error: 'Code fully redeemed', code: 'discount_exhausted' };
    }
  }

  return {
    ok: true,
    discount: {
      id: match.id,
      code: match.code,
      type: match.type,
      value: match.value,
      active: match.active !== false,
      referrer_customer_id: match.referrer_customer_id ?? null,
      stripe_promotion_code_id: match.stripe_promotion_code_id ?? null
    }
  };
}

/**
 * Full cart math: subtotal → discount → shipping → total.
 */
export function cartTotals(
  lineItems,
  discountCode = null,
  shippingBasis = SHIPPING_THRESHOLD_BASIS
) {
  const subtotal = (lineItems || []).reduce(
    (sum, li) => sum + Number(li.unit_price) * Number(li.quantity),
    0
  );
  const { discountAmount, code } = applyDiscount(subtotal, discountCode);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping_fee = calculateShipping(subtotal, afterDiscount, shippingBasis);
  const total = afterDiscount + shipping_fee;
  return {
    subtotal: round2(subtotal),
    discount_amount: round2(discountAmount),
    discount_code: code?.code || null,
    shipping_fee: round2(shipping_fee),
    total: round2(total)
  };
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}
