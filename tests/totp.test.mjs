import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateTotp, verifyTotp, base32Decode } from '../lib/totp.js';

// Well-known test secret "JBSWY3DPEHPK3PXP" is used in many TOTP docs
const SECRET = 'JBSWY3DPEHPK3PXP';

describe('totp', () => {
  it('decodes base32', () => {
    const buf = base32Decode(SECRET);
    assert.ok(buf.length > 0);
  });

  it('generates 6-digit codes', () => {
    const code = generateTotp(SECRET, Date.UTC(2020, 0, 1, 0, 0, 0));
    assert.match(code, /^\d{6}$/);
  });

  it('verifies current window', () => {
    const now = Date.now();
    const code = generateTotp(SECRET, now);
    assert.equal(verifyTotp(SECRET, code, { now }), true);
    assert.equal(verifyTotp(SECRET, '000000', { now }), false);
  });

  it('rejects empty secret', () => {
    assert.equal(verifyTotp('', '123456'), false);
  });
});
