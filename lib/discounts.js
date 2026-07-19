/**
 * Discount application logic. Stripe Promotion Codes back this in production;
 * locally we resolve against the store's DiscountCodes table.
 */
import { calculateShipping, SHIPPING_THRESHOLD_BASIS } from './shipping.js';

/**
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
    discountAmount = Math.round(sub * (Number(code.value) / 100) * 100) / 100;
  } else if (code.type === 'fixed') {
    discountAmount = Math.min(sub, Number(code.value) || 0);
  }
  return { discountAmount, code };
}

/**
 * Full cart math: subtotal → discount → shipping → total.
 * @param {Array<{ unit_price: number, quantity: number }>} lineItems
 * @param {object|null} discountCode
 * @param {'pre_discount'|'post_discount'} [shippingBasis]
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
