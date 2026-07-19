/**
 * Storefront visibility helpers (client-safe).
 * Discontinued products are hidden from browse; out of stock stay visible with a badge.
 */

export function isShopVisible(product) {
  if (!product) return false;
  if (product.active === false) return false;
  if (product.stock_status === 'discontinued') return false;
  return true;
}

export function stockLabel(product) {
  const s = product?.stock_status || 'in_stock';
  if (s === 'out_of_stock') return 'Out of stock';
  if (s === 'discontinued') return 'Discontinued';
  return null;
}

export function isOutOfStock(product) {
  return (product?.stock_status || 'in_stock') === 'out_of_stock';
}
