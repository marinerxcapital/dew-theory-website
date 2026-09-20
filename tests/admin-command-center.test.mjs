/**
 * Admin command center — metrics, status, owner policy
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { worstStatus, STATUS } from '../lib/admin/status.js';
import { parseAdminRange, inRange } from '../lib/admin/date-range.js';
import { isOwnerAdmin, resolveOwnerEmail } from '../lib/admin-auth-policy.js';
import { getAutomationMode, getCustomerFulfillmentCopy } from '../lib/admin/dashboard.js';

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

describe('automation honesty labels', () => {
  const prodHonest = {
    SKIN_SCRIPT_MODE: 'mock',
    AUTO_FULFILL: 'false',
    SKIN_SCRIPT_RPA_ENABLED: 'false'
  };

  it('labels production mock + AUTO_FULFILL=false as owner queue, not live RPA', () => {
    const mode = getAutomationMode(prodHonest);
    assert.equal(mode.automationLive, false);
    assert.equal(mode.autoFulfill, false);
    assert.equal(mode.purchasingAllowed, false);
    assert.equal(mode.killSwitch, false);
    assert.match(mode.modeLabel, /mock \/ manual owner queue/i);
    assert.match(mode.operatorHonesty, /no live Skin Script automation/i);
  });

  it('does not call mock mode a kill switch', () => {
    const mode = getAutomationMode(prodHonest);
    assert.equal(mode.killSwitch, false);
  });

  it('only reports Production RPA when mode=rpa, enabled, and not dry-run', () => {
    const live = getAutomationMode({
      SKIN_SCRIPT_MODE: 'rpa',
      SKIN_SCRIPT_RPA_ENABLED: 'true',
      SKIN_SCRIPT_DRY_RUN: 'false',
      AUTO_FULFILL: 'true'
    });
    assert.equal(live.automationLive, true);
    assert.equal(live.modeLabel, 'Production RPA');
    assert.match(live.operatorHonesty, /purchasing is enabled/i);

    const gated = getAutomationMode({
      SKIN_SCRIPT_MODE: 'rpa',
      SKIN_SCRIPT_RPA_ENABLED: 'false'
    });
    assert.equal(gated.automationLive, false);
    assert.equal(gated.killSwitch, true);
    assert.match(gated.modeLabel, /kill switch/i);
  });

  it('customer copy never mentions auto-fulfill when RPA is not live', () => {
    const copy = getCustomerFulfillmentCopy(prodHonest);
    assert.match(copy.confirmationLead, /manually/i);
    assert.match(copy.nextStep, /manually/i);
    assert.match(copy.shippingBlurb, /not live/i);
    assert.equal(/auto-fulfill/i.test(JSON.stringify(copy)), false);
    assert.equal(/automation is on/i.test(JSON.stringify(copy)), false);
  });
});
