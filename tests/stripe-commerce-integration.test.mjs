/**
 * Stripe session → durable commerce persistence integration tests.
 */
import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  markOrderPaidFromSessionAsync,
  persistPendingCheckoutOrder
} from '../lib/stripe-orders.js';
import {
  resetCommerceBackendForTests,
  commerceFindOrderByStripeSession,
  commerceGetFulfillmentJobByOrder,
  commerceGetOrder,
  commerceUpsertWebhookEvent,
  commerceGetWebhookEvent,
  commerceMarkWebhookProcessed
} from '../lib/commerce/index.js';
import { mutateStore } from '../lib/store.js';

function stripeSession(suffix = Date.now(), extras = {}) {
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
      total: '56',
      ...extras.metadata
    },
    client_reference_id: extras.client_reference_id,
    ...extras
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

describe('pending checkout → durable → webhook (Workers-safe)', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('preserves line items when pending exists only in durable commerce', async () => {
    const suffix = Date.now();
    const orderId = `ord_pending_${suffix}`;
    const sessionId = `cs_test_pending_${suffix}`;
    const items = [
      {
        product_id: 'green-tea-citrus-cleanser',
        name: 'Green Tea Citrus Cleanser',
        quantity: 1,
        unit_price: 32,
        variant: null
      },
      {
        product_id: 'ageless-moisturizer',
        name: 'Ageless Moisturizer',
        quantity: 1,
        unit_price: 24,
        variant: null
      }
    ];

    await persistPendingCheckoutOrder({
      id: orderId,
      stripe_session_id: sessionId,
      stripe_checkout_url: 'https://checkout.stripe.test/session',
      idempotency_key: `idem_${suffix}`,
      customer: { name: 'Pending Test', email: 'pending@test.example.com' },
      items,
      subtotal: 56,
      shipping_fee: 0,
      discount_code: null,
      discount_amount: 0,
      total: 56,
      status: 'pending_payment',
      shipping_address: {
        line1: '1 Test St',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        country: 'US'
      },
      created_at: new Date().toISOString()
    });

    // Simulate multi-isolate: wipe ephemeral store orders so webhook cannot see them.
    mutateStore((s) => {
      s.orders = [];
      return s;
    });

    const session = stripeSession(suffix, {
      id: sessionId,
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        subtotal: '56',
        shipping_fee: '0',
        total: '56',
        item_count: '2',
        product_ids: 'green-tea-citrus-cleanser,ageless-moisturizer'
      }
    });

    const result = await markOrderPaidFromSessionAsync(session, {
      allowSparseCreate: false
    });

    assert.equal(result.created, false);
    assert.equal(result.order.id, orderId);
    assert.equal(result.order.status, 'paid');
    assert.equal(result.order.items.length, 2);
    assert.equal(result.order.items[0].product_id, 'green-tea-citrus-cleanser');
    assert.equal(result.order.sparse, undefined);

    const durable = await commerceGetOrder(orderId);
    assert.ok(durable);
    assert.equal(durable.items.length, 2);
    assert.equal(durable.status, 'paid');

    const job = await commerceGetFulfillmentJobByOrder(orderId);
    assert.ok(job);
    assert.equal(job.status, 'queued_for_supplier');
  });

  it('refuses sparse create when allowSparseCreate is false', async () => {
    const session = stripeSession(`missing_${Date.now()}`, {
      metadata: { order_id: `ord_missing_${Date.now()}` }
    });
    await assert.rejects(
      () => markOrderPaidFromSessionAsync(session, { allowSparseCreate: false }),
      (err) => err?.code === 'pending_order_missing'
    );
  });

  it('durable webhook event mark is readable for replay skip', async () => {
    const id = `evt_test_${Date.now()}`;
    await commerceUpsertWebhookEvent({
      id,
      type: 'checkout.session.completed',
      processed: 0,
      at: new Date().toISOString()
    });
    await commerceMarkWebhookProcessed(id);
    const row = await commerceGetWebhookEvent(id);
    assert.ok(row);
    assert.ok(row.processed === 1 || row.processed === true);
  });
});
