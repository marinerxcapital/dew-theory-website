/**
 * Shared helpers: Stripe Checkout session → local order status.
 * Used by success-page session resolve and /api/webhooks/stripe.
 *
 * Durable commerce persistence (D1/file) is the Workers-safe source of truth
 * for pending + paid shop orders. Ephemeral lib/store.js is a best-effort mirror.
 */
import { mutateStore, readStore, trackEvent } from './store.js';
import { persistPaidOrderWithJob } from './fulfillment/jobs.js';
import {
  commerceFindOrderByStripeSession,
  commerceGetOrder,
  commerceUpsertOrder
} from './commerce/index.js';

function paymentIntentId(session) {
  return typeof session?.payment_intent === 'string'
    ? session.payment_intent
    : session?.payment_intent?.id || null;
}

function sessionOrderId(session) {
  return (
    session?.metadata?.order_id ||
    session?.client_reference_id ||
    null
  );
}

function alreadyPaidStatus(status) {
  return (
    status === 'paid' ||
    status === 'fulfilled' ||
    status === 'submitted_to_skin_script' ||
    status === 'queued_for_supplier'
  );
}

function mergePaidFields(prev, session) {
  const alreadyPaid = alreadyPaidStatus(prev.status);
  return {
    ...prev,
    status: alreadyPaid ? prev.status : 'paid',
    stripe_session_id: session.id,
    stripe_payment_intent: paymentIntentId(session) || prev.stripe_payment_intent || null,
    paid_at: prev.paid_at || new Date().toISOString(),
    shipping_address:
      Object.keys(prev.shipping_address || {}).length > 0
        ? prev.shipping_address
        : session.shipping_details?.address ||
          session.customer_details?.address ||
          prev.shipping_address ||
          {},
    customer: {
      name: prev.customer?.name || session.customer_details?.name || '',
      email:
        prev.customer?.email ||
        session.customer_email ||
        session.customer_details?.email ||
        '',
      phone: prev.customer?.phone || ''
    }
  };
}

function bumpDiscountUse(discountCode) {
  if (!discountCode) return;
  mutateStore((s) => {
    const d = s.discount_codes.find(
      (c) => c.code?.toUpperCase() === String(discountCode).toUpperCase()
    );
    if (d) d.uses_count = (d.uses_count || 0) + 1;
    return s;
  });
}

function mirrorOrderInStore(order) {
  if (!order?.id) return;
  mutateStore((s) => {
    const idx = s.orders.findIndex(
      (o) => o.id === order.id || o.stripe_session_id === order.stripe_session_id
    );
    if (idx >= 0) {
      s.orders[idx] = { ...s.orders[idx], ...order };
    } else {
      s.orders.unshift(order);
    }
    return s;
  });
}

