import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Cryptographically random tokens for intake / plan access.
 * Store only the hash; client receives the raw token once.
 */

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

export function tokensMatch(rawToken, storedHash) {
  if (!rawToken || !storedHash) return false;
  try {
    const a = Buffer.from(hashToken(rawToken), 'hex');
    const b = Buffer.from(String(storedHash), 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createTokenPair() {
  const token = generateToken(32);
  return { token, hash: hashToken(token) };
}

/** Short reference ID for client emails (not a secret). */
export function createPublicRef() {
  const part = randomBytes(4).toString('hex').toUpperCase();
  return `DT-VC-${part}`;
}
