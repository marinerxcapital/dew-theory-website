/**
 * F1 — Book API validation tests
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateBookingRequest, buildAppointment } from '../lib/booking.js';
import { SERVICES } from '../lib/services.js';

const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
future.setMinutes(0, 0, 0);
const futureIso = future.toISOString();

const pastIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();

const baseCustomer = {
  name: 'Ada Guest',
  email: 'ada@example.com',
  phone: '555-0100',
  notes: 'Sensitive'
};

function body(over = {}) {
  return {
    service_id: 'signature-dew-facial',
    start_time: futureIso,
    customer: { ...baseCustomer },
    ...over
  };
}

describe('validateBookingRequest — service', () => {
  it('requires service_id', () => {
    const r = validateBookingRequest(body({ service_id: '' }), SERVICES, []);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'service_required');
  });

  it('rejects unknown service', () => {
    const r = validateBookingRequest(body({ service_id: 'nope' }), SERVICES, []);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'service_unknown');
  });

  it('accepts known service', () => {
    const r = validateBookingRequest(body(), SERVICES, []);
    assert.equal(r.ok, true);
    assert.equal(r.service.id, 'signature-dew-facial');
  });
});

describe('validateBookingRequest — slots', () => {
  it('requires start_time', () => {
    const r = validateBookingRequest(body({ start_time: null }), SERVICES, []);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'slot_required');
  });

  it('rejects invalid date', () => {
    const r = validateBookingRequest(body({ start_time: 'not-a-date' }), SERVICES, []);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'slot_invalid');
  });

  it('rejects past slots', () => {
    const r = validateBookingRequest(body({ start_time: pastIso }), SERVICES, []);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'slot_in_past');
  });

  it('rejects slot taken by another guest', () => {
    const appointments = [
      {
        id: 'apt_1',
        start_time: futureIso,
        status: 'confirmed',
        customer: { email: 'other@example.com' }
      }
    ];
    const r = validateBookingRequest(body(), SERVICES, appointments);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'slot_taken');
    assert.equal(r.status, 409);
  });

  it('returns duplicate for same email + same slot', () => {
    const appointments = [
      {
        id: 'apt_dup',
        start_time: futureIso,
        status: 'confirmed',
        customer: { email: 'ada@example.com' }
      }
    ];
    const r = validateBookingRequest(body(), SERVICES, appointments);
    assert.equal(r.ok, true);
    assert.equal(r.duplicate, true);
    assert.equal(r.appointment.id, 'apt_dup');
  });

  it('ignores cancelled appointments for slot conflict', () => {
    const appointments = [
      {
        id: 'apt_x',
        start_time: futureIso,
        status: 'cancelled',
        customer: { email: 'other@example.com' }
      }
    ];
    const r = validateBookingRequest(body(), SERVICES, appointments);
    assert.equal(r.ok, true);
    assert.equal(r.duplicate, false);
  });
});

describe('validateBookingRequest — customer sanitization', () => {
  it('requires name', () => {
    const r = validateBookingRequest(
      body({ customer: { ...baseCustomer, name: '  ' } }),
      SERVICES,
      []
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, 'customer_name_required');
  });

  it('requires valid email', () => {
    const r = validateBookingRequest(
      body({ customer: { ...baseCustomer, email: 'nope' } }),
      SERVICES,
      []
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, 'customer_email_invalid');
  });

  it('normalizes email to lowercase and trims', () => {
    const r = validateBookingRequest(
      body({ customer: { ...baseCustomer, email: '  Ada@Example.COM ' } }),
      SERVICES,
      []
    );
    assert.equal(r.ok, true);
    assert.equal(r.customer.email, 'ada@example.com');
  });

  it('truncates long notes', () => {
    const r = validateBookingRequest(
      body({ customer: { ...baseCustomer, notes: 'x'.repeat(5000) } }),
      SERVICES,
      []
    );
    assert.equal(r.ok, true);
    assert.equal(r.customer.notes.length, 2000);
  });
});

describe('buildAppointment', () => {
  it('builds confirmed appointment from validated parts', () => {
    const service = SERVICES[0];
    const a = buildAppointment({
      service,
      start_time: futureIso,
      customer: baseCustomer,
      id: 'apt_test'
    });
    assert.equal(a.id, 'apt_test');
    assert.equal(a.status, 'confirmed');
    assert.equal(a.service_id, service.id);
    assert.equal(a.price, service.price);
    assert.equal(a.calendar_event_id, null);
  });
});
