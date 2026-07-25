import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUTINE_ORDER,
  suggestRoutineComplements,
  suggestMissingRoutineSteps
} from '../lib/routine.js';

const catalog = [
  { id: 'c1', name: 'Cleanser A', category: 'Cleanser', active: true, stock_status: 'in_stock' },
  { id: 't1', name: 'Toner A', category: 'Toner', active: true, stock_status: 'in_stock' },
  { id: 's1', name: 'Serum A', category: 'Serum', active: true, stock_status: 'in_stock' },
  { id: 'm1', name: 'Moisturizer A', category: 'Moisturizer', active: true, stock_status: 'in_stock' },
  { id: 'spf1', name: 'SPF A', category: 'SPF', active: true, stock_status: 'in_stock' },
  { id: 's2', name: 'Serum B', category: 'Serum', active: false, stock_status: 'in_stock' }
];

describe('suggestRoutineComplements', () => {
  it('suggests later routine steps after a cleanser', () => {
    const picks = suggestRoutineComplements(catalog, 'c1', { limit: 3 });
    assert.equal(picks.length, 3);
    assert.ok(picks.every((p) => p.id !== 'c1'));
    assert.ok(!picks.some((p) => p.id === 's2')); // inactive filtered
  });

  it('returns empty for unknown product', () => {
    assert.deepEqual(suggestRoutineComplements(catalog, 'nope'), []);
  });
});

describe('suggestMissingRoutineSteps', () => {
  it('fills missing categories from cart', () => {
    const picks = suggestMissingRoutineSteps(
      [{ product_id: 'c1', category: 'Cleanser' }],
      catalog,
      { limit: 3 }
    );
    assert.ok(picks.length >= 1);
    assert.ok(picks.every((p) => p.category !== 'Cleanser'));
  });
});

describe('ROUTINE_ORDER', () => {
  it('starts with cleanser and ends with SPF', () => {
    assert.equal(ROUTINE_ORDER[0], 'Cleanser');
    assert.equal(ROUTINE_ORDER[ROUTINE_ORDER.length - 1], 'SPF');
  });
});
