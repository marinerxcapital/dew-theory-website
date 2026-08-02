/**
 * Dew Theory skin quiz — maps honest answers to real catalog product IDs only.
 * Inclusive for teens through mature skin. Never invents SKUs or medical claims.
 *
 * Results are educational routine suggestions, not a diagnosis.
 */

import { ROUTINE_ORDER } from './routine.js';

/** @typedef {'teens' | '20s_30s' | '40s_50s' | '60_plus'} AgeBand */
/** @typedef {'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'} SkinFeel */
/** @typedef {'breakouts' | 'aging' | 'dullness' | 'barrier' | 'pigment' | 'redness' | 'balance'} Concern */

export const QUIZ_DISCLAIMER =
  'This quiz builds a simple home sequence from our Skin Script collection. It is not a medical diagnosis. Sensitive, reactive, or medical skin conditions deserve an in-person or virtual read with Emily.';

export const QUIZ_STEPS = [
  {
    id: 'age',
    eyebrow: 'Chapter one',
    title: 'Where are you in your skin story?',
    subtitle: 'Skin changes across decades — we honor every chapter, from first breakouts to mature barrier care.',
    options: [
      {
        value: 'teens',
        label: 'Teens',
        hint: 'Hormone shifts, first routines, learning gently'
      },
      {
        value: '20s_30s',
        label: '20s – 30s',
        hint: 'Prevention, clarity, building good habits'
      },
      {
        value: '40s_50s',
        label: '40s – 50s',
        hint: 'Firmness, tone, resilience through change'
      },
      {
        value: '60_plus',
        label: '60 & beyond',
        hint: 'Comfort, glow, barrier-first wisdom'
      }
    ]
  },
  {
    id: 'feel',
    eyebrow: 'Chapter two',
    title: 'How does your skin usually feel by afternoon?',
    subtitle: 'Pick the closest match — perfection is not required.',
    options: [
      { value: 'dry', label: 'Tight or dry', hint: 'Flakes, pull, thirsty' },
      { value: 'oily', label: 'Shiny or oily', hint: 'T-zone glare, midday oil' },
      { value: 'combination', label: 'Combination', hint: 'Oil here, dry there' },
      { value: 'normal', label: 'Mostly balanced', hint: 'Comfortable most days' },
      { value: 'sensitive', label: 'Easily reactive', hint: 'Redness, sting, heat' }
    ]
  },
  {
    id: 'concern',
    eyebrow: 'Chapter three',
    title: 'What do you most want help with right now?',
    subtitle: 'One primary focus keeps the routine simple — Emily’s rule.',
    options: [
      { value: 'breakouts', label: 'Breakouts & congestion', hint: 'Bumps, clogged pores' },
      { value: 'aging', label: 'Firmness & fine lines', hint: 'Softening, bounce' },
      { value: 'dullness', label: 'Dullness & glow', hint: 'Life looks flat on skin' },
      { value: 'barrier', label: 'Barrier & comfort', hint: 'Sting, dryness, fragility' },
      { value: 'pigment', label: 'Tone & dark spots', hint: 'Uneven color' },
      { value: 'redness', label: 'Redness & calm', hint: 'Flush, heat, easily pink' },
      { value: 'balance', label: 'Just stay balanced', hint: 'Maintain, don’t overdo' }
    ]
  },
  {
    id: 'pace',
    eyebrow: 'Chapter four',
    title: 'How ambitious should your routine feel?',
    subtitle: 'Teens and mature skin often thrive with fewer steps. You can always grow later.',
    options: [
      {
        value: 'gentle',
        label: 'Gentle & simple',
        hint: '3–4 steps. Soft introduction.'
      },
      {
        value: 'steady',
        label: 'Steady classic',
        hint: 'Full AM + PM without overwhelm.'
      },
      {
        value: 'active',
        label: 'Ready for actives',
        hint: 'Includes brightening when appropriate.'
      }
    ]
  }
];

const IDS = {
  cleanser: 'green-tea-citrus-cleanser',
  toner: 'cucumber-hydration-toner',
  exfoliant: 'mandelic-brightening-serum',
  serum: 'hydrating-skin-serum',
  mask: 'botanical-bloom-hydrating-mask',
  moisturizer: 'ageless-moisturizer',
  lip: 'lip-treatment-peppermint-pomegranate',
  spf: 'sheer-protection-spf'
};

