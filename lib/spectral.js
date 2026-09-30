/**
 * Spectral product visual system — iridescent family worlds.
 *
 * The interface stays quiet on ivory/forest; the product families carry the
 * color. Every family below is derived from vocabulary that actually exists in
 * data/products.json (categories and conditions_addressed). Nothing here
 * invents a concern, category, or claim.
 */

/** Ordered family worlds. `concerns` match real `conditions_addressed` values. */
export const SPECTRAL_FAMILIES = [
  {
    key: 'hydration',
    label: 'Hydration',
    blurb: 'Quench tightness and flaking without heaviness.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(143, 185, 184, 0.34)',
      'rgba(185, 169, 214, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ],
    concerns: [
      'dehydration',
      'dryness',
      'dryness from active ingredients',
      'poor serum absorption'
    ]
  },
  {
    key: 'barrier',
    label: 'Barrier support',
    blurb: 'Calm reactive, easily irritated skin.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(143, 174, 150, 0.32)',
      'rgba(214, 196, 154, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ],
    concerns: ['compromised barrier', 'sensitivity', 'irritation', 'redness-prone skin']
  },
  {
    key: 'brightening',
    label: 'Brightening',
    blurb: 'Even out tone and lift a flat-looking surface.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(226, 182, 154, 0.34)',
      'rgba(216, 175, 168, 0.24)',
      'rgba(214, 196, 154, 0.2)'
    ],
    concerns: ['uneven tone', 'hyperpigmentation', 'dullness']
  },
  {
    key: 'clarifying',
    label: 'Clarifying',
    blurb: 'Clear buildup, congestion, and excess oil.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(143, 185, 184, 0.32)',
      'rgba(143, 174, 150, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ],
    concerns: [
      'congestion / buildup',
      'excess oil',
      'mild breakouts',
      'enlarged pores',
      'oil/water imbalance'
    ]
  },
  {
    key: 'aging',
    label: 'Aging support',
    blurb: 'Support for fine lines and early signs of aging.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(185, 169, 214, 0.32)',
      'rgba(216, 175, 168, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ],
    concerns: ['early signs of aging', 'fine lines']
  },
  {
    key: 'spf',
    label: 'Daily protection',
    blurb: 'Close every morning routine with mineral SPF.',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(214, 196, 154, 0.36)',
      'rgba(143, 185, 184, 0.18)',
      'rgba(237, 237, 230, 0.9)'
    ],
    concerns: ['daily sun protection']
  }
];

/** Family worlds driven by catalog category instead of concern. */
const CATEGORY_FAMILY = {
  'Eye Treatment': {
    key: 'eye',
    label: 'Eye care',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(185, 169, 214, 0.32)',
      'rgba(143, 185, 184, 0.24)',
      'rgba(237, 237, 230, 0.9)'
    ]
  },
  'Lip Treatment': {
    key: 'lip',
    label: 'Lip care',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(216, 175, 168, 0.32)',
      'rgba(226, 182, 154, 0.24)',
      'rgba(237, 237, 230, 0.9)'
    ]
  },
  Mask: {
    key: 'masks',
    label: 'Masks',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(143, 174, 150, 0.32)',
      'rgba(216, 175, 168, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ]
  },
  Kit: {
    key: 'kit',
    label: 'Sets',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(147, 168, 144, 0.28)',
      'rgba(214, 196, 154, 0.22)',
      'rgba(237, 237, 230, 0.9)'
    ]
  },
  SPF: {
    key: 'spf',
    label: 'Daily protection',
    accent: 'var(--dt-green-700)',
    soft: 'var(--dt-green-50)',
    wash: [
      'rgba(214, 196, 154, 0.36)',
      'rgba(143, 185, 184, 0.18)',
      'rgba(237, 237, 230, 0.9)'
    ]
  }
};

/** Quiet fallback — keeps the interface calm when nothing maps. */
export const NEUTRAL_FAMILY = {
  key: 'neutral',
  label: 'Skin Script',
  accent: 'var(--dt-green-700)',
  soft: 'var(--dt-green-50)',
  wash: [
    'rgba(147, 168, 144, 0.22)',
    'rgba(214, 196, 154, 0.16)',
    'rgba(237, 237, 230, 0.9)'
  ]
};

export function getSpectralFamily(key) {
  if (!key) return null;
  if (NEUTRAL_FAMILY.key === key) return NEUTRAL_FAMILY;
  return (
    SPECTRAL_FAMILIES.find((f) => f.key === key) ||
    Object.values(CATEGORY_FAMILY).find((f) => f.key === key) ||
    null
  );
}

const CONCERN_TO_FAMILY = new Map();
for (const family of SPECTRAL_FAMILIES) {
  for (const concern of family.concerns) CONCERN_TO_FAMILY.set(concern, family);
}

/**
 * Resolve the family world for a product using real catalog metadata only.
 * Category worlds (eye/lip/masks/sets/SPF) win first, then concerns.
 *
 * @param {object} product
 * @returns {typeof NEUTRAL_FAMILY}
 */
export function spectralFamilyForProduct(product) {
  if (!product) return NEUTRAL_FAMILY;

  const byCategory = CATEGORY_FAMILY[product.category];
  if (byCategory) return byCategory;

  const concerns = Array.isArray(product.conditions_addressed)
    ? product.conditions_addressed
    : [];
  for (const concern of concerns) {
    const family = CONCERN_TO_FAMILY.get(String(concern).toLowerCase());
    if (family) return family;
  }

  return NEUTRAL_FAMILY;
}

/**
 * Resolve a family for a concern label shown in navigation.
 * Matches on the real conditions_addressed value, never on invented synonyms.
 *
 * @param {string} concern
 */
export function spectralFamilyForConcern(concern) {
  return CONCERN_TO_FAMILY.get(String(concern || '').toLowerCase()) || NEUTRAL_FAMILY;
}

/**
 * Inline CSS custom properties so family colors are never purged by Tailwind.
 *
 * CLINICAL NOIR: the per-family pastel worlds are retired. Family identity now
 * lives in the label, blurb, and catalog concern (real data); the *material* is
 * one deliberate light source. Every family resolves to the same void ground
 * plus a pink pulse, so a page of tiles reads as a single shoot rather than a
 * rainbow of five branded sub-worlds. Pink stays scarce because it appears only
 * as the accent dot, the hairline, and the hover wash.
 */
/**
 * The single material used for every card. Under the pearl/editorial system
 * there is no per-family colour: the "accent" is ink, the field is lifted
 * pearl, and the washes are reflected light (champagne / ice) at low opacity.
 * These feed the base-layer `--sp-*` consumers in app/globals.css
 * (.spectral-field, .spectral-edge, .family-chip, .spectral-glow).
 */
const PEARL_MATERIAL = {
  accent: 'var(--dt-green-700)',
  soft: 'var(--dt-green-50)',
  wash: ['rgba(201, 183, 154, 0.18)', 'rgba(198, 211, 216, 0.14)', 'rgba(237, 235, 230, 0)']
};

export function spectralStyle() {
  return {
    '--sp-accent': PEARL_MATERIAL.accent,
    '--sp-soft': PEARL_MATERIAL.soft,
    '--sp-wash-1': PEARL_MATERIAL.wash[0],
    '--sp-wash-2': PEARL_MATERIAL.wash[1],
    '--sp-wash-3': PEARL_MATERIAL.wash[2]
  };
}

/** Family keys owned by a real catalog concern (for tiles and rails). */
export const FAMILY_ORDER = SPECTRAL_FAMILIES.map((f) => f.key);
