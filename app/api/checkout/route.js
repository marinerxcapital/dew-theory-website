import { NextResponse } from 'next/server';
import {
  validateAndPriceItems,
  validateCustomer,
  validateShippingAddress,
  priceCart,
  normalizeIdempotencyKey
} from '@/lib/checkout';
import { resolveDiscountCode } from '@/lib/discounts';
import { getProducts } from '@/lib/products-server';
import { buildSessionMetadata } from '@/lib/stripe-orders';
import { mutateStore, readStore, trackEvent } from '@/lib/store';

function jsonError(payload, status = 400) {
  return NextResponse.json(
    {
      error: payload.error || 'Checkout failed',
      code: payload.code || 'checkout_error',
      ...(payload.field ? { field: payload.field } : {}),
      ...(payload.details ? { details: payload.details } : {})
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
      return jsonError({ error: 'Invalid JSON body', code: 'invalid_json' }, 400);
    }

    const idempotencyKey =
      normalizeIdempotencyKey(request.headers.get('idempotency-key')) ||
      normalizeIdempotencyKey(body.idempotency_key);

    // Return cached response for same idempotency key (24h window stored on order)
    if (idempotencyKey) {
      const existing = readStore().orders.find(
        (o) => o.idempotency_key === idempotencyKey
      );
      if (existing) {
        return NextResponse.json({
          order_id: existing.id,
          url: existing.stripe_checkout_url || null,
          mock: !existing.stripe_session_id,
          idempotent: true,
          status: existing.status
        });
      }
    }

    const priced = validateAndPriceItems(body.items, getProducts());
    if (!priced.ok) {
      return jsonError(priced, priced.status);
    }
    const { items } = priced;

    let discountCode = null;
    if (body.discount_code) {
      const resolved = resolveDiscountCode(
        body.discount_code,
        readStore().discount_codes || []
      );
      if (!resolved.ok) {
        return jsonError(
          { error: resolved.error, code: resolved.code },
          resolved.code === 'discount_not_found' || resolved.code === 'discount_inactive'
            ? 404
            : 400
        );
      }
      discountCode = resolved.discount;
    }

    const totals = priceCart(items, discountCode);

    const cust = validateCustomer(body.customer);
    if (!cust.ok) return jsonError(cust, cust.status);
    const { customer } = cust;

    const ship = validateShippingAddress(body.shipping_address);
    if (!ship.ok) return jsonError(ship, ship.status);
    const { shipping_address } = ship;

    trackEvent('checkout_started', {
      item_count: items.length,
      subtotal: totals.subtotal
    });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        request.headers.get('origin') ||
        'http://localhost:3000';

      const line_items = items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: i.variant ? `${i.name} (${i.variant})` : i.name
          },
          unit_amount: Math.round(Number(i.unit_price) * 100)
        },
        quantity: i.quantity
      }));

      if (totals.shipping_fee > 0) {
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: { name: 'Shipping' },
            unit_amount: Math.round(totals.shipping_fee * 100)
          },
          quantity: 1
        });
      }

      // Pre-generate order id so metadata carries it into Stripe + webhooks
      const orderId = `ord_${Date.now()}`;

      const sessionParams = {
        mode: 'payment',
        line_items,
        success_url: `${origin}/cart/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        customer_email: customer.email,
        client_reference_id: orderId,
        metadata: buildSessionMetadata({
          orderId,
          customer,
          items,
          totals,
          idempotencyKey
        }),
        shipping_address_collection: { allowed_countries: ['US', 'CA'] }
      };

      if (discountCode?.stripe_promotion_code_id) {
        sessionParams.discounts = [{ promotion_code: discountCode.stripe_promotion_code_id }];
      } else if (totals.discount_amount > 0 && discountCode) {
        const coupon =
          discountCode.type === 'percentage'
            ? await stripe.coupons.create({
                percent_off: discountCode.value,
                duration: 'once'
              })
            : await stripe.coupons.create({
                amount_off: Math.round(discountCode.value * 100),
                currency: 'usd',
                duration: 'once'
              });
        sessionParams.discounts = [{ coupon: coupon.id }];
      }

      const session = await stripe.checkout.sessions.create(
        sessionParams,
        idempotencyKey ? { idempotencyKey: `dew_checkout_${idempotencyKey}` } : undefined
      );

      mutateStore((s) => {
        s.orders.unshift({
          id: orderId,
          stripe_session_id: session.id,
          stripe_checkout_url: session.url,
          idempotency_key: idempotencyKey,
          customer,
          items,
          ...totals,
          status: 'pending_payment',
          shipping_address,
          created_at: new Date().toISOString()
        });
        return s;
      });

      return NextResponse.json({
        url: session.url,
        order_id: orderId,
        code: 'checkout_session_created',
        mode: 'stripe',
        totals
      });
    }

    // ── Local mock path (no STRIPE_SECRET_KEY) ──────────────────────────
    // Orders are written as paid immediately. No redirect to Stripe.
    // Webhooks are not used. Documented in docs/STRIPE.md.
    const orderId = `ord_${Date.now()}`;
    mutateStore((s) => {
      s.orders.unshift({
        id: orderId,
        idempotency_key: idempotencyKey,
        customer,
        items,
        ...totals,
        status: 'paid',
        shipping_address,
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        source: 'mock_checkout'
      });
      if (discountCode) {
        const d = s.discount_codes.find((c) => c.id === discountCode.id);
        if (d) d.uses_count = (d.uses_count || 0) + 1;
      }
      return s;
    });
    trackEvent('checkout_completed', { order_id: orderId, mode: 'mock' });

    return NextResponse.json({
      order_id: orderId,
      mock: true,
      mode: 'mock',
      code: 'checkout_mock_paid',
      totals
    });
  } catch (err) {
    return jsonError(
      {
        error: err.message || 'Checkout failed',
        code: 'checkout_internal'
      },
      500
    );
  }
}
