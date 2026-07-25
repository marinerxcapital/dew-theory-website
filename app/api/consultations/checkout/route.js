import { NextResponse } from 'next/server';
import { getConsultationConfig, getSiteUrl } from '@/lib/consultations/config.js';
import {
  attachStripeSession,
  createPendingConsultation,
  markConsultationPaidFromSession
} from '@/lib/consultations/service.js';
import { sendPaymentReceivedEmail } from '@/lib/consultations/emails.js';
import { trackEvent } from '@/lib/store.js';

function jsonError(payload, status = 400) {
  return NextResponse.json(
    {
      error: payload.error || 'Checkout failed',
      code: payload.code || 'checkout_error'
    },
    { status }
  );
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError({ error: 'Invalid JSON', code: 'invalid_json' });
    }

    const name = String(body.name || body.customer?.name || '')
      .trim()
      .slice(0, 200);
    const email = String(body.email || body.customer?.email || '')
      .trim()
      .toLowerCase()
      .slice(0, 320);

    if (!name) {
      return jsonError({ error: 'Name is required', code: 'name_required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError({ error: 'Valid email is required', code: 'email_invalid' });
    }

    const consent = body.consent === true || body.consent === 'true';
    if (!consent) {
      return jsonError({
        error: 'Please accept the consultation terms to continue',
        code: 'consent_required'
      });
    }

    const cfg = getConsultationConfig();
    const { consultation, intakeToken } = createPendingConsultation({
      name,
      email,
      source: 'virtual-consultation'
    });

    const site = getSiteUrl();
    const successUrl = `${site}/virtual-consultation/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${site}/virtual-consultation?cancelled=1`;

    // Mock checkout when Stripe not configured (local / CI)
    if (!cfg.stripeConfigured) {
      if (!cfg.mockCheckoutAllowed) {
        return jsonError(
          {
            error:
              'Virtual consultation checkout is not configured. Set STRIPE_SECRET_KEY and STRIPE_VIRTUAL_CONSULTATION_PRICE_ID.',
            code: 'stripe_not_configured'
          },
          503
        );
      }

      const mockSession = {
        id: `cs_mock_vc_${consultation.id}`,
        payment_status: 'paid',
        amount_total: cfg.displayPriceCents || 0,
        currency: 'usd',
        customer_email: email,
        customer_details: { name, email },
        metadata: {
          consultation_id: consultation.id,
          service_type: 'virtual_consultation',
          source: 'virtual-consultation',
          environment: process.env.NODE_ENV || 'development'
        }
      };

      attachStripeSession(consultation.id, mockSession);
      const { consultation: paid } = markConsultationPaidFromSession(mockSession);
      // Mint a fresh intake token path: use the one from createPendingConsultation
      await sendPaymentReceivedEmail({ consultation: paid || consultation, intakeToken });

      trackEvent('virtual_consultation_payment_completed', {
        consultation_id: consultation.id,
        mock: true
      });

      return NextResponse.json({
        mock: true,
        consultation_id: consultation.id,
        public_ref: consultation.public_ref,
        url: `${site}/virtual-consultation/success?session_id=${mockSession.id}&mock=1`
      });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price: cfg.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: consultation.id,
      metadata: {
        consultation_id: consultation.id,
        service_type: 'virtual_consultation',
        source: 'virtual-consultation',
        environment: process.env.NODE_ENV || 'development',
        client_name: name,
        client_email: email,
        price_id: cfg.priceId
      },
      payment_intent_data: {
        metadata: {
          consultation_id: consultation.id,
          service_type: 'virtual_consultation'
        }
      }
    });

    attachStripeSession(consultation.id, session);

    // Store intake token encrypted-side: re-hash only; email on webhook with regenerated?
    // We keep intake_token_hash from create; send email on webhook by minting is not possible without raw token.
    // Solution: store a one-time encrypted field until paid email sent.
    const { mutateStore } = await import('@/lib/store.js');
    mutateStore((s) => {
      const idx = s.consultations?.findIndex((c) => c.id === consultation.id);
      if (idx >= 0) {
        s.consultations[idx]._intake_token_once = intakeToken;
      }
      return s;
    });

    return NextResponse.json({
      mock: false,
      consultation_id: consultation.id,
      public_ref: consultation.public_ref,
      url: session.url,
      session_id: session.id
    });
  } catch (err) {
    console.error('[vc-checkout]', err?.message || err);
    return jsonError(
      { error: 'Unable to start checkout', code: 'checkout_failed' },
      500
    );
  }
}

export const runtime = 'nodejs';
