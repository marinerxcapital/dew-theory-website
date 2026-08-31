/**
 * Stripe session → durable commerce persistence integration tests.
 */
import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { markOrderPaidFromSessionAsync } from '../lib/stripe-orders.js';
import {
  resetCommerceBackendForTests,
  commerceFindOrderByStripeSession,
  commerceGetFulfillmentJobByOrder
} from '../lib/commerce/index.js';

function stripeSession(suffix = Date.now()) {
  return {
    id: `cs_test_${suffix}`,
    payment_intent: `pi_test_${suffix}`,
    amount_total: 5600,
    customer_details: {
      name: 'Integration Test',
      email: 'integration@test.example.com'
    },
    metadata: {
      subtotal: '56',
      shipping_fee: '0',
      total: '56'
    }
  };
}

describe('markOrderPaidFromSessionAsync → durable commerce', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('persists paid order and fulfillment job to commerce backend', async () => {
    const session = stripeSession();
    const result = await markOrderPaidFromSessionAsync(session);

    assert.ok(result.order?.id);
    assert.equal(result.order.status, 'paid');
    assert.equal(result.order.stripe_session_id, session.id);

    const durable = await commerceFindOrderByStripeSession(session.id);
    assert.ok(durable);
    assert.equal(durable.id, result.order.id);
    assert.equal(durable.status, 'paid');

    const job = await commerceGetFulfillmentJobByOrder(result.order.id);
    assert.ok(job);
    assert.equal(job.status, 'queued_for_supplier');
    assert.equal(job.supplier, 'skin_script');
  });

  it('is idempotent when the same Stripe session is processed twice', async () => {
    const session = stripeSession();
    const first = await markOrderPaidFromSessionAsync(session);
    const second = await markOrderPaidFromSessionAsync(session);

    assert.equal(second.order.id, first.order.id);
    assert.equal(second.created, false);

    const job = await commerceGetFulfillmentJobByOrder(first.order.id);
    assert.ok(job);
    assert.equal(job.status, 'queued_for_supplier');
  });
});
