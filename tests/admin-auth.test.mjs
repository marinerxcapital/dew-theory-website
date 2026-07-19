/**
 * G1 — Admin auth policy
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  productionAuthConfigured,
  resolveExpectedCredentials,
  safeAdminNextPath,
  DEV_PASSWORD,
  DEV_EMAIL,
  DEV_SESSION_SECRET
} from '../lib/admin-auth-policy.js';

describe('productionAuthConfigured', () => {
  it('is true outside production', () => {
    assert.equal(
      productionAuthConfigured({
        nodeEnv: 'development',
        email: null,
        password: null,
        sessionSecret: null
      }),
      true
    );
  });

  it('rejects production without credentials', () => {
    assert.equal(
      productionAuthConfigured({
        nodeEnv: 'production',
        email: null,
        password: null,
        sessionSecret: 'strong-secret'
      }),
      false
    );
  });

  it('rejects production default password', () => {
    assert.equal(
      productionAuthConfigured({
        nodeEnv: 'production',
        email: 'owner@example.com',
        password: DEV_PASSWORD,
        sessionSecret: 'strong-secret-at-least-long'
      }),
      false
    );
  });

  it('rejects production default session secret', () => {
    assert.equal(
      productionAuthConfigured({
        nodeEnv: 'production',
        email: 'owner@example.com',
        password: 'a-real-password',
        sessionSecret: DEV_SESSION_SECRET
      }),
      false
    );
  });

  it('accepts production with non-default env', () => {
    assert.equal(
      productionAuthConfigured({
        nodeEnv: 'production',
        email: 'owner@example.com',
        password: 'a-real-password',
        sessionSecret: 'strong-secret-at-least-long'
      }),
      true
    );
  });
});

describe('resolveExpectedCredentials', () => {
  it('falls back to dev defaults outside production', () => {
    const r = resolveExpectedCredentials({
      nodeEnv: 'development',
      email: undefined,
      password: undefined
    });
    assert.equal(r.email, DEV_EMAIL);
    assert.equal(r.password, DEV_PASSWORD);
  });

  it('returns null in production with default password', () => {
    const r = resolveExpectedCredentials({
      nodeEnv: 'production',
      email: 'x@y.com',
      password: DEV_PASSWORD,
      sessionSecret: 'ok-secret'
    });
    assert.equal(r, null);
  });

  it('returns env pair when production is configured', () => {
    const r = resolveExpectedCredentials({
      nodeEnv: 'production',
      email: 'Owner@Example.com',
      password: 'secret-pass',
      sessionSecret: 'ok-secret'
    });
    assert.equal(r.email, 'owner@example.com');
    assert.equal(r.password, 'secret-pass');
  });
});

describe('safeAdminNextPath', () => {
  it('defaults to /admin', () => {
    assert.equal(safeAdminNextPath(null), '/admin');
    assert.equal(safeAdminNextPath(''), '/admin');
  });

  it('allows relative admin paths', () => {
    assert.equal(safeAdminNextPath('/admin/orders'), '/admin/orders');
  });

  it('blocks open redirects', () => {
    assert.equal(safeAdminNextPath('https://evil.test'), '/admin');
    assert.equal(safeAdminNextPath('//evil.test'), '/admin');
    assert.equal(safeAdminNextPath('/shop'), '/admin');
    assert.equal(safeAdminNextPath('/admin/login'), '/admin');
  });
});
