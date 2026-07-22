import { readStore } from './store.js';
import { SEED_PRODUCTS } from './products.js';

/** Prefer admin/runtime store; fall back to seed JSON. Server-only. */
export function getProducts() {
  try {
    const store = readStore();
    if (store.products?.length) return store.products;
  } catch {
    /* ignore */
  }
  return SEED_PRODUCTS;
}

export function getProduct(id) {
  return getProducts().find((p) => p.id === id) || null;
}

export function getFeaturedProducts(ids) {
  const all = getProducts();
  return ids.map((id) => all.find((p) => p.id === id)).filter(Boolean);
}
