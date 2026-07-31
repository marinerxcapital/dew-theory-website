import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatPackagePrice,
  getMembershipPackages,
  membershipCheckoutEnabled
} from '../lib/membership.js';

describe('membership packages', () => {
  it('returns default packages without prices', () => {
    const pkgs = getMembershipPackages();
    assert.ok(pkgs.length >= 1);
    assert.ok(pkgs.every((p) => p.price_cents == null));
    assert.equal(membershipCheckoutEnabled(), false);
  });

  it('formats missing price honestly', () => {
    assert.equal(formatPackagePrice({ price_cents: null }), 'Price set by Emily');
    assert.match(formatPackagePrice({ price_cents: 9900, interval: 'month' }), /\$99/);
  });
});
