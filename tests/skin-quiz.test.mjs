import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import catalog from '../data/products.json' with { type: 'json' };
import {
  QUIZ_STEPS,
  decodeQuizAnswers,
  encodeQuizAnswers,
  emilyPairsWith,
  resolveQuizRoutine,
  scoreQuiz,
  defaultRoutineTemplate
} from '../lib/skin-quiz.js';

const products = catalog.products;

describe('skin quiz', () => {
  it('defines four inclusive chapters', () => {
    assert.equal(QUIZ_STEPS.length, 4);
    assert.ok(QUIZ_STEPS[0].options.some((o) => o.value === 'teens'));
    assert.ok(QUIZ_STEPS[0].options.some((o) => o.value === '60_plus'));
  });

  it('scores a teen breakout path with real catalog ids', () => {
    const scored = scoreQuiz({
      age: 'teens',
      feel: 'oily',
      concern: 'breakouts',
      pace: 'gentle'
    });
    assert.ok(scored.amIds.includes('sheer-protection-spf'));
    assert.ok(scored.amIds.includes('green-tea-citrus-cleanser'));
    const resolved = resolveQuizRoutine(scored, products);
    assert.ok(resolved.products.length >= 3);
    assert.ok(resolved.subtotal > 0);
    assert.equal(
      resolved.products.every((p) => products.some((c) => c.id === p.id)),
      true
    );
  });

  it('scores mature dry path without forcing strong actives', () => {
    const scored = scoreQuiz({
      age: '60_plus',
      feel: 'dry',
      concern: 'aging',
      pace: 'gentle'
    });
    assert.ok(!scored.pmIds.includes('mandelic-brightening-serum'));
    assert.ok(scored.amIds.includes('hydrating-skin-serum'));
    assert.ok(scored.weeklyIds.includes('botanical-bloom-hydrating-mask'));
  });

  it('allows mandelic on active pigment path when not sensitive', () => {
    const scored = scoreQuiz({
      age: '20s_30s',
      feel: 'combination',
      concern: 'pigment',
      pace: 'active'
    });
    assert.ok(scored.pmIds.includes('mandelic-brightening-serum'));
    assert.ok(scored.cautions.length >= 1);
  });

  it('encodes and decodes answers', () => {
    const answers = {
      age: '40s_50s',
      feel: 'sensitive',
      concern: 'barrier',
      pace: 'steady'
    };
    const code = encodeQuizAnswers(answers);
    assert.equal(decodeQuizAnswers(code)?.concern, 'barrier');
    assert.equal(decodeQuizAnswers('bad'), null);
  });
});

describe('emily pairs + routine template', () => {
  it('returns complementary products for a cleanser', () => {
    const cleanser = products.find((p) => p.id === 'green-tea-citrus-cleanser');
    const result = emilyPairsWith(cleanser, products, { limit: 3 });
    assert.ok(result.pairs.length >= 1);
    assert.ok(result.why.length > 10);
    assert.equal(
      result.pairs.every((x) => x.product.id !== cleanser.id),
      true
    );
  });

  it('builds AM template with SPF', () => {
    const steps = defaultRoutineTemplate(products, 'am');
    assert.ok(steps.some((s) => s.category === 'SPF'));
    assert.ok(steps.some((s) => s.product));
  });
});
