import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GoogleCalendarAdapter,
  getAvailabilityAdapter,
  listBookableSlots
} from '../lib/availability.js';

describe('GoogleCalendarAdapter configuration', () => {
  it('is not configured without env', () => {
    const g = new GoogleCalendarAdapter({
      calendarId: '',
      clientId: '',
      clientSecret: '',
      refreshToken: ''
    });
    assert.equal(g.isConfigured(), false);
  });

  it('is configured when all fields set', () => {
    const g = new GoogleCalendarAdapter({
      calendarId: 'cal',
      clientId: 'id',
      clientSecret: 'secret',
      refreshToken: 'refresh'
    });
    assert.equal(g.isConfigured(), true);
    assert.equal(g.getSource(), 'google_calendar');
  });

  it('factory returns mock without credentials', () => {
    const a = getAvailabilityAdapter();
    assert.equal(a.getSource(), 'mock');
  });

  it('listBookableSlots still works', async () => {
    const { source, slots } = await listBookableSlots({
      now: new Date('2026-07-20T12:00:00'),
      appointments: []
    });
    assert.equal(source, 'mock');
    assert.ok(Array.isArray(slots));
  });
});
