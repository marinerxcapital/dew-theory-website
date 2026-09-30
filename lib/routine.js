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

/**
 * Display sequence for the routine-position timeline (product detail page).
 *
 * Superset of ROUTINE_ORDER: it adds Eye Treatment and Spot Treatment, and leaves
 * out Kit, which is a bundle rather than a single step. Every entry exists as a
 * real category in data/products.json — nothing here is invented.
 *
 * `time` labels follow the catalog's own copy, never a guess:
 *   - SPF "Apply in the morning"                        -> AM
 *   - Exfoliant "once daily (AM or PM)"                 -> AM or PM
 *   - Toner / Serum / Moisturizer "morning and evening" -> AM + PM
 *   - Mask / Lip Treatment follow the PM path used by
 *     defaultRoutineTemplate() in lib/skin-quiz.js      -> PM
 * Categories whose catalog copy states no time carry an empty label rather than
 * an invented frequency.
 */
export const ROUTINE_TIMELINE = [
  { category: 'Cleanser', time: 'AM + PM' },
  { category: 'Toner', time: 'AM + PM' },
  { category: 'Exfoliant', time: 'AM or PM' },
  { category: 'Serum', time: 'AM + PM' },
  { category: 'Eye Treatment', time: '' },
  { category: 'Mask', time: 'PM' },
  { category: 'Spot Treatment', time: '' },
  { category: 'Moisturizer', time: 'AM + PM' },
  { category: 'Lip Treatment', time: 'PM' },
  { category: 'SPF', time: 'AM' }
];

/**
 * Where a product category sits in the professional layering order.
 *
 * @param {string} category
 * @returns {{
 *   index: number, position: number, total: number, label: string, time: string,
 *   before: string | null, after: string | null
 * } | null} null for categories that are not a routine step (e.g. Kit)
 */
export function routinePlacement(category) {
  const index = ROUTINE_TIMELINE.findIndex((s) => s.category === category);
  if (index === -1) return null;
  return {
    index,
    position: index + 1,
    total: ROUTINE_TIMELINE.length,
    label: ROUTINE_TIMELINE[index].category,
    time: ROUTINE_TIMELINE[index].time,
    before: index > 0 ? ROUTINE_TIMELINE[index - 1].category : null,
    after: index < ROUTINE_TIMELINE.length - 1 ? ROUTINE_TIMELINE[index + 1].category : null
  };
}

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
