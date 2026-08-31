/**
 * Shared helpers: Stripe Checkout session → local order status.
 * Used by success-page session resolve and /api/webhooks/stripe.
 *
 * Durable commerce persistence (D1/file) mirrors paid orders + fulfillment jobs.
 */
import { mutateStore, readStore, trackEvent } from './store.js';
import { persistPaidOrderWithJob } from './fulfillment/jobs.js';
import { commerceFindOrderByStripeSession, commerceUpsertOrder } from './commerce/index.js';

/**
 * Mark order paid (or create minimal order) from a Stripe Checkout Session object.
 * @param {object} session - Stripe Checkout.Session
 * @returns {{ order: object, created: boolean, alreadyPaid?: boolean }}
 */
export function markOrderPaidFromSession(session) {
  if (!session?.id) throw new Error('session required');

  const sessionId = session.id;
  let created = false;
  let order = null;
  let flippedToPaid = false;

  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.stripe_session_id === sessionId);
    if (idx >= 0) {
      const prev = s.orders[idx];
      const alreadyPaid =
        prev.status === 'paid' ||
        prev.status === 'fulfilled' ||
        prev.status === 'submitted_to_skin_script' ||
        prev.status === 'queued_for_supplier';
      flippedToPaid = !alreadyPaid;
      s.orders[idx] = {
        ...prev,
        status: alreadyPaid ? prev.status : 'paid',
        stripe_session_id: sessionId,
        stripe_payment_intent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || prev.stripe_payment_intent || null,
        paid_at: prev.paid_at || new Date().toISOString()
      };
      if (!alreadyPaid && prev.discount_code) {
        const d = s.discount_codes.find(
          (c) => c.code?.toUpperCase() === String(prev.discount_code).toUpperCase()
        );
        if (d) d.uses_count = (d.uses_count || 0) + 1;
      }
      order = s.orders[idx];
      return s;
    }

    created = true;
    flippedToPaid = true;
    const id = `ord_${Date.now()}`;
    order = {
      id,
      stripe_session_id: sessionId,
      stripe_payment_intent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null,
      customer: {
        name: session.customer_details?.name || '',
        email: session.customer_email || session.customer_details?.email || ''
      },
      items: [],
      subtotal: Number(session.metadata?.subtotal || 0),
      shipping_fee: Number(session.metadata?.shipping_fee || 0),
      discount_code: session.metadata?.discount_code || null,
      discount_amount: Number(session.metadata?.discount_amount || 0),
      total: (session.amount_total || 0) / 100,
      status: 'paid',
      shipping_address: session.shipping_details?.address || session.customer_details?.address || {},
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      source: 'stripe_webhook_or_session'
    };
    s.orders.unshift(order);

    if (order.discount_code) {
      const d = s.discount_codes.find(
        (c) => c.code?.toUpperCase() === String(order.discount_code).toUpperCase()
      );
      if (d) d.uses_count = (d.uses_count || 0) + 1;
    }
    return s;
  });

  trackEvent('checkout_completed', {
    order_id: order?.id,
    stripe_session_id: sessionId,
    source: created ? 'session_created' : 'session_updated'
  });

  // Durable paid order + fulfillment job outbox (async; must not block webhook response)
  if (order?.id && flippedToPaid) {
    persistPaidOrderWithJob(order).catch(() => {});
  } else if (order?.id) {
    commerceUpsertOrder(order).catch(() => {});
  }

  if (order?.id && order.status === 'paid') {
    import('./dropship/fulfill-order.js')
      .then(({ maybeAutoFulfill, shouldAutoFulfill }) => {
        if (shouldAutoFulfill()) return maybeAutoFulfill(order.id);
        return null;
      })
      .catch(() => {});

    if (!order.confirmation_email_at) {
      import('./email.js')
        .then(({ sendOrderConfirmationEmail }) => sendOrderConfirmationEmail({ order }))
        .then((row) => {
          if (row && order?.id) {
            mutateStore((s) => {
              const idx = s.orders.findIndex((o) => o.id === order.id);
              if (idx >= 0) {
                s.orders[idx] = {
                  ...s.orders[idx],
                  confirmation_email_at: new Date().toISOString(),
                  confirmation_email_status: row.status
                };
              }
              return s;
            });
          }
        })
        .catch(() => {});
    }
  }

  return { order, created };
}

/**
 * Async variant for routes that can await durable persistence.
 * @param {object} session
 */
export async function markOrderPaidFromSessionAsync(session) {
  const result = markOrderPaidFromSession(session);
  if (result.order?.status === 'paid') {
    await persistPaidOrderWithJob(result.order).catch(() => {});
  }
  return result;
}

export function findOrderByStripeSession(sessionId) {
  return readStore().orders.find((o) => o.stripe_session_id === sessionId) || null;
}

export async function findOrderByStripeSessionAsync(sessionId) {
  const durable = await commerceFindOrderByStripeSession(sessionId);
  if (durable) return durable;
  return findOrderByStripeSession(sessionId);
}

/** Build Checkout Session metadata (string values only — Stripe requirement). */
export function buildSessionMetadata({
  orderId,
  customer,
  items,
  totals,
  idempotencyKey
}) {
  const productIds = (items || [])
    .map((i) => i.product_id)
    .join(',')
    .slice(0, 450);
  return {
    order_id: orderId || '',
    customer_email: customer?.email || '',
    customer_name: (customer?.name || '').slice(0, 200),
    item_count: String(items?.length || 0),
    product_ids: productIds,
    discount_code: totals?.discount_code || '',
    discount_amount: String(totals?.discount_amount ?? 0),
    subtotal: String(totals?.subtotal ?? 0),
    shipping_fee: String(totals?.shipping_fee ?? 0),
    total: String(totals?.total ?? 0),
    idempotency_key: idempotencyKey || '',
    app: 'dew-theory'
  };
}
