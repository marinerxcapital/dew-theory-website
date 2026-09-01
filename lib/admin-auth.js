import crypto from 'crypto';
import { cookies } from 'next/headers';
import { readStore } from './store.js';
import {
  DEV_EMAIL,
  DEV_PASSWORD,
  DEV_SESSION_SECRET,
  productionAuthConfigured,
  resolveExpectedCredentials,
  resolveOwnerEmail,
  isOwnerAdmin as checkOwnerAdmin
} from './admin-auth-policy.js';

const COOKIE = 'dew_admin_session';
const MAX_AGE = 60 * 60 * 12; // 12h

export function getAdminSessionCookieName() {
  return COOKIE;
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/** Session HMAC secret — defaults only allowed outside production. */
function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (isProduction()) {
    if (!secret || secret === DEV_SESSION_SECRET) {
      return null;
    }
    return secret;
  }
  return secret || DEV_SESSION_SECRET;
}

function timingSafeEqualString(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) {
    // Compare against self to keep timing roughly constant on length mismatch
    crypto.timingSafeEqual(ba, ba);
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

/** Signed token: base64url(payload).hmac. Replace with Supabase Auth later. */
function sign(payload) {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is required in production');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const secret = sessionSecret();
  if (!secret) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!timingSafeEqualString(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(admin) {
  return sign({
    admin_id: admin.id,
    email: admin.email,
    role: admin.role,
    exp: Date.now() + MAX_AGE * 1000
  });
}

export function sessionCookieOptions(token) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  };
}

export async function getAdminFromCookies() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const payload = verify(token);
  if (!payload) return null;
  const store = readStore();
  const admin = store.admins.find((a) => a.id === payload.admin_id);
  if (!admin) return null;
  if (!checkOwnerAdmin(admin)) return null;
  return admin;
}

/**
 * Validates admin login.
 * Production: ADMIN_EMAIL + ADMIN_PASSWORD env required; default dev password rejected.
 * Development: falls back to well-known local defaults.
 */
export function validateCredentials(email, password) {
  if (isProduction() && !productionAuthConfigured()) return null;

  const expected = resolveExpectedCredentials();
  if (!expected) return null;

  const emailOk = timingSafeEqualString(String(email || '').toLowerCase(), expected.email);
  const passOk = timingSafeEqualString(String(password || ''), expected.password);
  if (!emailOk || !passOk) return null;

  const store = readStore();
  const admin = store.admins.find((a) => a.email.toLowerCase() === expected.email);
  if (!admin || !checkOwnerAdmin(admin)) return null;
  return admin;
}

/**
 * CSRF-ish guard for admin mutations: require matching Origin (or Referer) host.
 * SameSite=lax cookies already limit cross-site POSTs; this blocks missing-origin abuse in prod.
 */
export function assertSameOrigin(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  if (!host) return { ok: false, error: 'Missing host' };

  let source = origin;
  if (!source && referer) {
    try {
      source = new URL(referer).origin;
    } catch {
      source = null;
    }
  }

  if (!source) {
    // Browser form posts usually send Origin; allow missing only in development (curl/tests)
    if (!isProduction()) return { ok: true };
    return { ok: false, error: 'Missing origin' };
  }

  try {
    const srcHost = new URL(source).host;
    if (srcHost !== host) return { ok: false, error: 'Invalid origin' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Invalid origin' };
  }
}

/**
 * Auth + origin for admin write APIs.
 * Returns `{ ok: true, admin }` or `{ ok: false, response: NextResponse }`.
 */
export async function requireAdminApi(request) {
  const { NextResponse } = await import('next/server');
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: originCheck.error }, { status: 403 })
    };
  }
  const admin = await getAdminFromCookies();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }
  return { ok: true, admin };
}

export { MAX_AGE, DEV_EMAIL, DEV_PASSWORD };
