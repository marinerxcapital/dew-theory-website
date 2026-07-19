import { NextResponse } from 'next/server';
import { mutateStore, readStore, trackEvent } from '@/lib/store';

/**
 * Resolve Stripe Checkout session → mark order paid, return order id.
 * GET ?session_id=cs_...
 */
export async function GET(request) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const store = readStore();
  let order = store.orders.find((o) => o.stripe_session_id === sessionId);

  // If Stripe is configured, verify session payment status
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid' || session.status === 'complete') {
        mutateStore((s) => {
          const idx = s.orders.findIndex((o) => o.stripe_session_id === sessionId);
          if (idx >= 0) {
            s.orders[idx] = {
              ...s.orders[idx],
              status: 'paid',
              stripe_session_id: sessionId
            };
            order = s.orders[idx];
          } else {
            // Session paid but no pre-record — create minimal order from metadata
            const id = `ord_${Date.now()}`;
            order = {
              id,
              stripe_session_id: sessionId,
              customer: {
                name: session.customer_details?.name || '',
                email: session.customer_email || session.customer_details?.email || ''
              },
              items: [],
              subtotal: Number(session.metadata?.subtotal || 0),
              shipping_fee: Number(session.metadata?.shipping_fee || 0),
              discount_code: session.metadata?.discount_code || null,
              discount_amount: 0,
              total: (session.amount_total || 0) / 100,
              status: 'paid',
              shipping_address: session.shipping_details?.address || {},
              created_at: new Date().toISOString()
            };
            s.orders.unshift(order);
          }
          return s;
        });
        trackEvent('checkout_completed', {
          order_id: order?.id,
          stripe_session_id: sessionId
        });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err.message || 'Could not verify session' },
        { status: 502 }
      );
    }
  }

  if (!order) {
    // Local lookup only (mock / pre-record without Stripe verify)
    order = readStore().orders.find((o) => o.stripe_session_id === sessionId);
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found for session' }, { status: 404 });
  }

  return NextResponse.json({
    order_id: order.id,
    status: order.status,
    total: order.total
  });
}
