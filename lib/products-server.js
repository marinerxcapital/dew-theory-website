import { readStore } from '@/lib/store';
import { SEED_PRODUCTS } from '@/lib/products';

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
