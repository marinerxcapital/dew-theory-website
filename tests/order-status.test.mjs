/**
 * G3 — Order status filter + validation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateOrderStatus,
  filterOrdersByStatus,
  ORDER_STATUSES
} from '../lib/order-status.js';

describe('validateOrderStatus', () => {
  it('accepts known statuses including submitted_to_skin_script', () => {
    for (const s of ORDER_STATUSES) {
      assert.equal(validateOrderStatus(s).ok, true);
    }
  });
  it('rejects unknown', () => {
    const r = validateOrderStatus('shipped_via_fedex');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_unknown');
  });
});

describe('filterOrdersByStatus', () => {
  const orders = [
    { id: '1', status: 'paid' },
    { id: '2', status: 'submitted_to_skin_script' },
    { id: '3', status: 'paid' }
  ];
  it('returns all when filter all', () => {
    assert.equal(filterOrdersByStatus(orders, 'all').length, 3);
  });
  it('filters paid', () => {
    assert.deepEqual(
      filterOrdersByStatus(orders, 'paid').map((o) => o.id),
      ['1', '3']
    );
  });
  it('filters submitted_to_skin_script', () => {
    assert.equal(filterOrdersByStatus(orders, 'submitted_to_skin_script').length, 1);
  });
});