/**
 * @param {{ age?: AgeBand, feel?: SkinFeel, concern?: Concern, pace?: string }} answers
 */
export function scoreQuiz(answers = {}) {
  const age = answers.age || '20s_30s';
  const feel = answers.feel || 'normal';
  const concern = answers.concern || 'balance';
  const pace = answers.pace || 'steady';

  /** @type {string[]} */
  const am = [];
  /** @type {string[]} */
  const pm = [];
  /** @type {string[]} */
  const weekly = [];
  /** @type {string[]} */
  const notes = [];
  /** @type {string[]} */
  const cautions = [];

  const isSensitive = feel === 'sensitive' || concern === 'redness' || concern === 'barrier';
  const isDry = feel === 'dry' || age === '60_plus';
  const isOily = feel === 'oily' || feel === 'combination';
  const isTeen = age === 'teens';
  const isMature = age === '40s_50s' || age === '60_plus';

  // —— Cleanser ——
  // Only one cleanser in catalog; tailor guidance, not invent SKUs.
  am.push(IDS.cleanser);
  pm.push(IDS.cleanser);
  if (isDry || isSensitive || age === '60_plus') {
    notes.push(
      'Use the cleanser with lukewarm water and a short massage — comfort first, foam second.'
    );
  } else if (isOily || concern === 'breakouts') {
    notes.push('A thorough but kind cleanse is your foundation — especially after the day.');
  }

  // —— Toner ——
  if (isDry || isSensitive || isMature || concern === 'barrier' || concern === 'dullness' || pace !== 'gentle') {
    am.push(IDS.toner);
    pm.push(IDS.toner);
  } else if (pace === 'steady' || pace === 'active') {
    pm.push(IDS.toner);
  }

  // —— Hydrating serum (barrier hero for most ages) ——
  const wantSerum =
    isDry ||
    isSensitive ||
    isMature ||
    concern === 'barrier' ||
    concern === 'aging' ||
    concern === 'dullness' ||
    concern === 'redness' ||
    pace !== 'gentle' ||
    age === 'teens';

  if (wantSerum) {
    am.push(IDS.serum);
    pm.push(IDS.serum);
    if (isMature) {
      notes.push('Hydration and lipids matter as much as “anti-aging” — plump first, polish second.');
    }
    if (isTeen) {
      notes.push('A barrier-smart serum helps young skin stay calm while hormones fluctuate.');
    }
  }

  // —— Mandelic (actives) — careful gates ——
  const allowActive =
    pace === 'active' ||
    (pace === 'steady' &&
      !isSensitive &&
      concern !== 'barrier' &&
      concern !== 'redness' &&
      age !== '60_plus');

  const wantsBrighten =
    concern === 'pigment' ||
    concern === 'dullness' ||
    concern === 'breakouts' ||
    (concern === 'aging' && pace === 'active');

  if (allowActive && wantsBrighten) {
    // Prefer PM for actives; AM only if not teen/sensitive
    pm.push(IDS.exfoliant);
    if (!isTeen && !isSensitive && concern === 'pigment') {
      // keep PM only for mandelic — safer
    }
    cautions.push(
      'Introduce Mandelic Brightening Serum slowly (2–3 nights/week first). Always follow with moisturizer; SPF every morning.'
    );
    if (isTeen) {
      cautions.push(
        'Teen skin: actives are optional. If anything stings or peels, pause and keep cleanse → hydrate → moisturize → SPF.'
      );
    }
  } else if (concern === 'pigment' || concern === 'dullness') {
    notes.push(
      'For tone and glow without strong acids yet, we prioritize hydration and daily SPF — then add brightening when your barrier is steady.'
    );
  }

  // —— Moisturizer always ——
  am.push(IDS.moisturizer);
  pm.push(IDS.moisturizer);

  // —— SPF AM always ——
  am.push(IDS.spf);
  notes.push('Sheer Protection SPF 30 closes every morning routine — non-negotiable at every age.');

  // —— Weekly mask ——
  if (
    isDry ||
    concern === 'barrier' ||
    concern === 'dullness' ||
    isMature ||
    pace !== 'gentle'
  ) {
    weekly.push(IDS.mask);
    notes.push('Botanical Bloom Mask 1–2 evenings a week when skin feels thirsty or flat.');
  }

  // —— Lip (optional comfort, all ages) ——
  if (isMature || isDry || concern === 'aging' || pace === 'active') {
    pm.push(IDS.lip);
  }

  // —— Age-specific framing ——
  let archetype = 'Balanced glow path';
  let headline = 'A clear, calm sequence for your skin.';
  let emilyNote =
    'Emily’s approach: change one variable at a time. Master this sequence for two weeks before adding more.';

  if (isTeen && (concern === 'breakouts' || isOily)) {
    archetype = 'Young clarity path';
    headline = 'Gentle structure for changing, busy skin.';
    emilyNote =
      'Teen years are about habits, not harsh fixes. Cleanse, hydrate, moisturize, protect — then build.';
  } else if (isMature && (concern === 'aging' || isDry)) {
    archetype = 'Mature radiance path';
    headline = 'Comfort, bounce, and light — never stripped.';
    emilyNote =
      'Mature skin rewards kindness. We feed the barrier first so everything else can work.';
  } else if (concern === 'breakouts') {
    archetype = 'Clear + balanced path';
    headline = 'Clarify without punishing your barrier.';
  } else if (concern === 'pigment' || concern === 'dullness') {
    archetype = 'Bright even-tone path';
    headline = 'Light reflection starts with a steady surface.';
  } else if (isSensitive || concern === 'redness' || concern === 'barrier') {
    archetype = 'Calm barrier path';
    headline = 'Soften, seal, protect — then decide on actives.';
    emilyNote =
      'Reactive skin is not “difficult.” It is informative. We listen before we polish.';
  }

  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  return {
    answers: { age, feel, concern, pace },
    archetype,
    headline,
    emilyNote,
    notes: unique(notes),
    cautions: unique(cautions),
    amIds: unique(am),
    pmIds: unique(pm),
    weeklyIds: unique(weekly),
    allIds: unique([...am, ...pm, ...weekly]),
    disclaimer: QUIZ_DISCLAIMER
  };
}

