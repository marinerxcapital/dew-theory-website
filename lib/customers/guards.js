/**
 * Framework glue for customer sessions: the httpOnly cookie and the server-side
 * page/API guards.
 *
 * Kept apart from ./auth.js so the service layer stays testable without pulling
 * `next/headers` into a plain Node process.
 *
 * Server-only.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CUSTOMER_COOKIE, SESSION_TTL_MS, resolveSessionCustomer } from './auth.js';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function cookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds
  };
}

/** Set the session cookie. Only valid inside a Route Handler or Server Action. */
export async function setCustomerSessionCookie(token) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, cookieOptions(Math.floor(SESSION_TTL_MS / 1000)));
}

export async function clearCustomerSessionCookie() {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, '', cookieOptions(0));
}

/** Read the raw bearer value from the request cookies, if any. */
export async function readCustomerCookie() {
  try {
    const jar = await cookies();
    return jar.get(CUSTOMER_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Resolve the signed-in customer from cookies.
 * Read-only and safe in server components.
 */
export async function getCustomerFromCookies() {
  const token = await readCustomerCookie();
  return resolveSessionCustomer(token, 'session');
}

/** Page guard. Redirects to sign-in when there is no valid session. */
export async function requireCustomer() {
  const found = await getCustomerFromCookies();
  if (!found) redirect('/account/login');
  return found.customer;
}

/** API guard: `{ ok: true, customer }` or `{ ok: false, response }`. */
export async function requireCustomerApi() {
  const { NextResponse } = await import('next/server');
  const found = await getCustomerFromCookies();
  if (!found) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, customer: found.customer };
}
