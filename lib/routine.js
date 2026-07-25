/**
 * Routine ordering helpers — category sequence for "complete the routine".
 * Categories match data/products.json; no invented product recommendations beyond catalog.
 */

export const ROUTINE_ORDER = [
  'Cleanser',
  'Toner',
  'Exfoliant',
  'Serum',
  'Mask',
  'Moisturizer',
  'Lip Treatment',
  'SPF'
];

function categoryRank(category) {
  const i = ROUTINE_ORDER.indexOf(category);
  return i === -1 ? 99 : i;
}

/**
 * @param {Array<{ id: string, category?: string, active?: boolean, stock_status?: string }>} products
 * @param {string} productId
 * @param {{ isVisible?: (p: object) => boolean, limit?: number }} [opts]
 */
export function suggestRoutineComplements(products, productId, opts = {}) {
  const limit = opts.limit ?? 3;
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  const current = products.find((p) => p.id === productId);
  if (!current) return [];

  const rank = categoryRank(current.category);
  const pool = products.filter((p) => p.id !== productId && isVisible(p));

  // Prefer next steps later in the routine, then earlier steps (build around this product).
  const scored = pool.map((p) => {
    const r = categoryRank(p.category);
    const sameCategory = p.category === current.category ? 1 : 0;
    const after = r > rank ? 0 : 2;
    const distance = Math.abs(r - rank);
    return { p, score: sameCategory * 10 + after * 3 + distance };
  });

  scored.sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name));
  return scored.slice(0, limit).map((s) => s.p);
}

/**
 * @param {Array} cartItems - { product_id, category? }
 * @param {Array} catalog
 * @param {{ isVisible?: Function, limit?: number }} [opts]
 */
export function suggestMissingRoutineSteps(cartItems, catalog, opts = {}) {
  const limit = opts.limit ?? 3;
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  const inCart = new Set((cartItems || []).map((i) => i.product_id));
  const categoriesPresent = new Set(
    (cartItems || [])
      .map((i) => {
        const p = catalog.find((c) => c.id === i.product_id);
        return p?.category || i.category;
      })
      .filter(Boolean)
  );

  const missingCategories = ROUTINE_ORDER.filter((c) => !categoriesPresent.has(c));
  const picks = [];

  for (const cat of missingCategories) {
    if (picks.length >= limit) break;
    const candidate = catalog.find(
      (p) => p.category === cat && isVisible(p) && !inCart.has(p.id)
    );
    if (candidate) picks.push(candidate);
  }

  return picks;
}
