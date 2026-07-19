/**
 * Pure booking validation (server-safe, unit-testable).
 * F1: service exists, future slot, slot uniqueness, input sanitization.
 */

/**
 * @param {unknown} body
 * @param {Array} services - SERVICES catalog
 * @param {Array} appointments - existing appointments from store
 * @param {Date} [now]
 */
export function validateBookingRequest(body, services, appointments = [], now = new Date()) {
  const b = body && typeof body === 'object' ? body : {};
  const serviceId = String(b.service_id || '').trim();
  if (!serviceId) {
    return {
      ok: false,
      status: 400,
      error: 'Select a service',
      code: 'service_required'
    };
  }

  const service = (services || []).find((s) => s.id === serviceId);
  if (!service) {
    return {
      ok: false,
      status: 400,
      error: 'Unknown service',
      code: 'service_unknown'
    };
  }

  if (!b.start_time) {
    return {
      ok: false,
      status: 400,
      error: 'Select a time',
      code: 'slot_required'
    };
  }

  const startIso = String(b.start_time);
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid time',
      code: 'slot_invalid'
    };
  }
  if (start.getTime() <= now.getTime()) {
    return {
      ok: false,
      status: 400,
      error: 'Choose a future time',
      code: 'slot_in_past'
    };
  }

  // Normalize to ISO for stable comparison
  const start_time = start.toISOString();

  const customerIn = b.customer || {};
  const name = String(customerIn.name || '')
    .trim()
    .slice(0, 200);
  const email = String(customerIn.email || '')
    .trim()
    .toLowerCase()
    .slice(0, 320);
  const phone = String(customerIn.phone || '')
    .trim()
    .slice(0, 40);
  const notes = String(customerIn.notes || '')
    .trim()
    .slice(0, 2000);

  if (!name) {
    return {
      ok: false,
      status: 400,
      error: 'Name is required',
      code: 'customer_name_required',
      field: 'customer.name'
    };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      status: 400,
      error: 'Valid email is required',
      code: 'customer_email_invalid',
      field: 'customer.email'
    };
  }

  const open = (appointments || []).filter(
    (a) => a && (a.status === 'confirmed' || a.status === 'pending')
  );

  // Store-level slot uniqueness: one confirmed booking per start_time
  const slotTaken = open.find((a) => {
    try {
      return new Date(a.start_time).toISOString() === start_time;
    } catch {
      return a.start_time === start_time || a.start_time === b.start_time;
    }
  });
  if (slotTaken) {
    // Same guest re-submitting → return existing (idempotent)
    if (slotTaken.customer?.email?.toLowerCase() === email) {
      return {
        ok: true,
        duplicate: true,
        appointment: slotTaken,
        service
      };
    }
    return {
      ok: false,
      status: 409,
      error: 'That time is no longer available',
      code: 'slot_taken'
    };
  }

  return {
    ok: true,
    duplicate: false,
    service,
    start_time,
    customer: { name, email, phone, notes }
  };
}

export function buildAppointment({ service, start_time, customer, id }) {
  return {
    id: id || `apt_${Date.now()}`,
    service_id: service.id,
    service_name: service.name,
    start_time,
    duration_minutes: service.duration_minutes,
    price: service.price,
    status: 'confirmed',
    customer,
    calendar_event_id: null,
    created_at: new Date().toISOString()
  };
}
