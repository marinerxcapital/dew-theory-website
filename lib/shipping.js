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
 * @returns {number} shipping fee in USD
 */
export function calculateShipping(subtotalBeforeDiscount, subtotalAfterDiscount) {
  const basis =
    SHIPPING_THRESHOLD_BASIS === 'post_discount' && subtotalAfterDiscount != null
      ? subtotalAfterDiscount
      : subtotalBeforeDiscount;
  return basis >= FREE_SHIPPING_THRESHOLD_USD ? 0 : FLAT_SHIPPING_USD;
}

export function formatMoney(n) {
  return `$${Number(n).toFixed(2).replace(/\.00$/, '')}`;
}
