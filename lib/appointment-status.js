/**
 * Appointment status machine (F3).
 *
 * New bookings land as `confirmed`. From confirmed only:
 *   confirmed → completed | cancelled | no_show
 * Terminal states have no further transitions.
 */

export const APPOINTMENT_STATUSES = [
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
];

/** Statuses that still occupy a calendar slot */
export const ACTIVE_APPOINTMENT_STATUSES = ['confirmed', 'pending'];

/**
 * Allowed next statuses for each current status.
 * Terminal outcomes cannot change (admin must not flip completed → cancelled without a separate process).
 */
export const APPOINTMENT_TRANSITIONS = {
  confirmed: ['completed', 'cancelled', 'no_show'],
  pending: ['confirmed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: []
};

/**
 * @param {string} from
 * @param {string} to
 * @returns {{ ok: true, from: string, to: string } | { ok: false, status: number, error: string, code: string }}
 */
export function validateAppointmentStatusTransition(from, to) {
  const current = String(from || '').trim();
  const next = String(to || '').trim();

  if (!next) {
    return {
      ok: false,
      status: 400,
      error: 'Status is required',
      code: 'status_required'
    };
  }

  if (!APPOINTMENT_STATUSES.includes(next) && next !== 'pending') {
    return {
      ok: false,
      status: 400,
      error: `Unknown status "${next}"`,
      code: 'status_unknown'
    };
  }

  if (current === next) {
    return { ok: true, from: current, to: next, noop: true };
  }

  const allowed = APPOINTMENT_TRANSITIONS[current];
  if (!allowed) {
    return {
      ok: false,
      status: 400,
      error: `Unknown current status "${current}"`,
      code: 'status_unknown_current'
    };
  }

  if (!allowed.includes(next)) {
    return {
      ok: false,
      status: 409,
      error: `Cannot transition from "${current}" to "${next}"`,
      code: 'status_transition_invalid',
      allowed
    };
  }

  return { ok: true, from: current, to: next };
}

/** Next statuses the admin UI may offer for a given current status. */
export function allowedNextStatuses(from) {
  const current = String(from || '').trim();
  const next = APPOINTMENT_TRANSITIONS[current] || [];
  // Always include current so the select can display it
  return [current, ...next.filter((s) => s !== current)];
}

export function isTerminalAppointmentStatus(status) {
  const s = String(status || '');
  return s === 'completed' || s === 'cancelled' || s === 'no_show';
}
