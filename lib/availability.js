/**
 * Availability adapters for booking slots.
 *
 * MockAvailabilityAdapter — fixed Mon–Sat hours, 14-day window.
 * GoogleCalendarAdapter — freebusy when GOOGLE_CALENDAR_* env is complete.
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

function parseHoursEnv(raw, fallback) {
  if (!raw || !String(raw).trim()) return fallback;
  const hours = String(raw)
    .split(',')
    .map((h) => Number(h.trim()))
    .filter((h) => Number.isFinite(h) && h >= 0 && h <= 23);
  return hours.length ? hours : fallback;
}

function parseClosedDaysEnv(raw, fallback) {
  if (!raw || !String(raw).trim()) return fallback;
  const days = String(raw)
    .split(',')
    .map((d) => Number(d.trim()))
    .filter((d) => Number.isFinite(d) && d >= 0 && d <= 6);
  return days.length ? days : fallback;
}

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
 * Google Calendar freebusy → bookable slots on configured hours.
 * @implements {AvailabilityAdapter}
 */
export class GoogleCalendarAdapter {
  constructor(config = {}) {
    this.calendarId = config.calendarId || process.env.GOOGLE_CALENDAR_ID;
    this.clientId = config.clientId || process.env.GOOGLE_CALENDAR_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    this.refreshToken = config.refreshToken || process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
    this.hours = parseHoursEnv(process.env.GOOGLE_CALENDAR_HOURS, MOCK_HOURS);
    this.closedDays = parseClosedDaysEnv(process.env.GOOGLE_CALENDAR_CLOSED_DAYS, MOCK_CLOSED_DAYS);
    this.daysAhead = Number(process.env.GOOGLE_CALENDAR_DAYS_AHEAD || MOCK_DAYS_AHEAD) || MOCK_DAYS_AHEAD;
    this.slotMinutes = Number(process.env.GOOGLE_CALENDAR_SLOT_MINUTES || 60) || 60;
    this._accessToken = null;
    this._tokenExp = 0;
  }

  getSource() {
    return 'google_calendar';
  }

  isConfigured() {
    return Boolean(
      this.calendarId && this.clientId && this.clientSecret && this.refreshToken
    );
  }

  async getAccessToken() {
    if (this._accessToken && Date.now() < this._tokenExp - 30_000) {
      return this._accessToken;
    }
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new Error(
        data?.error_description || data?.error || 'Google OAuth token refresh failed'
      );
    }
    this._accessToken = data.access_token;
    this._tokenExp = Date.now() + Number(data.expires_in || 3600) * 1000;
    return this._accessToken;
  }

  /**
   * @param {ListSlotsOptions} [opts]
   * @returns {Promise<string[]>}
   */
  async listOpenSlots(opts = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Google Calendar adapter not configured — set GOOGLE_CALENDAR_* env vars'
      );
    }

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

    const durationMinutes = opts.durationMinutes || this.slotMinutes;
    const token = await this.getAccessToken();

    const freebusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: this.calendarId }]
      })
    });
    const freebusy = await freebusyRes.json().catch(() => ({}));
    if (!freebusyRes.ok) {
      throw new Error(
        freebusy?.error?.message || `Google freeBusy HTTP ${freebusyRes.status}`
      );
    }

    const busy = freebusy?.calendars?.[this.calendarId]?.busy || [];
    const busyRanges = busy.map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime()
    }));

    // Candidate slots on working hours, then subtract busy
    const candidates = await new MockAvailabilityAdapter({
      hours: this.hours,
      daysAhead: this.daysAhead,
      closedDays: this.closedDays
    }).listOpenSlots({ now, from, to });

    const durationMs = durationMinutes * 60 * 1000;
    return candidates.filter((iso) => {
      const start = new Date(iso).getTime();
      const end = start + durationMs;
      return !busyRanges.some((b) => start < b.end && end > b.start);
    });
  }

  /**
   * Create a calendar event for a confirmed booking (best-effort).
   * @param {{ summary: string, description?: string, startIso: string, durationMinutes?: number, attendeeEmail?: string }} event
   */
  async createEvent(event) {
    if (!this.isConfigured()) {
      throw new Error('Google Calendar not configured');
    }
    const token = await this.getAccessToken();
    const start = new Date(event.startIso);
    const mins = event.durationMinutes || this.slotMinutes;
    const end = new Date(start.getTime() + mins * 60 * 1000);

    const body = {
      summary: event.summary || 'Dew Theory appointment',
      description: event.description || '',
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() }
    };
    if (event.attendeeEmail) {
      body.attendees = [{ email: event.attendeeEmail }];
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `Google events HTTP ${res.status}`);
    }
    return data;
  }
}

/**
 * Factory: Google freebusy when fully configured, otherwise mock.
 * On Google runtime failure, callers should fall back — see listBookableSlots.
 * @returns {AvailabilityAdapter}
 */
export function getAvailabilityAdapter() {
  const google = new GoogleCalendarAdapter();
  if (google.isConfigured()) {
    return google;
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
 * Falls back to mock if Google is configured but freebusy fails.
 * @param {{ appointments?: Array, serviceId?: string, now?: Date, durationMinutes?: number }} [opts]
 */
export async function listBookableSlots(opts = {}) {
  let adapter = getAvailabilityAdapter();
  let open;
  try {
    open = await adapter.listOpenSlots({
      serviceId: opts.serviceId,
      now: opts.now,
      durationMinutes: opts.durationMinutes
    });
  } catch (err) {
    if (adapter.getSource() === 'google_calendar') {
      console.warn('[availability] Google freebusy failed, using mock:', err?.message || err);
      adapter = new MockAvailabilityAdapter();
      open = await adapter.listOpenSlots({
        serviceId: opts.serviceId,
        now: opts.now
      });
    } else {
      throw err;
    }
  }
  return {
    source: adapter.getSource(),
    slots: excludeBookedSlots(open, opts.appointments || [])
  };
}
