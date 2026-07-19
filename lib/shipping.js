// Confirmed business rules from data/products.json and Addendum Section 5A.
// SHIPPING_THRESHOLD_BASIS is a named constant so the pre- vs post-discount
// comparison is a one-line change if the client decides the other way.

export const FLAT_SHIPPING_USD = 7;
export const FREE_SHIPPING_THRESHOLD_USD = 49;

/** @type {'pre_discount' | 'post_discount'} */
export const SHIPPING_THRESHOLD_BASIS = 'pre_discount';

/**
 * @param {number} subtotalBeforeDiscount
 * @param {number} [subtotalAfterDiscount]
 * @param {'pre_discount' | 'post_discount'} [basis] - override for tests / one-line flip
 * @returns {number} shipping fee in USD
 */
export function calculateShipping(
  subtotalBeforeDiscount,
  subtotalAfterDiscount,
  basis = SHIPPING_THRESHOLD_BASIS
) {
  const pre = Number(subtotalBeforeDiscount) || 0;
  const post =
    subtotalAfterDiscount == null ? null : Number(subtotalAfterDiscount) || 0;
  const use =
    basis === 'post_discount' && post != null ? post : pre;
  return use >= FREE_SHIPPING_THRESHOLD_USD ? 0 : FLAT_SHIPPING_USD;
}

export function formatMoney(n) {
  return `$${Number(n).toFixed(2).replace(/\.00$/, '')}`;
}
