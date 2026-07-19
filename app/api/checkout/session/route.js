import { NextResponse } from 'next/server';
import {
  findOrderByStripeSession,
  markOrderPaidFromSession
} from '@/lib/stripe-orders';

/**
 * Resolve Stripe Checkout session → mark order paid, return order id.
 * GET ?session_id=cs_...
 * Complements webhooks (success-page recovery if webhook is delayed).
 */
export async function GET(request) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json(
      { error: 'session_id required', code: 'session_id_required' },
      { status: 400 }
    );
  }

  // Stripe configured: verify then mark paid
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required' ||
        session.status === 'complete'
      ) {
        const { order } = markOrderPaidFromSession(session);
        return NextResponse.json({
          order_id: order.id,
          status: order.status,
          total: order.total,
          code: 'session_paid'
        });
      }
      return NextResponse.json(
        {
          error: 'Payment not completed',
          code: 'session_unpaid',
          payment_status: session.payment_status
        },
        { status: 402 }
      );
    } catch (err) {
      return NextResponse.json(
        { error: err.message || 'Could not verify session', code: 'session_verify_failed' },
        { status: 502 }
      );
    }
  }

  // No Stripe key: local lookup only (mock path does not create stripe_session_id usually)
  const order = findOrderByStripeSession(sessionId);
  if (!order) {
    return NextResponse.json(
      {
        error: 'Order not found for session',
        code: 'order_not_found',
        hint: 'Without STRIPE_SECRET_KEY, checkout is mock mode and returns order_id directly.'
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order_id: order.id,
    status: order.status,
    total: order.total,
    code: 'session_local'
  });
}
