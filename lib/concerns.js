/**
 * Skin-concern taxonomy, derived from the real catalog.
 *
 * The catalog stores `conditions_addressed` per product as free-form, verified
 * strings (22 distinct values across 36 products). Twenty-two one-product
 * shelves is not a navigable taxonomy, so products are grouped into seven
 * families for presentation.
 *
 * HARD RULE: every condition string listed here must exist in
 * `data/products.json`. No family may claim a condition that no product
 * addresses, and no product is assigned a concern it does not already declare.
 * tests/skin-concerns.test.mjs asserts this.
 */

export const CONCERN_FAMILIES = [
  {
    slug: 'breakouts-congestion',
    label: 'Breakouts + congestion',
    blurb:
      'Oil control, pore congestion and the residue that builds between cleansing and treatment.',
    conditions: [
      'mild breakouts',
      'congestion / buildup',
      'excess oil',
      'enlarged pores',
      'oil/water imbalance'
    ]
  },
  {
    slug: 'uneven-tone',
    label: 'Uneven tone',
    blurb: 'Dullness, patchiness and the pigment that lingers after everything else has settled.',
    conditions: ['uneven tone', 'hyperpigmentation', 'dullness']
  },
  {
    slug: 'dry-dehydrated',
    label: 'Dry + dehydrated',
    blurb: 'Water loss, tightness and the absorption problem that follows a tired barrier.',
    conditions: [
      'dehydration',
      'dryness',
      'dryness from active ingredients',
      'poor serum absorption'
    ]
  },
  {
    slug: 'sensitive-reactive',
    label: 'Sensitivity + redness',
    blurb: 'Reactivity, flushing and a barrier that needs less, not more.',
    conditions: ['sensitivity', 'redness-prone skin', 'irritation', 'compromised barrier']
  },
  {
    slug: 'fine-lines-firmness',
    label: 'Fine lines + firmness',
    blurb: 'Texture and expression lines, addressed early rather than aggressively.',
    conditions: ['fine lines', 'early signs of aging']
  },
  {
    slug: 'lips',
    label: 'Lips',
    blurb: 'Chapping, vertical lines and the thin skin that shows dehydration first.',
    conditions: ['dry or chapped lips', 'fine vertical lip lines', 'thinning lips']
  },
  {
    slug: 'daily-protection',
    label: 'Daily protection',
    blurb: 'The step that protects every result the rest of the routine earns.',
    conditions: ['daily sun protection']
  }
];

export function slugifyCondition(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every condition string the taxonomy claims. */
export function allClaimedConditions() {
  return CONCERN_FAMILIES.flatMap((f) => f.conditions);
}

export function getConcernFamily(slug) {
  return CONCERN_FAMILIES.find((f) => f.slug === slug) || null;
}

/** Products whose own `conditions_addressed` intersects the family's set. */
export function productsForFamily(family, products) {
  if (!family) return [];
  const wanted = new Set(family.conditions);
  return products.filter((p) => (p.conditions_addressed || []).some((c) => wanted.has(c)));
}

/** Families with a live product count, for the index grid. */
export function concernFamiliesWithCounts(products) {
  return CONCERN_FAMILIES.map((family) => {
    const items = productsForFamily(family, products);
    return { ...family, products: items, count: items.length };
  });
}
