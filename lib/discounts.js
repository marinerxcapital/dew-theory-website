/**
 * Discount application logic. Stripe Promotion Codes back this in production;
 * locally we resolve against the store's DiscountCodes table.
 */
import { calculateShipping } from '@/lib/shipping';

/**
 * @param {number} subtotal
 * @param {{ type: 'percentage'|'fixed', value: number, active?: boolean } | null} code
 * @returns {{ discountAmount: number, code: object|null }}
 */
export function applyDiscount(subtotal, code) {
  if (!code || code.active === false) {
    return { discountAmount: 0, code: null };
  }
  let discountAmount = 0;
  if (code.type === 'percentage') {
    discountAmount = Math.round(subtotal * (code.value / 100) * 100) / 100;
  } else if (code.type === 'fixed') {
    discountAmount = Math.min(subtotal, Number(code.value));
  }
  return { discountAmount, code };
}

/**
 * Full cart math: subtotal → discount → shipping (pre-discount basis) → total.
 */
export function cartTotals(lineItems, discountCode = null) {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.unit_price) * Number(li.quantity),
    0
  );
  const { discountAmount, code } = applyDiscount(subtotal, discountCode);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping_fee = calculateShipping(subtotal, afterDiscount);
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
