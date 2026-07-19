/**
 * F3 — Appointment status transitions
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateAppointmentStatusTransition,
  allowedNextStatuses,
  isTerminalAppointmentStatus,
  APPOINTMENT_TRANSITIONS
} from '../lib/appointment-status.js';

describe('validateAppointmentStatusTransition', () => {
  it('allows confirmed → completed', () => {
    const r = validateAppointmentStatusTransition('confirmed', 'completed');
    assert.equal(r.ok, true);
    assert.equal(r.to, 'completed');
  });

  it('allows confirmed → cancelled', () => {
    assert.equal(validateAppointmentStatusTransition('confirmed', 'cancelled').ok, true);
  });

  it('allows confirmed → no_show', () => {
    assert.equal(validateAppointmentStatusTransition('confirmed', 'no_show').ok, true);
  });

  it('allows no-op same status', () => {
    const r = validateAppointmentStatusTransition('confirmed', 'confirmed');
    assert.equal(r.ok, true);
    assert.equal(r.noop, true);
  });

  it('rejects completed → cancelled (terminal)', () => {
    const r = validateAppointmentStatusTransition('completed', 'cancelled');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_transition_invalid');
    assert.equal(r.status, 409);
  });

  it('rejects cancelled → confirmed', () => {
    const r = validateAppointmentStatusTransition('cancelled', 'confirmed');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_transition_invalid');
  });

  it('rejects no_show → completed', () => {
    const r = validateAppointmentStatusTransition('no_show', 'completed');
    assert.equal(r.ok, false);
  });

  it('rejects confirmed → pending (not in forward set)', () => {
    const r = validateAppointmentStatusTransition('confirmed', 'pending');
    assert.equal(r.ok, false);
  });

  it('rejects unknown target status', () => {
    const r = validateAppointmentStatusTransition('confirmed', 'rescheduled');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_unknown');
  });

  it('rejects empty status', () => {
    const r = validateAppointmentStatusTransition('confirmed', '');
    assert.equal(r.ok, false);
    assert.equal(r.code, 'status_required');
  });

  it('allows pending → confirmed and cancelled', () => {
    assert.equal(validateAppointmentStatusTransition('pending', 'confirmed').ok, true);
    assert.equal(validateAppointmentStatusTransition('pending', 'cancelled').ok, true);
  });
});

describe('allowedNextStatuses / terminal', () => {
  it('confirmed offers outcomes plus current', () => {
    const opts = allowedNextStatuses('confirmed');
    assert.deepEqual(opts, ['confirmed', 'completed', 'cancelled', 'no_show']);
  });

  it('completed is terminal in UI', () => {
    assert.deepEqual(allowedNextStatuses('completed'), ['completed']);
    assert.equal(isTerminalAppointmentStatus('completed'), true);
    assert.equal(APPOINTMENT_TRANSITIONS.completed.length, 0);
  });
});
