/**
 * G6 / I3 helpers
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDateRange, filterByCreatedAt, inRange } from '../lib/analytics.js';
import { log } from '../lib/log.js';

describe('parseDateRange / filterByCreatedAt', () => {
  it('parses ymd bounds', () => {
    const { from, to } = parseDateRange('2026-01-01', '2026-01-31');
    assert.ok(from);
    assert.ok(to);
    assert.equal(inRange('2026-01-15T12:00:00.000Z', from, to), true);
    assert.equal(inRange('2025-12-31T12:00:00.000Z', from, to), false);
  });

  it('filters items by created_at', () => {
    const { from, to } = parseDateRange('2026-06-01', '2026-06-30');
    const items = [
      { id: 'a', created_at: '2026-06-10T00:00:00.000Z' },
      { id: 'b', created_at: '2026-07-01T00:00:00.000Z' }
    ];
    assert.deepEqual(
      filterByCreatedAt(items, from, to).map((i) => i.id),
      ['a']
    );
  });
});

describe('log redact', () => {
  it('does not throw on nested objects with email', () => {
    // Capture console
    const orig = console.log;
    let out = '';
    console.log = (s) => {
      out = s;
    };
    try {
      log('info', 'test', { email: 'person@example.com', password: 'secret' });
      assert.ok(out.includes('person@example.com') === false || out.includes('…@'));
      assert.ok(out.includes('[redacted]'));
      assert.ok(!out.includes('secret'));
    } finally {
      console.log = orig;
    }
  });
});
