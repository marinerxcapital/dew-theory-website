import { NextResponse } from 'next/server';
import { getAdminSessionCookieName } from '@/lib/admin-auth';

export async function POST(request) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = NextResponse.redirect(new URL('/admin/login', origin));
  res.cookies.set(getAdminSessionCookieName(), '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });
  return res;
}
