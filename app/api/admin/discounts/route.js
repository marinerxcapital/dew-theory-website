import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { audit, mutateStore } from '@/lib/store';

export async function POST(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json();
    const code = String(body.code || '')
      .trim()
      .toUpperCase()
      .slice(0, 40);
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Code may only use letters, numbers, _ and -', code: 'code_invalid' },
        { status: 400 }
      );
    }
    const value = Number(body.value);
    if (Number.isNaN(value) || value <= 0) {
      return NextResponse.json(
        { error: 'Value must be a positive number', code: 'value_invalid' },
        { status: 400 }
      );
    }
    if (body.type !== 'fixed' && value > 100) {
      return NextResponse.json(
        { error: 'Percentage cannot exceed 100', code: 'value_invalid' },
        { status: 400 }
      );
    }

    let stripeId = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const coupon =
          body.type === 'percentage'
            ? await stripe.coupons.create({ percent_off: body.value, duration: 'once' })
            : await stripe.coupons.create({
                amount_off: Math.round(body.value * 100),
                currency: 'usd',
                duration: 'once'
              });
        const promo = await stripe.promotionCodes.create({
          coupon: coupon.id,
          code,
          metadata: {
            referrer_customer_id: body.referrer_customer_id || ''
          }
        });
        stripeId = promo.id;
      } catch {
        // Local create still proceeds if Stripe promo fails
      }
    }

    const discount = {
      id: `dc_${Date.now()}`,
      code,
      type: body.type === 'fixed' ? 'fixed' : 'percentage',
      value,
      referrer_customer_id: body.referrer_customer_id
        ? String(body.referrer_customer_id).slice(0, 120)
        : null,
      max_uses: body.max_uses != null && body.max_uses !== '' ? Number(body.max_uses) : null,
      uses_count: 0,
      expires_at: body.expires_at || null,
      active: true,
      stripe_promotion_code_id: stripeId,
      created_at: new Date().toISOString()
    };

    mutateStore((s) => {
      if (s.discount_codes.some((d) => d.code === code)) {
        throw new Error('Code already exists');
      }
      s.discount_codes.unshift(discount);
      return s;
    });

    audit(admin.id, 'discount.create', 'DiscountCodes', discount.id, { after: discount });
    return NextResponse.json({ discount });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Create failed' }, { status: 400 });
  }
}
