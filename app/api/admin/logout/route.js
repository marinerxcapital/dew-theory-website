import { NextResponse } from 'next/server';
import {
  getAdminFromCookies,
  getAdminSessionCookieName
} from '@/lib/admin-auth';
import { audit } from '@/lib/store';

function clearSessionCookie(res) {
  res.cookies.set(getAdminSessionCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

function loginRedirect(request) {
  // Prefer relative redirect so host follows the request (not a stale SITE_URL)
  const url = new URL('/admin/login', request.url);
  return NextResponse.redirect(url);
}

export async function POST(request) {
  try {
    const admin = await getAdminFromCookies();
    if (admin) {
      audit(admin.id, 'admin.logout', 'Admins', admin.id, {});
    }
  } catch {
    // still clear cookie
  }
  const res = loginRedirect(request);
  clearSessionCookie(res);
  return res;
}

/** Allow GET logout links; same clear semantics */
export async function GET(request) {
  return POST(request);
}
