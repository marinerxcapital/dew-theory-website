/**
 * F2 — Availability adapter tests
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MockAvailabilityAdapter,
  GoogleCalendarAdapter,
  getAvailabilityAdapter,
  excludeBookedSlots,
  groupSlotsByDay,
  listBookableSlots,
  MOCK_HOURS
} from '../lib/availability.js';

describe('MockAvailabilityAdapter', () => {
  it('returns only future slots within window', async () => {
    const now = new Date('2026-07-20T12:00:00.000Z'); // Monday noon UTC-ish
    const adapter = new MockAvailabilityAdapter({ daysAhead: 7 });
    const slots = await adapter.listOpenSlots({ now });
    assert.ok(slots.length > 0);
    for (const iso of slots) {
      assert.ok(new Date(iso).getTime() > now.getTime());
    }
    assert.equal(adapter.getSource(), 'mock');
  });

  it('skips closed days (Sunday by default)', async () => {
    // Pick a known Sunday
    const sunday = new Date('2026-07-19T08:00:00.000Z');
    const adapter = new MockAvailabilityAdapter({ daysAhead: 1, hours: [10] });
    // from Sunday 00:00 local — adapter uses local day; check no slot is on a Sunday
    const slots = await adapter.listOpenSlots({
      now: new Date('2026-07-18T12:00:00'),
      from: new Date('2026-07-18T00:00:00'),
      to: new Date('2026-07-20T23:59:59')
    });
    for (const iso of slots) {
      assert.notEqual(new Date(iso).getDay(), 0, `Sunday slot leaked: ${iso}`);
    }
    void sunday;
  });

  it('uses configured hours', async () => {
    const adapter = new MockAvailabilityAdapter({
      hours: [9],
      daysAhead: 3,
      closedDays: [0, 6]
    });
    const now = new Date('2026-07-20T08:00:00');
    const slots = await adapter.listOpenSlots({ now });
    assert.ok(slots.every((iso) => new Date(iso).getHours() === 9));
    assert.deepEqual(MOCK_HOURS, [10, 11, 13, 14, 15, 16]);
  });
});

describe('excludeBookedSlots / groupSlotsByDay', () => {
  it('removes confirmed appointments', () => {
    const open = [
      '2026-08-01T15:00:00.000Z',
      '2026-08-01T16:00:00.000Z',
      '2026-08-01T17:00:00.000Z'
    ];
    const appointments = [
      { start_time: '2026-08-01T16:00:00.000Z', status: 'confirmed' },
      { start_time: '2026-08-01T17:00:00.000Z', status: 'cancelled' }
    ];
    const free = excludeBookedSlots(open, appointments);
    assert.deepEqual(free, [
      '2026-08-01T15:00:00.000Z',
      '2026-08-01T17:00:00.000Z'
    ]);
  });

  it('groups by day label', () => {
    const map = groupSlotsByDay([
      '2026-08-03T15:00:00.000Z',
      '2026-08-03T16:00:00.000Z',
      '2026-08-04T15:00:00.000Z'
    ]);
    assert.ok(map.size >= 1);
    let total = 0;
    for (const times of map.values()) total += times.length;
    assert.equal(total, 3);
  });
});

describe('getAvailabilityAdapter / Google adapter', () => {
  it('defaults to mock without Google env', () => {
    const a = getAvailabilityAdapter();
    assert.equal(a.getSource(), 'mock');
  });

  it('Google adapter reports not configured without env', () => {
    const g = new GoogleCalendarAdapter({
      calendarId: '',
      clientId: '',
      clientSecret: '',
      refreshToken: ''
    });
    assert.equal(g.isConfigured(), false);
    assert.equal(g.getSource(), 'google_calendar');
  });

  it('listBookableSlots returns source + slots', async () => {
    const { source, slots } = await listBookableSlots({
      now: new Date('2026-07-20T12:00:00'),
      appointments: []
    });
    assert.equal(source, 'mock');
    assert.ok(Array.isArray(slots));
  });
});
