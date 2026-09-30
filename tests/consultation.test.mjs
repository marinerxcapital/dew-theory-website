import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  CONSULTATION_STEPS,
  CONSULTATION_STEP_COUNT,
  concernFamiliesFromAnswers,
  decodeAnswers,
  encodeAnswers,
  isStepKey,
  nextStepKey,
  previousStepKey,
  routineDepth
} from '../lib/consultation-questions.js';
import { CONCERN_FAMILIES, getConcernFamily, productsForFamily } from '../lib/concerns.js';

const catalog = JSON.parse(readFileSync(new URL('../data/products.json', import.meta.url), 'utf8'));

const familySlugs = new Set(CONCERN_FAMILIES.map((f) => f.slug));
const declaredConditions = new Set();
for (const p of catalog.products) {
  for (const c of p.conditions_addressed || []) declaredConditions.add(c);
}

describe('consultation questionnaire', () => {
  it('has the eight steps the mockup shows', () => {
    assert.equal(CONSULTATION_STEP_COUNT, 8);
  });

  it('gives every step a prompt, a helper and at least two options', () => {
    for (const step of CONSULTATION_STEPS) {
      assert.ok(step.prompt && step.prompt.length > 8, step.key + ' needs a prompt');
      assert.ok(step.helper && step.helper.length > 4, step.key + ' needs a helper line');
      assert.ok(step.options.length >= 2, step.key + ' needs at least two options');
      const values = new Set(step.options.map((o) => o.value));
      assert.equal(values.size, step.options.length, step.key + ' has duplicate option values');
    }
  });

  it('maps every concern option to a real concern family', () => {
    const concerns = CONSULTATION_STEPS.find((s) => s.key === 'concerns');
    assert.ok(concerns, 'a concerns step is required');
    for (const option of concerns.options) {
      if (option.value === 'texture-pores') continue; // expanded into families below
      assert.ok(
        familySlugs.has(option.value),
        'concern option does not map to a family: ' + option.value
      );
    }
  });

  it('never asks for medical information', () => {
    const text = JSON.stringify(CONSULTATION_STEPS).toLowerCase();
    for (const banned of [
      'diagnos',
      'prescri',
      'medication',
      'allergy',
      'pregnan',
      'condition you have'
    ]) {
      assert.ok(!text.includes(banned), 'questionnaire mentions "' + banned + '"');
    }
  });

  it('walks forward and backward through the whole set', () => {
    assert.equal(nextStepKey(CONSULTATION_STEPS[0].key), CONSULTATION_STEPS[1].key);
    assert.equal(previousStepKey(CONSULTATION_STEPS[0].key), null);
    assert.equal(nextStepKey(CONSULTATION_STEPS[7].key), null);
    assert.equal(previousStepKey(CONSULTATION_STEPS[7].key), CONSULTATION_STEPS[6].key);
    assert.equal(isStepKey('not-a-step'), false);
    assert.equal(isStepKey('concerns'), true);
  });
});

describe('consultation answer encoding', () => {
  it('round-trips answers through the URL', () => {
    const answers = {
      concerns: ['breakouts-congestion', 'dry-dehydrated'],
      feel: 'tight',
      pace: 'moderate'
    };
    const decoded = decodeAnswers(encodeAnswers(answers));
    assert.deepEqual(decoded.concerns, ['breakouts-congestion', 'dry-dehydrated']);
    assert.equal(decoded.feel, 'tight');
    assert.equal(decoded.pace, 'moderate');
  });

  it('drops unknown keys and values rather than trusting the URL', () => {
    const decoded = decodeAnswers('concerns:made-up,breakouts-congestion;evil:1;feel:nope');
    assert.deepEqual(decoded.concerns, ['breakouts-congestion']);
    assert.equal(decoded.evil, undefined);
    assert.equal(decoded.feel, undefined);
  });

  it('ignores oversize input instead of parsing it', () => {
    assert.deepEqual(decodeAnswers('a'.repeat(900)), {});
    assert.deepEqual(decodeAnswers(null), {});
    assert.deepEqual(decodeAnswers(42), {});
  });
});

describe('consultation recommendation mapping', () => {
  it('derives only real concern families', () => {
    const families = concernFamiliesFromAnswers({
      concerns: ['uneven-tone', 'texture-pores'],
      feel: 'oily-tight',
      texture: ['pores', 'dull'],
      reaction: 'reacts'
    });
    for (const slug of families) {
      assert.ok(familySlugs.has(slug), 'produced an unknown family: ' + slug);
    }
    assert.ok(families.includes('uneven-tone'));
    assert.ok(families.includes('dry-dehydrated'));
    assert.ok(families.includes('sensitive-reactive'));
  });

  it('recommends only products that declare a selected concern', () => {
    const families = concernFamiliesFromAnswers({ concerns: ['breakouts-congestion'] });
    const products = families.flatMap((slug) =>
      productsForFamily(getConcernFamily(slug), catalog.products)
    );
    assert.ok(products.length > 0, 'expected at least one product for a real concern');
    for (const product of products) {
      assert.ok(
        (product.conditions_addressed || []).some((c) => declaredConditions.has(c)),
        product.id + ' was recommended without declaring a real concern'
      );
    }
  });

  it('keeps the routine inside the pace the visitor chose', () => {
    assert.equal(routineDepth({ pace: 'minimal' }), 3);
    assert.equal(routineDepth({ pace: 'moderate' }), 4);
    assert.equal(routineDepth({ pace: 'full' }), 6);
    assert.equal(routineDepth({}), 4);
  });

  it('produces nothing when no concern was selected', () => {
    assert.deepEqual(concernFamiliesFromAnswers({}), []);
    assert.deepEqual(concernFamiliesFromAnswers(null), []);
  });
});

describe('consultation routes exist', () => {
  it('ships the landing, the step template and the results page', () => {
    for (const rel of [
      'app/consultation/page.jsx',
      'app/consultation/[step]/page.jsx',
      'app/consultation/results/page.jsx',
      'components/consultation/Questionnaire.jsx'
    ]) {
      assert.ok(existsSync(new URL('../' + rel, import.meta.url)), 'missing ' + rel);
    }
  });

  it('links the nav directly to paid consultation', () => {
    const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8');
    assert.ok(nav.includes("href: '/virtual-consultation'"), 'nav must point at /virtual-consultation');
  });

  it('keeps the paid 1:1 booking route reachable', () => {
    const landing = readFileSync(new URL('../app/consultation/page.jsx', import.meta.url), 'utf8');
    const footer = readFileSync(new URL('../components/Footer.jsx', import.meta.url), 'utf8');
    assert.ok(
      landing.includes('/virtual-consultation'),
      'the consultation landing must offer the 1:1 session'
    );
    assert.ok(
      footer.includes('/virtual-consultation'),
      'the footer must keep linking the 1:1 session'
    );
  });
});