/**
 * Resolve scored IDs against live catalog.
 * @param {ReturnType<typeof scoreQuiz>} scored
 * @param {Array} catalog
 * @param {{ isVisible?: (p: object) => boolean }} [opts]
 */
export function resolveQuizRoutine(scored, catalog, opts = {}) {
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  const byId = (id) => {
    const p = (catalog || []).find((x) => x.id === id);
    if (!p || !isVisible(p)) return null;
    return p;
  };

  const mapList = (ids) =>
    (ids || []).map(byId).filter(Boolean).sort((a, b) => {
      return ROUTINE_ORDER.indexOf(a.category) - ROUTINE_ORDER.indexOf(b.category);
    });

  const am = mapList(scored.amIds);
  const pm = mapList(scored.pmIds);
  const weekly = mapList(scored.weeklyIds);
  const allMap = new Map();
  for (const p of [...am, ...pm, ...weekly]) allMap.set(p.id, p);
  const products = [...allMap.values()].sort(
    (a, b) => ROUTINE_ORDER.indexOf(a.category) - ROUTINE_ORDER.indexOf(b.category)
  );
  const subtotal = products.reduce((s, p) => s + Number(p.retail_price || 0), 0);

  return {
    ...scored,
    am,
    pm,
    weekly,
    products,
    subtotal
  };
}

/**
 * Encode answers for shareable result URLs (no PII).
 * @param {Record<string, string>} answers
 */
export function encodeQuizAnswers(answers) {
  try {
    const payload = QUIZ_STEPS.map((s) => answers[s.id] || '').join('.');
    return payload;
  } catch {
    return '';
  }
}

/**
 * @param {string} raw
 */
export function decodeQuizAnswers(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const parts = raw.split('.');
  if (parts.length < QUIZ_STEPS.length) return null;
  /** @type {Record<string, string>} */
  const answers = {};
  QUIZ_STEPS.forEach((step, i) => {
    const val = parts[i];
    if (step.options.some((o) => o.value === val)) answers[step.id] = val;
  });
  if (Object.keys(answers).length < QUIZ_STEPS.length) return null;
  return answers;
}

/**
 * Pairing copy + product suggestions for a given product (Emily pairs with).
 * @param {object} product
 * @param {Array} catalog
 * @param {{ isVisible?: Function, limit?: number }} [opts]
 */
