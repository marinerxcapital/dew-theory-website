/**
 * RFC 6238 TOTP (SHA-1, 30s step, 6 digits) — no external dependency.
 * Used for optional admin 2FA when ADMIN_TOTP_SECRET is set (base32).
 */

import crypto from 'crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(input) {
  const str = String(input || '')
    .toUpperCase()
    .replace(/=+$/g, '')
    .replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const c of str) {
    const val = BASE32.indexOf(c);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotp(secretBase32, timeMs = Date.now(), stepSec = 30, digits = 6) {
  const key = base32Decode(secretBase32);
  if (!key.length) return null;
  const counter = Math.floor(timeMs / 1000 / stepSec);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const mod = 10 ** digits;
  return String(code % mod).padStart(digits, '0');
}

/**
 * Accept current step ±1 window.
 * @param {string} secretBase32
 * @param {string} token
 */
export function verifyTotp(secretBase32, token, opts = {}) {
  const stepSec = opts.stepSec ?? 30;
  const window = opts.window ?? 1;
  const now = opts.now ?? Date.now();
  const expected = String(token || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(expected)) return false;
  if (!secretBase32) return false;

  for (let w = -window; w <= window; w++) {
    const t = now + w * stepSec * 1000;
    const code = generateTotp(secretBase32, t, stepSec);
    if (code && timingSafeEqual(code, expected)) return true;
  }
  return false;
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) {
    crypto.timingSafeEqual(ba, ba);
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

export function isAdminTotpRequired() {
  return Boolean(process.env.ADMIN_TOTP_SECRET && String(process.env.ADMIN_TOTP_SECRET).trim());
}

export function getAdminTotpSecret() {
  return String(process.env.ADMIN_TOTP_SECRET || '').trim();
}
