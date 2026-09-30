/**
 * Self-serve consultation questionnaire (mockup DT-09).
 *
 * Eight steps. Every option maps to either a concern family defined in
 * lib/concerns.js or a routine/behaviour signal, so results can be derived from
 * the catalog's own `conditions_addressed` values instead of a hand-written
 * recommendation table. tests/consultation.test.mjs asserts that every concern
 * option resolves to a real family and that no step claims a fact the catalog
 * cannot support.
 *
 * This is cosmetic guidance, not diagnosis. No step asks for, or infers, a
 * medical condition.
 */

export const CONSULTATION_STEPS = [
  {
    key: 'concerns',
    prompt: 'What would you most like to address?',
    helper: 'Select all that apply.',
    multi: true,
    options: [
      { value: 'breakouts-congestion', label: 'Breakouts + Congestion' },
      { value: 'uneven-tone', label: 'Uneven Tone' },
      { value: 'dry-dehydrated', label: 'Dryness + Dehydration' },
      { value: 'sensitive-reactive', label: 'Sensitivity' },
      { value: 'fine-lines-firmness', label: 'Fine Lines' },
      { value: 'texture-pores', label: 'Texture + Pores' }
    ]
  },
  {
    key: 'feel',
    prompt: 'How does your skin feel a few hours after cleansing?',
    helper: 'Choose the closest match.',
    multi: false,
    options: [
      { value: 'tight', label: 'Tight and dry', note: 'dehydrated or dry' },
      { value: 'balanced', label: 'Comfortable' },
      { value: 'oily', label: 'Shiny through the T-zone' },
      { value: 'oily-tight', label: 'Shiny, but still tight' }
    ]
  },
  {
    key: 'reaction',
    prompt: 'How does your skin usually react to a new active?',
    helper: 'Choose the closest match.',
    multi: false,
    options: [
      { value: 'calm', label: 'Usually settles quickly' },
      { value: 'flushes', label: 'Can flush or sting at first' },
      { value: 'reacts', label: 'Often reacts — I go slowly' },
      { value: 'unsure', label: 'I have not used actives yet' }
    ]
  },
  {
    key: 'routine',
    prompt: 'What is in your routine right now?',
    helper: 'Select all that apply.',
    multi: true,
    options: [
      { value: 'cleanser', label: 'Cleanser' },
      { value: 'toner', label: 'Toner' },
      { value: 'actives', label: 'Serum or treatment' },
      { value: 'moisturiser', label: 'Moisturiser' },
      { value: 'spf', label: 'Sunscreen' },
      { value: 'nothing', label: 'Not much — starting fresh' }
    ]
  },
  {
    key: 'pace',
    prompt: 'How many steps will you actually keep up with?',
    helper: 'Be honest — this shapes the routine.',
    multi: false,
    options: [
      { value: 'minimal', label: 'Two to three' },
      { value: 'moderate', label: 'Four' },
      { value: 'full', label: 'Five or more' }
    ]
  },
  {
    key: 'protection',
    prompt: 'Where are you with daily sun protection?',
    helper: 'Choose the closest match.',
    multi: false,
    options: [
      { value: 'daily', label: 'Every day' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'none', label: 'Not at all' }
    ]
  },
  {
    key: 'texture',
    prompt: 'Anything about texture you notice?',
    helper: 'Select all that apply.',
    multi: true,
    options: [
      { value: 'pores', label: 'Visible pores' },
      { value: 'roughness', label: 'Rough or uneven surface' },
      { value: 'dull', label: 'Looks tired or flat' },
      { value: 'none', label: 'Nothing in particular' }
    ]
  },
  {
    key: 'avoid',
    prompt: 'Is there anything you would rather avoid?',
    helper: 'Select all that apply.',
    multi: true,
    options: [
      { value: 'fragrance', label: 'Added fragrance' },
      { value: 'acids', label: 'Strong acids' },
      { value: 'retinol', label: 'Retinol' },
      { value: 'none', label: 'Nothing in particular' }
    ]
  }
];

export const CONSULTATION_STEP_COUNT = CONSULTATION_STEPS.length;

/** The step after this one, or null when the questionnaire is finished. */
export function nextStepKey(currentKey) {
  const index = CONSULTATION_STEPS.findIndex((s) => s.key === currentKey);
  if (index < 0) return null;
  return CONSULTATION_STEPS[index + 1]?.key ?? null;
}

export function previousStepKey(currentKey) {
  const index = CONSULTATION_STEPS.findIndex((s) => s.key === currentKey);
  if (index <= 0) return null;
  return CONSULTATION_STEPS[index - 1].key;
}

export function stepIndex(currentKey) {
  return CONSULTATION_STEPS.findIndex((s) => s.key === currentKey);
}

export function getStep(key) {
  return CONSULTATION_STEPS.find((s) => s.key === key) || null;
}

export function isStepKey(key) {
  return CONSULTATION_STEPS.some((s) => s.key === key);
}

/**
 * Concern families selected in step one, plus the two refinements that map onto
 * conditions the catalog actually declares:
 *   - dryness signals  -> the dry + dehydrated family
 *   - texture signals  -> the uneven tone family (dullness) and pore concerns
 * Everything else only shapes routine length or SPF emphasis.
 */
export function concernFamiliesFromAnswers(answers) {
  const out = new Set();

  for (const value of answers?.concerns || []) {
    if (value === 'texture-pores') {
      out.add('uneven-tone');
      out.add('breakouts-congestion');
    } else {
      out.add(value);
    }
  }

  if (answers?.feel === 'tight' || answers?.feel === 'oily-tight') {
    out.add('dry-dehydrated');
  }

  if ((answers?.texture || []).includes('pores')) out.add('breakouts-congestion');
  if ((answers?.texture || []).includes('roughness')) out.add('uneven-tone');
  if ((answers?.texture || []).includes('dull')) out.add('uneven-tone');

  if (
    answers?.reaction === 'reacts' ||
    answers?.reaction === 'flushes' ||
    (answers?.avoid || []).includes('acids') ||
    (answers?.avoid || []).includes('retinol')
  ) {
    out.add('sensitive-reactive');
  }

  return [...out];
}

/** How many product steps to show in the recommended routine. */
export function routineDepth(answers) {
  const pace = answers?.pace;
  if (pace === 'minimal') return 3;
  if (pace === 'full') return 6;
  return 4;
}

/** Encode answers into a compact, shareable query value. */
export function encodeAnswers(answers) {
  const parts = [];
  for (const step of CONSULTATION_STEPS) {
    const value = answers?.[step.key];
    if (Array.isArray(value) && value.length) {
      parts.push(step.key + ':' + value.join(','));
    } else if (typeof value === 'string' && value) {
      parts.push(step.key + ':' + value);
    }
  }
  return parts.join(';');
}

/** Inverse of encodeAnswers. Unknown keys/values are dropped, never trusted. */
export function decodeAnswers(raw) {
  const out = {};
  if (typeof raw !== 'string' || raw.length > 600) return out;

  for (const chunk of raw.split(';')) {
    const at = chunk.indexOf(':');
    if (at < 1) continue;
    const key = chunk.slice(0, at);
    const step = getStep(key);
    if (!step) continue;
    const allowed = new Set(step.options.map((o) => o.value));
    const values = chunk
      .slice(at + 1)
      .split(',')
      .map((v) => v.trim())
      .filter((v) => allowed.has(v));
    if (!values.length) continue;
    out[key] = step.multi ? values : values[0];
  }
  return out;
}
