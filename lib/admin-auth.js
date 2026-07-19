import crypto from 'crypto';
import { cookies } from 'next/headers';
import { readStore } from '@/lib/store';

const COOKIE = 'dew_admin_session';
const MAX_AGE = 60 * 60 * 12; // 12h

export function getAdminSessionCookieName() {
  return COOKIE;
}

/** Signed token: base64url(payload).hmac. Fine for local; replace with Supabase Auth. */
function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dew-theory-dev-secret-change-me';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const secret = process.env.ADMIN_SESSION_SECRET || 'dew-theory-dev-secret-change-me';
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig !== expected) return null;
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
    secure: process.env.NODE_ENV === 'production',
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
  return admin;
}

export function validateCredentials(email, password) {
  const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@dewtheory.local').toLowerCase();
  const expectedPass = process.env.ADMIN_PASSWORD || 'dew-admin-dev';
  if (email.toLowerCase() !== expectedEmail || password !== expectedPass) {
    return null;
  }
  const store = readStore();
  return store.admins.find((a) => a.email.toLowerCase() === expectedEmail) || store.admins[0];
}

export { MAX_AGE };
