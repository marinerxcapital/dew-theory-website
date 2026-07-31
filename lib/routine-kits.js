/**
 * Curated starter kits from real catalog IDs only.
 * Prices resolved at runtime from product retail — never invent kit discounts.
 */

export const STARTER_KITS = [
  {
    id: 'starter-barrier',
    name: 'Starter barrier kit',
    eyebrow: 'Most people start here',
    description:
      'Cleanse, treat, and lock in — the three steps Emily most often uses to rebuild a simple home routine.',
    product_ids: [
      'green-tea-citrus-cleanser',
      'hydrating-skin-serum',
      'ageless-moisturizer'
    ]
  },
  {
    id: 'brighten-protect',
    name: 'Brighten + protect',
    eyebrow: 'Day-forward',
    description:
      'A brightening serum path with daily SPF when the barrier is ready for actives.',
    product_ids: [
      'mandelic-brightening-serum',
      'ageless-moisturizer',
      'sheer-protection-spf'
    ]
  }
];

/**
 * @param {Array} catalog - full products
 * @param {string} kitId
 * @param {{ isVisible?: (p: object) => boolean }} [opts]
 */
export function resolveKit(catalog, kitId, opts = {}) {
  const kit = STARTER_KITS.find((k) => k.id === kitId);
  if (!kit) return null;
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  const products = [];
  for (const id of kit.product_ids) {
    const p = (catalog || []).find((x) => x.id === id);
    if (p && isVisible(p) && p.stock_status !== 'out_of_stock') {
      products.push(p);
    }
  }
  if (!products.length) return null;

  const subtotal = products.reduce((s, p) => s + Number(p.retail_price || 0), 0);
  return {
    ...kit,
    products,
    subtotal,
    complete: products.length === kit.product_ids.length
  };
}

export function listResolvedKits(catalog, opts = {}) {
  return STARTER_KITS.map((k) => resolveKit(catalog, k.id, opts)).filter(Boolean);
}
