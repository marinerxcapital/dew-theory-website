import { NextResponse } from 'next/server';
import { markOrderPaidFromSession } from '@/lib/stripe-orders';
import { mutateStore, readStore } from '@/lib/store';
import { markConsultationPaidFromSession } from '@/lib/consultations/service.js';
import { sendPaymentReceivedEmail } from '@/lib/consultations/emails.js';
import { getStripeClient } from '@/lib/stripe/config.js';
import { commerceUpsertWebhookEvent, commerceMarkWebhookProcessed } from '@/lib/commerce/index.js';

/**
 * Stripe webhook — checkout.session.completed for shop orders + virtual consultations.
 *
 * Configure in Stripe Dashboard:
 *   Endpoint: https://<host>/api/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *           checkout.session.async_payment_failed
 *   Secret → STRIPE_WEBHOOK_SECRET
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

  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      {
        error: 'Stripe not configured',
        code: 'stripe_not_configured',
        hint: 'Mock checkout is used when STRIPE_SECRET_KEY is unset. Webhooks only apply with live/test Stripe keys.'
      },
      { status: 503 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature', code: 'missing_signature' },
      { status: 400 }
    );
  }

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

  // Idempotency: skip fully processed event IDs
  const prior = (readStore().webhook_events || []).find((e) => e.id === event.id && e.processed);
  if (prior) {
    return NextResponse.json({ received: true, code: 'event_replay_skipped', id: event.id });
  }

  mutateStore((s) => {
    if (!s.webhook_events) s.webhook_events = [];
    const existing = s.webhook_events.find((e) => e.id === event.id);
    if (existing) {
      existing.at = new Date().toISOString();
    } else {
      s.webhook_events.unshift({
        id: event.id,
        type: event.type,
        at: new Date().toISOString(),
        processed: false
      });
    }
    s.webhook_events = s.webhook_events.slice(0, 200);
    return s;
  });

  commerceUpsertWebhookEvent({
    id: event.id,
    type: event.type,
    event_type: event.type,
    processed: 0,
    payload: { type: event.type, livemode: event.livemode },
    at: new Date().toISOString()
  }).catch(() => {});

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (
          session.payment_status === 'paid' ||
          session.payment_status === 'no_payment_required' ||
          event.type === 'checkout.session.async_payment_succeeded'
        ) {
          const isConsultation =
            session.metadata?.service_type === 'virtual_consultation' ||
            Boolean(session.metadata?.consultation_id);

          if (isConsultation) {
            const { consultation, alreadyPaid } = markConsultationPaidFromSession(session);
            if (!alreadyPaid && consultation) {
              let intakeToken = null;
              mutateStore((s) => {
                const idx = s.consultations?.findIndex((c) => c.id === consultation.id);
                if (idx >= 0 && s.consultations[idx]._intake_token_once) {
                  intakeToken = s.consultations[idx]._intake_token_once;
                  delete s.consultations[idx]._intake_token_once;
                }
                return s;
              });
              if (intakeToken && consultation.client_email) {
                await sendPaymentReceivedEmail({ consultation, intakeToken });
              }
            }
            markProcessed(event.id);
            return NextResponse.json({
              received: true,
              consultation_id: consultation?.id,
              code: 'consultation_marked_paid'
            });
          }

          const { order } = markOrderPaidFromSession(session);
          markProcessed(event.id);
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
          const oIdx = s.orders.findIndex((o) => o.stripe_session_id === session.id);
          if (oIdx >= 0 && s.orders[oIdx].status === 'pending_payment') {
            s.orders[oIdx] = { ...s.orders[oIdx], status: 'payment_failed' };
          }
          if (Array.isArray(s.consultations)) {
            const cIdx = s.consultations.findIndex((c) => c.stripe_session_id === session.id);
            if (cIdx >= 0 && s.consultations[cIdx].payment_status === 'pending') {
              s.consultations[cIdx] = {
                ...s.consultations[cIdx],
                payment_status: 'failed',
                updated_at: new Date().toISOString()
              };
            }
          }
          return s;
        });
        markProcessed(event.id);
        return NextResponse.json({ received: true, code: 'payment_failed_recorded' });
      }
      default:
        markProcessed(event.id);
        return NextResponse.json({ received: true, code: 'event_ignored', type: event.type });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Webhook handler failed', code: 'webhook_handler_error' },
      { status: 500 }
    );
  }
}

function markProcessed(eventId) {
  mutateStore((s) => {
    if (!s.webhook_events) return s;
    const e = s.webhook_events.find((x) => x.id === eventId);
    if (e) e.processed = true;
    return s;
  });
  commerceMarkWebhookProcessed(eventId).catch(() => {});
}

export const runtime = 'nodejs';
