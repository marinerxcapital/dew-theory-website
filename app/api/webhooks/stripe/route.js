import { NextResponse } from 'next/server';
import { markOrderPaidFromSession } from '@/lib/stripe-orders';
import { mutateStore } from '@/lib/store';

/**
 * Stripe webhook stub — checkout.session.completed / async payment → order paid.
 *
 * Configure in Stripe Dashboard:
 *   Endpoint: https://<host>/api/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.async_payment_succeeded
 *   Secret → STRIPE_WEBHOOK_SECRET
 *
 * Without STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET, returns 503 (not a silent no-op).
 * Local mock checkout does not need this route — orders are marked paid immediately.
 */
export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return NextResponse.json(
      {
        error: 'Stripe not configured',
        code: 'stripe_not_configured',
        hint: 'Mock checkout is used when STRIPE_SECRET_KEY is unset. Webhooks only apply with live/test Stripe keys.'
      },
      { status: 503 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: 'STRIPE_WEBHOOK_SECRET missing',
        code: 'webhook_secret_missing',
        hint: 'Set STRIPE_WEBHOOK_SECRET from the Stripe Dashboard webhook endpoint.'
      },
      { status: 503 }
    );
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey);

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature', code: 'missing_signature' },
      { status: 400 }
    );
  }

  // Raw body required for signature verification
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || 'Invalid signature',
        code: 'invalid_signature'
      },
      { status: 400 }
    );
  }

  // Audit webhook receipt (no PII beyond event type/id)
  mutateStore((s) => {
    if (!s.webhook_events) s.webhook_events = [];
    s.webhook_events.unshift({
      id: event.id,
      type: event.type,
      at: new Date().toISOString()
    });
    s.webhook_events = s.webhook_events.slice(0, 100);
    return s;
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        // Only mark paid when payment succeeded (or no payment required)
        if (
          session.payment_status === 'paid' ||
          session.payment_status === 'no_payment_required' ||
          event.type === 'checkout.session.async_payment_succeeded'
        ) {
          const { order } = markOrderPaidFromSession(session);
          return NextResponse.json({
            received: true,
            order_id: order?.id,
            code: 'order_marked_paid'
          });
        }
        return NextResponse.json({
          received: true,
          code: 'session_not_paid_yet',
          payment_status: session.payment_status
        });
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        mutateStore((s) => {
          const idx = s.orders.findIndex((o) => o.stripe_session_id === session.id);
          if (idx >= 0 && s.orders[idx].status === 'pending_payment') {
            s.orders[idx] = { ...s.orders[idx], status: 'payment_failed' };
          }
          return s;
        });
        return NextResponse.json({ received: true, code: 'payment_failed_recorded' });
      }
      default:
        return NextResponse.json({ received: true, code: 'event_ignored', type: event.type });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Webhook handler failed', code: 'webhook_handler_error' },
      { status: 500 }
    );
  }
}

// App Router: no body parsing config needed when using request.text()
export const runtime = 'nodejs';
