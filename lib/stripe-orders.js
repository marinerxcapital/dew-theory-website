/**
 * Shared helpers: Stripe Checkout session → local order status.
 * Used by success-page session resolve and /api/webhooks/stripe.
 */
import { mutateStore, readStore, trackEvent } from './store.js';

/**
 * Mark order paid (or create minimal order) from a Stripe Checkout Session object.
 * @param {object} session - Stripe Checkout.Session
 * @returns {{ order: object, created: boolean }}
 */
export function markOrderPaidFromSession(session) {
  if (!session?.id) throw new Error('session required');

  const sessionId = session.id;
  let created = false;
  let order = null;

  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.stripe_session_id === sessionId);
    if (idx >= 0) {
      const prev = s.orders[idx];
      const alreadyPaid =
        prev.status === 'paid' ||
        prev.status === 'fulfilled' ||
        prev.status === 'submitted_to_skin_script' ||
        prev.status === 'queued_for_supplier';
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
      // Increment promo uses once when flipping to paid
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

  // Enqueue auto-fulfill for newly paid orders (best-effort; does not block)
  if (order?.id && order.status === 'paid') {
    import('./dropship/fulfill-order.js')
      .then(({ maybeAutoFulfill, shouldAutoFulfill }) => {
        if (shouldAutoFulfill()) return maybeAutoFulfill(order.id);
        return null;
      })
      .catch(() => {});
  }

  return { order, created };
}

export function findOrderByStripeSession(sessionId) {
  return readStore().orders.find((o) => o.stripe_session_id === sessionId) || null;
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
