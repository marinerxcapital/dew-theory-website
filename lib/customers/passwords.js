/**
 * Customer password hashing — WebCrypto PBKDF2-SHA256, no dependencies.
 *
 * Format: pbkdf2$sha256$<iterations>$<salt-b64url>$<hash-b64url>
 * A single stored string, so verification is self-describing and the iteration
 * count can be raised later without invalidating existing hashes.
 *
 * Node 18+ and Cloudflare Workers both expose `globalThis.crypto.subtle`, so the
 * same code runs in dev, in tests and in the Worker.
 */

const ALGORITHM = 'pbkdf2';
const DIGEST = 'sha256';
/**
 * Iteration count.
 *
 * Cloudflare Workers' WebCrypto rejects PBKDF2 above a hard cap:
 *   "Pbkdf2 failed: iteration counts above 100000 are not supported"
 * Verified in production — 210,000 threw NotSupportedError and surfaced as a 500
 * on registration. 100,000 is the highest value the Worker runtime accepts, and
 * it is the value the deployment actually uses, so dev, tests and production all
 * compute the same hash. The count is stored inside each hash string, so it can
 * be raised later without invalidating existing passwords — but not above the
 * platform cap while this runs on Workers.
 */
export const PBKDF2_ITERATIONS = 100_000;
const ITERATIONS = PBKDF2_ITERATIONS;
const KEY_BITS = 256;
const SALT_BYTES = 16;

/** Minimum accepted password length. Enforced server-side, not just in the form. */
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value) {
  return new Uint8Array(Buffer.from(String(value), 'base64url'));
}

function subtle() {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error('WebCrypto unavailable in this runtime');
  return c.subtle;
}

async function derive(password, salt, iterations) {
  const key = await subtle().importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await subtle().deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS
  );
  return new Uint8Array(bits);
}

/** @returns {Promise<string>} the encoded hash */
export async function hashPassword(password) {
  if (typeof password !== 'string') throw new Error('password must be a string');
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, ITERATIONS);
  return [ALGORITHM, DIGEST, ITERATIONS, toBase64Url(salt), toBase64Url(derived)].join('$');
}

/**
 * Constant-time-ish verification. Returns false for any malformed record rather
 * than throwing, so a corrupt row cannot turn into a 500 on the login route.
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 5) return false;
  const [alg, digest, iterationsRaw, saltRaw, hashRaw] = parts;
  if (alg !== ALGORITHM || digest !== DIGEST) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  try {
    const expected = fromBase64Url(hashRaw);
    const actual = await derive(password, fromBase64Url(saltRaw), iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    // Preserve a comparable amount of work on length mismatch.
    let acc = 0;
    for (let i = 0; i < a.length; i += 1) acc |= a[i] ^ a[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Server-side password policy. Returns null when acceptable, else a message. */
export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
  }
  return null;
}