export function emilyPairsWith(product, catalog, opts = {}) {
  const limit = opts.limit ?? 4;
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  if (!product) return { title: '', why: '', pairs: [] };

  const rank = (cat) => {
    const i = ROUTINE_ORDER.indexOf(cat);
    return i === -1 ? 99 : i;
  };
  const r0 = rank(product.category);

  const whyByCategory = {
    Cleanser: 'After cleanse, skin is ready to drink water-based layers and seal with cream + SPF.',
    Toner: 'Toner preps; follow with serum or treatment, then moisturizer so nothing sits dry.',
    Exfoliant: 'Acids need a soft landing — hydrate, moisturize, and never skip morning SPF.',
    Serum: 'Serums work best between water and cream. Pair with cleanse + moisturizer + SPF.',
    Mask: 'Masks are a weekly ritual. Keep daily cleanse, serum, and cream steady around them.',
    Moisturizer: 'Cream locks everything in. Pair with a cleanse and, by day, mineral SPF.',
    'Lip Treatment': 'Lips finish the ritual. Pair with your evening seal and morning SPF habit.',
    SPF: 'SPF is the last AM step. Everything under it should already be absorbed and sealed.'
  };

  const pool = (catalog || []).filter(
    (p) => p.id !== product.id && isVisible(p) && p.stock_status !== 'out_of_stock'
  );

  const scored = pool.map((p) => {
    const r = rank(p.category);
    const distance = Math.abs(r - r0);
    const after = r > r0 ? 0 : 1;
    const same = p.category === product.category ? 8 : 0;
    // Prefer adjacent routine steps
    let score = same + after * 2 + distance;
    // Soft skin-type affinity
    const shared = (product.skin_types || []).some((t) =>
      String(t).toLowerCase().includes('all')
        ? true
        : (p.skin_types || []).some((x) => String(x).toLowerCase().includes(String(t).toLowerCase()))
    );
    if (shared) score -= 1;
    return { p, score };
  });

  scored.sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name));
  const pairs = scored.slice(0, limit).map((s) => ({
    product: s.p,
    step: s.p.category,
    blurb: pairBlurb(product, s.p)
  }));

  return {
    title: `Emily pairs ${product.name} with`,
    why: whyByCategory[product.category] || 'Sequence matters as much as the formula.',
    pairs
  };
}

function pairBlurb(base, other) {
  const a = base.category;
  const b = other.category;
  if (a === 'Cleanser' && b === 'Toner') return 'Mist or sweep on after rinse — still-damp skin drinks better.';
  if (a === 'Cleanser' && b === 'Serum') return 'Hydrating serum next keeps the barrier quiet and plump.';
  if (b === 'SPF') return 'Always last in the morning. Reapply when you are outdoors long.';
  if (a === 'Exfoliant' && b === 'Moisturizer') return 'Seal acids with cream so skin never finishes “squeaky.”';
  if (a === 'Exfoliant' && b === 'SPF') return 'Morning SPF is required on days you use brightening actives.';
  if (a === 'Serum' && b === 'Moisturizer') return 'Cream locks peptides and hydration where you need them.';
  if (a === 'Toner' && b === 'Serum') return 'Toner first, serum second — thin to thick.';
  if (b === 'Mask') return 'Use the mask on quieter nights when you are not pushing strong actives.';
  if (b === 'Lip Treatment') return 'A soft finish for evening — especially when air is dry.';
  return `Follow routine order: ${a} → ${b}.`;
}

/**
 * Build a full AM or PM routine template from catalog categories.
 * @param {Array} catalog
 * @param {'am' | 'pm'} slot
 * @param {{ isVisible?: Function }} [opts]
 */
export function defaultRoutineTemplate(catalog, slot = 'am', opts = {}) {
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');

  const amCats = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'SPF'];
  const pmCats = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Lip Treatment'];
  const cats = slot === 'pm' ? pmCats : amCats;

  const steps = [];
  for (const cat of cats) {
    const product = (catalog || []).find(
      (p) => p.category === cat && isVisible(p) && p.stock_status !== 'out_of_stock'
    );
    steps.push({
      category: cat,
      required: cat === 'Cleanser' || cat === 'Moisturizer' || (slot === 'am' && cat === 'SPF'),
      product: product || null
    });
  }
  return steps;
}

/**
 * All products available for a category in the builder.
 */
export function productsForCategory(catalog, category, opts = {}) {
  const isVisible =
    opts.isVisible ||
    ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
  return (catalog || []).filter((p) => p.category === category && isVisible(p));
}
