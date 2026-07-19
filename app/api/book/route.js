import { NextResponse } from 'next/server';
import { logInfo, logWarn } from '@/lib/log';
import { validateBookingRequest, buildAppointment } from '@/lib/booking';
import { SERVICES } from '@/lib/services';
import { mutateStore, readStore, trackEvent } from '@/lib/store';

function jsonError(payload, status = 400) {
  return NextResponse.json(
    {
      error: payload.error || 'Booking failed',
      code: payload.code || 'booking_error',
      ...(payload.field ? { field: payload.field } : {})
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

    const appointments = readStore().appointments || [];
    const result = validateBookingRequest(body, SERVICES, appointments);

    if (!result.ok) {
      logWarn('book.reject', { code: result.code, service_id: body?.service_id });
      return jsonError(result, result.status || 400);
    }

    if (result.duplicate) {
      return NextResponse.json({
        appointment_id: result.appointment.id,
        appointment: result.appointment,
        duplicate: true,
        code: 'booking_duplicate'
      });
    }

    const appointment = buildAppointment({
      service: result.service,
      start_time: result.start_time,
      customer: result.customer
    });

    // Atomic re-check + insert to prevent race double-book
    let conflict = null;
    mutateStore((s) => {
      const taken = (s.appointments || []).find((a) => {
        if (a.status !== 'confirmed' && a.status !== 'pending') return false;
        try {
          return new Date(a.start_time).toISOString() === result.start_time;
        } catch {
          return a.start_time === result.start_time;
        }
      });
      if (taken) {
        if (taken.customer?.email?.toLowerCase() === result.customer.email) {
          conflict = { type: 'duplicate', appointment: taken };
        } else {
          conflict = { type: 'taken' };
        }
        return s;
      }
      s.appointments = s.appointments || [];
      s.appointments.unshift(appointment);
      return s;
    });

    if (conflict?.type === 'taken') {
      return jsonError(
        { error: 'That time is no longer available', code: 'slot_taken' },
        409
      );
    }
    if (conflict?.type === 'duplicate') {
      return NextResponse.json({
        appointment_id: conflict.appointment.id,
        appointment: conflict.appointment,
        duplicate: true,
        code: 'booking_duplicate'
      });
    }

    logInfo('book.created', {
      appointment_id: appointment.id,
      service_id: appointment.service_id,
      email: appointment.customer?.email
    });

    trackEvent('booking_confirmed', {
      appointment_id: appointment.id,
      service_id: appointment.service_id
    });

    return NextResponse.json({
      appointment_id: appointment.id,
      appointment,
      code: 'booking_confirmed'
    });
  } catch (err) {
    return jsonError(
      { error: err.message || 'Booking failed', code: 'booking_internal' },
      500
    );
  }
}
