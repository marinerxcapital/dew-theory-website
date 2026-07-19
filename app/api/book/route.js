import { NextResponse } from 'next/server';
import { getService } from '@/lib/services';
import { mutateStore, trackEvent } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const service = getService(body.service_id);
    if (!service) {
      return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
    }
    if (!body.start_time) {
      return NextResponse.json({ error: 'Select a time' }, { status: 400 });
    }
    const start = new Date(body.start_time);
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Choose a future time' }, { status: 400 });
    }
    const customer = body.customer || {};
    const name = String(customer.name || '').trim().slice(0, 200);
    const email = String(customer.email || '').trim().slice(0, 320);
    if (!name || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Name and valid email required' }, { status: 400 });
    }

    // Idempotency-ish: reject duplicate open booking same service + start + email
    const store = mutateStore((s) => s);
    const dup = store.appointments.find(
      (a) =>
        a.service_id === service.id &&
        a.start_time === body.start_time &&
        a.customer?.email?.toLowerCase() === email.toLowerCase() &&
        a.status === 'confirmed'
    );
    if (dup) {
      return NextResponse.json({
        appointment_id: dup.id,
        appointment: dup,
        duplicate: true
      });
    }

    const appointmentId = `apt_${Date.now()}`;
    const appointment = {
      id: appointmentId,
      service_id: service.id,
      service_name: service.name,
      start_time: body.start_time,
      duration_minutes: service.duration_minutes,
      price: service.price,
      status: 'confirmed',
      customer: {
        name,
        email,
        phone: String(customer.phone || '').slice(0, 40),
        notes: String(customer.notes || '').slice(0, 2000)
      },
      calendar_event_id: null,
      created_at: new Date().toISOString()
    };

    mutateStore((s) => {
      s.appointments.unshift(appointment);
      return s;
    });

    trackEvent('booking_confirmed', {
      appointment_id: appointmentId,
      service_id: service.id
    });

    // Optional: send confirmation email when transactional email is wired
    // Optional: create Google Calendar event when GOOGLE_CALENDAR credentials exist

    return NextResponse.json({ appointment_id: appointmentId, appointment });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Booking failed' },
      { status: 500 }
    );
  }
}
