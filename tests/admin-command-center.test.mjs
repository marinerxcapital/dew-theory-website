/**
 * Admin command center — metrics, status, owner policy
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { worstStatus, STATUS } from '../lib/admin/status.js';
import { parseAdminRange, inRange } from '../lib/admin/date-range.js';
import { isOwnerAdmin, resolveOwnerEmail } from '../lib/admin-auth-policy.js';

describe('admin status model', () => {
  it('worstStatus picks critical over healthy', () => {
    assert.equal(worstStatus(STATUS.HEALTHY, STATUS.CRITICAL), STATUS.CRITICAL);
    assert.equal(worstStatus(STATUS.ATTENTION, STATUS.DEGRADED), STATUS.DEGRADED);
  });
});

describe('admin date range', () => {
  it('parseAdminRange defaults to 30d', () => {
    const r = parseAdminRange({});
    assert.equal(r.range, '30d');
    assert.ok(r.from instanceof Date);
    assert.ok(r.to instanceof Date);
  });

  it('inRange respects bounds', () => {
    const from = new Date('2026-01-01');
    const to = new Date('2026-01-31');
    assert.equal(inRange('2026-01-15T12:00:00Z', from, to), true);
    assert.equal(inRange('2025-12-01T12:00:00Z', from, to), false);
  });
});

describe('owner-only admin policy', () => {
  it('requires owner email match and owner role', () => {
    const env = { ownerEmail: 'emily@example.com', nodeEnv: 'development' };
    assert.equal(
      isOwnerAdmin({ email: 'emily@example.com', role: 'owner' }, env),
      true
    );
    assert.equal(
      isOwnerAdmin({ email: 'other@example.com', role: 'owner' }, env),
      false
    );
    assert.equal(
      isOwnerAdmin({ email: 'emily@example.com', role: 'staff' }, env),
      false
    );
  });

  it('resolveOwnerEmail uses ADMIN_OWNER_EMAIL', () => {
    const email = resolveOwnerEmail({
      ownerEmail: 'Owner@Dew.com',
      nodeEnv: 'production',
      email: 'fallback@dew.com'
    });
    assert.equal(email, 'owner@dew.com');
  });
});
