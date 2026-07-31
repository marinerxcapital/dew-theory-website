import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getBookingPolicy, getEmailConfig } from '../lib/email.js';

describe('email + booking policy', () => {
  it('exposes email config without requiring Resend', () => {
    const cfg = getEmailConfig();
    assert.ok(cfg.from);
    assert.ok(cfg.siteUrl);
  });

  it('booking policy is honest without env', () => {
    const prevDep = process.env.BOOKING_DEPOSIT_PERCENT;
    const prevCan = process.env.BOOKING_CANCEL_HOURS;
    delete process.env.BOOKING_DEPOSIT_PERCENT;
    delete process.env.BOOKING_CANCEL_HOURS;
    const p = getBookingPolicy();
    assert.equal(p.depositPercent, null);
    assert.ok(p.publicNote.includes('Emily') || p.publicNote.includes('Deposit'));
    if (prevDep != null) process.env.BOOKING_DEPOSIT_PERCENT = prevDep;
    if (prevCan != null) process.env.BOOKING_CANCEL_HOURS = prevCan;
  });

  it('reads deposit env when set', () => {
    process.env.BOOKING_DEPOSIT_PERCENT = '25';
    process.env.BOOKING_CANCEL_HOURS = '24';
    const p = getBookingPolicy();
    assert.equal(p.depositPercent, 25);
    assert.equal(p.cancelHours, 24);
    assert.ok(p.depositSummary);
    delete process.env.BOOKING_DEPOSIT_PERCENT;
    delete process.env.BOOKING_CANCEL_HOURS;
  });
});
