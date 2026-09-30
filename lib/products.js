// Client-safe product helpers. Server-only store access lives in lib/products-server.js.
import catalog from '../data/products.json' with { type: 'json' };

export const SHIPPING = catalog._meta.shipping_rule;
export const CATEGORIES = catalog.categories;
/** Keep private supplier metadata out of the client catalog. */
export function toPublicProduct(product) {
  const { wholesale_price, retail_price_confirmed, size_confirmed, manufacturer_name_note, ...publicProduct } = product;
  return publicProduct;
}
export const SEED_PRODUCTS = catalog.products.map(toPublicProduct);
export const PRODUCTS = SEED_PRODUCTS;

export function productById(id) {
  return SEED_PRODUCTS.find((p) => p.id === id) || null;
}

export function productsByCategory(category) {
  if (!category || category === 'all') return SEED_PRODUCTS;
  return SEED_PRODUCTS.filter((p) => p.category === category);
}

export function featured(ids) {
  return ids.map((id) => SEED_PRODUCTS.find((p) => p.id === id)).filter(Boolean);
}
