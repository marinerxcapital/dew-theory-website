// Client-safe product helpers. Server-only store access lives in lib/products-server.js.
import catalog from '../data/products.json' with { type: 'json' };

export const SHIPPING = catalog._meta.shipping_rule;
export const CATEGORIES = catalog.categories;
export const SEED_PRODUCTS = catalog.products;
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
