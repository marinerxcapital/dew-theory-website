import { NextResponse } from 'next/server';
import { cartTotals } from '@/lib/discounts';
import { mutateStore, trackEvent } from '@/lib/store';
import { productById } from '@/lib/products';

export async function POST(request) {
  try {
    const body = await request.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (!rawItems.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Re-price from catalog — never trust client unit_price alone
    const items = rawItems.map((li) => {
      const product = productById(li.product_id);
      if (!product) throw new Error(`Unknown product ${li.product_id}`);
      if (product.variants?.length && !li.variant) {
        throw new Error(`Variant required for ${product.name}`);
      }
      return {
        product_id: product.id,
        name: product.name,
        quantity: Math.max(1, Math.min(20, Number(li.quantity) || 1)),
        unit_price: product.retail_price,
        variant: li.variant || null
      };
    });

    let discountCode = null;
    if (body.discount_code) {
      const store = mutateStore((s) => s);
      discountCode =
        store.discount_codes.find(
          (d) => d.code.toUpperCase() === String(body.discount_code).toUpperCase() && d.active
        ) || null;
    }

    const totals = cartTotals(items, discountCode);
    const customer = body.customer || {};
    const shipping_address = body.shipping_address || {};

    if (!customer.email || !customer.name) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    trackEvent('checkout_started', { item_count: items.length });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';

      const line_items = items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: i.variant ? `${i.name} (${i.variant})` : i.name
          },
          unit_amount: Math.round(i.unit_price * 100)
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

      const sessionParams = {
        mode: 'payment',
        line_items,
        success_url: `${origin}/cart/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        customer_email: customer.email,
        metadata: {
          discount_code: totals.discount_code || '',
          subtotal: String(totals.subtotal),
          shipping_fee: String(totals.shipping_fee)
        },
        shipping_address_collection: { allowed_countries: ['US', 'CA'] }
      };

      // Apply Stripe promotion code if configured as a real promo
      if (discountCode?.stripe_promotion_code_id) {
        sessionParams.discounts = [{ promotion_code: discountCode.stripe_promotion_code_id }];
      } else if (totals.discount_amount > 0) {
        // Local percentage: create a one-off coupon for this session
        const coupon = await stripe.coupons.create({
          percent_off: discountCode?.type === 'percentage' ? discountCode.value : undefined,
          amount_off:
            discountCode?.type === 'fixed' ? Math.round(discountCode.value * 100) : undefined,
          currency: discountCode?.type === 'fixed' ? 'usd' : undefined,
          duration: 'once'
        });
        sessionParams.discounts = [{ coupon: coupon.id }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      // Pre-record pending order
      const orderId = `ord_${Date.now()}`;
      mutateStore((s) => {
        s.orders.unshift({
          id: orderId,
          stripe_session_id: session.id,
          customer,
          items,
          ...totals,
          status: 'pending_payment',
          shipping_address,
          created_at: new Date().toISOString()
        });
        return s;
      });

      return NextResponse.json({ url: session.url, order_id: orderId });
    }

    // Local mock checkout (no Stripe keys)
    const orderId = `ord_${Date.now()}`;
    mutateStore((s) => {
      s.orders.unshift({
        id: orderId,
        customer,
        items,
        ...totals,
        status: 'paid',
        shipping_address,
        created_at: new Date().toISOString()
      });
      if (discountCode) {
        const d = s.discount_codes.find((c) => c.id === discountCode.id);
        if (d) d.uses_count = (d.uses_count || 0) + 1;
      }
      return s;
    });
    trackEvent('checkout_completed', { order_id: orderId });

    return NextResponse.json({ order_id: orderId, mock: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