function schedulePaidSideEffects(order) {
  if (!order?.id || order.status !== 'paid') return;

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
          commerceUpsertOrder({
            ...order,
            confirmation_email_at: new Date().toISOString(),
            confirmation_email_status: row.status
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }
}

/**
 * Resolve an existing order for a Stripe session from durable commerce first,
 * then ephemeral store. Never invent a new order id when metadata carries one.
 * @param {object} session
 */
export async function resolveOrderForStripeSession(session) {
  if (!session?.id) throw new Error('session required');

  const bySession = await commerceFindOrderByStripeSession(session.id);
  if (bySession) return { order: bySession, source: 'commerce_session' };

  const metaId = sessionOrderId(session);
  if (metaId) {
    const byId = await commerceGetOrder(metaId);
    if (byId) return { order: byId, source: 'commerce_order_id' };
  }

  const storeBySession = readStore().orders.find((o) => o.stripe_session_id === session.id);
  if (storeBySession) return { order: storeBySession, source: 'store_session' };

  if (metaId) {
    const storeById = readStore().orders.find((o) => o.id === metaId);
    if (storeById) return { order: storeById, source: 'store_order_id' };
  }

  return { order: null, source: null };
}

/**
 * Mark order paid (or create minimal order) from a Stripe Checkout Session object.
 * Prefer markOrderPaidFromSessionAsync on Workers — this sync path cannot see D1.
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
      const alreadyPaid = alreadyPaidStatus(prev.status);
      flippedToPaid = !alreadyPaid;
      s.orders[idx] = mergePaidFields(prev, session);
      if (!alreadyPaid && prev.discount_code) {
        const d = s.discount_codes.find(
          (c) => c.code?.toUpperCase() === String(prev.discount_code).toUpperCase()
        );
        if (d) d.uses_count = (d.uses_count || 0) + 1;
      }
      order = s.orders[idx];
      return s;
    }

    const metaId = sessionOrderId(session);
    const byMeta = metaId ? s.orders.findIndex((o) => o.id === metaId) : -1;
    if (byMeta >= 0) {
      const prev = s.orders[byMeta];
      const alreadyPaid = alreadyPaidStatus(prev.status);
      flippedToPaid = !alreadyPaid;
      s.orders[byMeta] = mergePaidFields(prev, session);
      if (!alreadyPaid && prev.discount_code) {
        const d = s.discount_codes.find(
          (c) => c.code?.toUpperCase() === String(prev.discount_code).toUpperCase()
        );
        if (d) d.uses_count = (d.uses_count || 0) + 1;
      }
      order = s.orders[byMeta];
      return s;
    }

    created = true;
    flippedToPaid = true;
    const id = metaId || `ord_${Date.now()}`;
    order = {
      id,
      stripe_session_id: sessionId,
      stripe_payment_intent: paymentIntentId(session),
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
      source: 'stripe_webhook_or_session',
      sparse: true
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

  if (order?.id && flippedToPaid) {
    persistPaidOrderWithJob(order).catch(() => {});
  } else if (order?.id) {
    commerceUpsertOrder(order).catch(() => {});
  }

  schedulePaidSideEffects(order);

  return { order, created, alreadyPaid: !flippedToPaid && !created };
}

/**
 * Durable-first mark-paid for Workers-safe checkout reconciliation.
 * Loads pending order from commerce before flipping to paid; preserves line items.
 * @param {object} session
 * @param {{ allowSparseCreate?: boolean }} [opts]
 */
export async function markOrderPaidFromSessionAsync(session, opts = {}) {
  if (!session?.id) throw new Error('session required');
  const allowSparseCreate = opts.allowSparseCreate !== false;

  const resolved = await resolveOrderForStripeSession(session);
  let created = false;
  let flippedToPaid = false;
  let order = resolved.order;

  if (order) {
    const alreadyPaid = alreadyPaidStatus(order.status);
    flippedToPaid = !alreadyPaid;
    if (!alreadyPaid && order.discount_code) {
      bumpDiscountUse(order.discount_code);
    }
    order = mergePaidFields(order, session);
  } else if (allowSparseCreate) {
    // Last resort — prefer metadata order_id; mark sparse so ops can detect.
    created = true;
    flippedToPaid = true;
    const id = sessionOrderId(session) || `ord_${Date.now()}`;
    order = {
      id,
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntentId(session),
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
      source: 'stripe_webhook_or_session',
      sparse: true
    };
    if (order.discount_code) bumpDiscountUse(order.discount_code);
  } else {
    const err = new Error('Pending order not found in durable commerce for Stripe session');
    err.code = 'pending_order_missing';
    throw err;
  }

  mirrorOrderInStore(order);

  trackEvent('checkout_completed', {
    order_id: order?.id,
    stripe_session_id: session.id,
    source: created ? 'session_created' : 'session_updated',
    resolve_source: resolved.source || (created ? 'sparse_create' : 'unknown')
  });

  if (order?.id && flippedToPaid) {
    await persistPaidOrderWithJob(order);
  } else if (order?.id) {
    await commerceUpsertOrder(order);
  }

  schedulePaidSideEffects(order);

  return {
    order,
    created,
    alreadyPaid: !flippedToPaid && !created,
    resolve_source: resolved.source || (created ? 'sparse_create' : 'unknown')
  };
}

export function findOrderByStripeSession(sessionId) {
  return readStore().orders.find((o) => o.stripe_session_id === sessionId) || null;
}

export async function findOrderByStripeSessionAsync(sessionId) {
  const durable = await commerceFindOrderByStripeSession(sessionId);
  if (durable) return durable;
  return findOrderByStripeSession(sessionId);
}

/** Persist a pending checkout order to durable commerce (await before returning Checkout URL). */
export async function persistPendingCheckoutOrder(order) {
  if (!order?.id) throw new Error('order required');
  const saved = await commerceUpsertOrder({
    ...order,
    status: order.status || 'pending_payment'
  });
  mirrorOrderInStore(saved);
  return saved;
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
