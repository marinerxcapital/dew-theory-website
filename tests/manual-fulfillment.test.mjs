/**
 * Owner manual fulfillment helper — pure status/patch builder
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildManualFulfillmentUpdate,
  resolveManualFulfillAction,
  MANUAL_FULFILL_ACTIONS
} from '../lib/admin/manual-fulfillment.js';
import { computeAutoFulfillEnabled } from '../lib/admin/dashboard.js';
import { shouldAutoFulfill } from '../lib/dropship/fulfill-order.js';

describe('resolveManualFulfillAction', () => {
  it('maps known actions to durable statuses', () => {
    assert.equal(resolveManualFulfillAction('mark_submitted').status, 'submitted_to_skin_script');
    assert.equal(resolveManualFulfillAction('mark_shipped').status, 'supplier_shipped');
    assert.equal(resolveManualFulfillAction('mark_fulfilled').status, 'fulfilled');
    assert.equal(resolveManualFulfillAction('mark_needs_review').status, 'submission_ambiguous');
  });

  it('rejects unknown action', () => {
    const r = resolveManualFulfillAction('teleport');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'action_unknown');
  });
});

describe('buildManualFulfillmentUpdate', () => {
  const baseOrder = {
    id: 'ord_test_1',
    status: 'paid',
    items: [{ product_id: 'p1', name: 'Serum', quantity: 1 }],
    created_at: '2026-09-04T12:00:00.000Z'
  };

  it('applies mark_submitted with vendor id and tracking', () => {
    const r = buildManualFulfillmentUpdate({
      order: baseOrder,
      job: { id: 'fj_1', order_id: 'ord_test_1', status: 'queued_for_supplier' },
      body: {
        action: 'mark_submitted',
        vendor_order_id: 'SS-PO-99',
        tracking_number: '1Z999',
        carrier: 'UPS'
      },
      now: '2026-09-04T14:00:00.000Z'
    });
    assert.equal(r.ok, true);
    assert.equal(r.order.status, MANUAL_FULFILL_ACTIONS.mark_submitted);
    assert.equal(r.order.supplier_order_id, 'SS-PO-99');
    assert.equal(r.order.tracking_number, '1Z999');
    assert.equal(r.order.carrier, 'UPS');
    assert.equal(r.order.fulfillment_mode, 'manual_owner');
    assert.equal(r.order.submitted_to_skin_script_at, '2026-09-04T14:00:00.000Z');
    assert.equal(r.job.status, 'submitted_to_skin_script');
    assert.equal(r.job.supplier_order_id, 'SS-PO-99');
  });

  it('marks needs review without requiring vendor id', () => {
    const r = buildManualFulfillmentUpdate({
      order: baseOrder,
      body: { action: 'mark_needs_review' },
      now: '2026-09-04T15:00:00.000Z'
    });
    assert.equal(r.ok, true);
    assert.equal(r.order.status, 'submission_ambiguous');
    assert.equal(r.job, null);
  });

  it('rejects unknown status string', () => {
    const r = buildManualFulfillmentUpdate({
      order: baseOrder,
      body: { status: 'shipped_via_telepathy' }
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_unknown');
  });
});

describe('autoFulfill alignment', () => {
  it('computeAutoFulfillEnabled matches shouldAutoFulfill', () => {
    const cases = [
      {},
      { AUTO_FULFILL: 'false' },
      { AUTO_FULFILL: '0' },
      { AUTO_FULFILL: 'FALSE' },
      { AUTO_FULFILL: 'true' },
      { SKIN_SCRIPT_MODE: 'rpa', SKIN_SCRIPT_RPA_ENABLED: 'true' },
      { SKIN_SCRIPT_MODE: 'rpa', SKIN_SCRIPT_RPA_ENABLED: 'false' },
      { SKIN_SCRIPT_MODE: 'mock' }
    ];
    for (const env of cases) {
      assert.equal(
        computeAutoFulfillEnabled(env),
        shouldAutoFulfill(env),
        `mismatch for ${JSON.stringify(env)}`
      );
    }
  });
});
