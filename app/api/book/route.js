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
    const customer = body.customer || {};
    if (!customer.name || !customer.email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    trackEvent('booking_started');
    trackEvent('booking_service_selected', { service_id: service.id });
    trackEvent('booking_time_selected', { start_time: body.start_time });

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
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        notes: customer.notes || ''
      },
      calendar_event_id: null, // Google Calendar when OAuth is configured
      created_at: new Date().toISOString()
    };

    mutateStore((s) => {
      s.appointments.unshift(appointment);
      return s;
    });

    trackEvent('booking_confirmed', { appointment_id: appointmentId });

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
