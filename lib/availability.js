/**
 * Availability adapters for booking slots.
 *
 * Current: MockAvailabilityAdapter (fixed Mon–Sat hours, 14-day window).
 * Future: GoogleCalendarAdapter when OAuth env is present — same interface.
 *
 * Interface (JSDoc):
 *   listOpenSlots({ serviceId?, from?, to?, now? }) → Promise<string[]>  // ISO start times
 *   getSource() → 'mock' | 'google_calendar'
 */

/** Working assumption — OPEN_ITEMS studio hours until Emily confirms */
export const MOCK_HOURS = [10, 11, 13, 14, 15, 16];
export const MOCK_DAYS_AHEAD = 14;
/** 0 = Sunday closed in mock policy */
export const MOCK_CLOSED_DAYS = [0];

/**
 * @typedef {object} ListSlotsOptions
 * @property {string} [serviceId]
 * @property {Date} [from]
 * @property {Date} [to]
 * @property {Date} [now]
 * @property {number} [durationMinutes]
 */

/**
 * @typedef {object} AvailabilityAdapter
 * @property {(opts?: ListSlotsOptions) => Promise<string[]>} listOpenSlots
 * @property {() => string} getSource
 */

/** @implements {AvailabilityAdapter} */
export class MockAvailabilityAdapter {
  constructor(options = {}) {
    this.hours = options.hours || MOCK_HOURS;
    this.daysAhead = options.daysAhead ?? MOCK_DAYS_AHEAD;
    this.closedDays = options.closedDays || MOCK_CLOSED_DAYS;
  }

  getSource() {
    return 'mock';
  }

  /**
   * @param {ListSlotsOptions} [opts]
   * @returns {Promise<string[]>}
   */
  async listOpenSlots(opts = {}) {
    const now = opts.now || new Date();
    const from = opts.from || now;
    const to =
      opts.to ||
      (() => {
        const d = new Date(from);
        d.setDate(d.getDate() + this.daysAhead);
        d.setHours(23, 59, 59, 999);
        return d;
      })();

    const slots = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);

    // Walk day by day inclusive of range
    const endDay = new Date(to);
    endDay.setHours(0, 0, 0, 0);

    for (
      let day = new Date(cursor);
      day.getTime() <= endDay.getTime();
      day.setDate(day.getDate() + 1)
    ) {
      if (this.closedDays.includes(day.getDay())) continue;
      for (const h of this.hours) {
        const t = new Date(day);
        t.setHours(h, 0, 0, 0);
        if (t.getTime() > now.getTime() && t.getTime() <= to.getTime()) {
          slots.push(t.toISOString());
        }
      }
    }
    return slots;
  }
}

/**
 * Placeholder for Google Calendar freebusy.
 * Throws if called without credentials — use getAvailabilityAdapter() to pick mock.
 * @implements {AvailabilityAdapter}
 */
export class GoogleCalendarAdapter {
  constructor(config = {}) {
    this.calendarId = config.calendarId || process.env.GOOGLE_CALENDAR_ID;
    this.clientId = config.clientId || process.env.GOOGLE_CALENDAR_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    this.refreshToken = config.refreshToken || process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
  }

  getSource() {
    return 'google_calendar';
  }

  isConfigured() {
    return Boolean(
      this.calendarId && this.clientId && this.clientSecret && this.refreshToken
    );
  }

  /**
   * Not implemented until OAuth credentials exist (OPEN_ITEMS).
   * @param {ListSlotsOptions} [opts]
   */
  async listOpenSlots(opts = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Google Calendar adapter not configured — set GOOGLE_CALENDAR_* env vars'
      );
    }
    // Future: OAuth refresh → freebusy.query → invert busy blocks into bookable slots
    // matching service durationMinutes. Until then, fall through is not automatic —
    // getAvailabilityAdapter() never selects this adapter without credentials.
    void opts;
    throw new Error('Google Calendar freebusy not implemented yet');
  }
}

/**
 * Factory: Google when fully configured, otherwise mock.
 * @returns {AvailabilityAdapter}
 */
export function getAvailabilityAdapter() {
  const google = new GoogleCalendarAdapter();
  if (google.isConfigured()) {
    // Credentials present but freebusy not built — still use mock so booking works.
    // Swap return to `google` when listOpenSlots is implemented.
    return new MockAvailabilityAdapter();
  }
  return new MockAvailabilityAdapter();
}

/** Filter ISO slots that are already booked (confirmed/pending). */
export function excludeBookedSlots(slots, appointments = []) {
  const taken = new Set();
  for (const a of appointments) {
    if (!a || (a.status !== 'confirmed' && a.status !== 'pending')) continue;
    try {
      taken.add(new Date(a.start_time).toISOString());
    } catch {
      if (a.start_time) taken.add(String(a.start_time));
    }
  }
  return (slots || []).filter((iso) => {
    try {
      return !taken.has(new Date(iso).toISOString());
    } catch {
      return !taken.has(iso);
    }
  });
}

/** Group ISO start times by locale day label for UI. */
export function groupSlotsByDay(isoSlots, locale = 'en-US') {
  const map = new Map();
  for (const iso of isoSlots || []) {
    const d = new Date(iso);
    const key = d.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(iso);
  }
  return map;
}

/**
 * Convenience: open slots from default adapter, minus booked appointments.
 * @param {{ appointments?: Array, serviceId?: string, now?: Date }} [opts]
 */
export async function listBookableSlots(opts = {}) {
  const adapter = getAvailabilityAdapter();
  const open = await adapter.listOpenSlots({
    serviceId: opts.serviceId,
    now: opts.now
  });
  return {
    source: adapter.getSource(),
    slots: excludeBookedSlots(open, opts.appointments || [])
  };
}
