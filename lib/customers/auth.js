/**
 * Customer authentication service.
 *
 * Session model: an opaque 32-byte bearer value in an httpOnly cookie, with only
 * its SHA-256 hash stored server-side. A database read therefore cannot be
 * replayed as a login, sessions are revocable, and no extra signing secret has
 * to be provisioned to enable the feature.
 *
 * Deliberately separate from admin auth: a customer session can never satisfy
 * `requireAdmin()`, and vice versa.
 *
 * This module is framework-free on purpose so it can be unit tested directly.
 * The `next/headers` cookie glue lives in ./guards.js.
 */
import {
  createCustomer,
  createSessionRecord,
  deleteSessionRecord,
  deleteSessionsForCustomer,
  findCustomerByEmail,
  getCustomerById,
  getSessionRecord,
  hashToken,
  generateToken,
  touchSessionRecord,
  updateCustomerPassword
} from './store.js';
import { isPlausibleEmail, normalizeEmail } from './schema.js';
import { hashPassword, passwordProblem, verifyPassword } from './passwords.js';

export const CUSTOMER_COOKIE = 'dew_customer_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

export const GENERIC_AUTH_ERROR = 'Email or password is incorrect';
export const GENERIC_RECOVER_MESSAGE = 'If that email has an account, a reset link is on its way.';

/**
 * A dummy record with the same shape as a real hash, used to spend comparable
 * work when the account does not exist so login timing does not disclose it.
 */
const DUMMY_HASH =
  'pbkdf2$sha256$100000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/* -------------------------------------------------------------- session */

/** Issues a fresh grant for a customer and returns the raw bearer value. */
export async function startSession(customerId, kind = 'session') {
  const token = generateToken();
  const ttl = kind === 'reset' ? RESET_TTL_MS : SESSION_TTL_MS;
  await createSessionRecord({
    tokenHash: hashToken(token),
    customerId,
    kind,
    ttlMs: ttl
  });
  return token;
}

export async function endSession(token) {
  if (token) await deleteSessionRecord(hashToken(token));
}

/**
 * Resolve a customer from a raw bearer value.
 * Returns null whenever anything is missing, expired, malformed or non-active —
 * it never throws and never half-authenticates.
 */
export async function resolveSessionCustomer(token, kind = 'session') {
  if (!token) return null;
  const session = await getSessionRecord(hashToken(token), kind);
  if (!session) return null;

  const customer = await getCustomerById(session.customer_id);
  if (!customer || customer.status !== 'active') return null;

  await touchSessionRecord(session.token_hash).catch(() => {});
  return { customer, session };
}

/* --------------------------------------------------------------- service */

/**
 * Register. Returns `{ ok: true }` or `{ ok: false, error }`.
 * A duplicate address is reported explicitly here because registration cannot
 * hide the collision anyway — the caller already chose the password.
 */
export async function registerCustomer({ email, name, password }) {
  if (!isPlausibleEmail(email)) return { ok: false, error: 'Enter a valid email address' };
  const pwProblem = passwordProblem(password);
  if (pwProblem) return { ok: false, error: pwProblem };

  const passwordHash = await hashPassword(password);
  const created = await createCustomer({ email, name, passwordHash });
  if (!created.ok) return { ok: false, error: 'An account already exists for that email' };
  return { ok: true, customer: created.customer };
}

/** Verify credentials. Never reveals whether the address exists. */
export async function authenticateCustomer({ email, password }) {
  if (!isPlausibleEmail(email) || typeof password !== 'string' || !password) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }
  const customer = await findCustomerByEmail(email);
  if (!customer || customer.status !== 'active') {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }
  const valid = await verifyPassword(password, customer.password_hash);
  if (!valid) return { ok: false, error: GENERIC_AUTH_ERROR };
  return { ok: true, customer };
}

/**
 * Begin a password reset. Always reports the same generic outcome, so this is
 * not an account-enumeration oracle. The raw token is returned ONLY for the
 * caller to hand to the mailer — never to an HTTP response.
 */
export async function createPasswordReset(email) {
  if (!isPlausibleEmail(email)) return { ok: true, token: null, customer: null };
  const customer = await findCustomerByEmail(email);
  if (!customer || customer.status !== 'active') {
    return { ok: true, token: null, customer: null };
  }
  const token = await startSession(customer.id, 'reset');
  return { ok: true, token, customer };
}

/** Complete a password reset and invalidate every grant for that customer. */
export async function consumePasswordReset(token, password) {
  const pwProblem = passwordProblem(password);
  if (pwProblem) return { ok: false, error: pwProblem };
  if (!token) return { ok: false, error: 'This reset link is invalid or has expired' };

  const record = await getSessionRecord(hashToken(token), 'reset');
  if (!record) return { ok: false, error: 'This reset link is invalid or has expired' };

  const customer = await getCustomerById(record.customer_id);
  if (!customer || customer.status !== 'active') {
    return { ok: false, error: 'This reset link is invalid or has expired' };
  }

  const passwordHash = await hashPassword(password);
  await updateCustomerPassword(customer.id, passwordHash);
  await deleteSessionsForCustomer(customer.id);
  return { ok: true, customer };
}

export { normalizeEmail };
