import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/store';

const ALLOWED = new Set([
  'product_view',
  'add_to_cart',
  'checkout_started',
  'checkout_completed',
  'booking_started',
  'booking_service_selected',
  'booking_time_selected',
  'booking_confirmed',
  'membership_interest'
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const type = String(body.type || '');
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    const payload = { ...body };
    delete payload.type;
    // Cap payload size / strip noisy fields
    if (payload.product_id) payload.product_id = String(payload.product_id).slice(0, 120);
    if (payload.service_id) payload.service_id = String(payload.service_id).slice(0, 120);
    if (payload.variant) payload.variant = String(payload.variant).slice(0, 80);

    trackEvent(type, payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not record event' }, { status: 500 });
  }
}
