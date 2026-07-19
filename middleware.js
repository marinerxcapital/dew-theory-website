import { NextResponse } from 'next/server';

const COOKIE = 'dew_admin_session';

/**
 * Defense in depth for /admin:
 * - Page routes (except login): require session cookie presence (full verify still server-side)
 * - Admin API mutations: same-origin Origin/Referer check (CSRF-ish)
 * Login remains public; credential check is in the route handler.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // --- Admin API mutation origin check ---
  if (pathname.startsWith('/api/admin') && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    let sourceHost = null;
    if (origin) {
      try {
        sourceHost = new URL(origin).host;
      } catch {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    } else if (referer) {
      try {
        sourceHost = new URL(referer).host;
      } catch {
        return NextResponse.json({ error: 'Invalid referer' }, { status: 403 });
      }
    }

    if (sourceHost && host && sourceHost !== host) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    // In production, require Origin or Referer on mutations (blocks simple CSRF + cross-site)
    if (process.env.NODE_ENV === 'production' && !sourceHost) {
      return NextResponse.json({ error: 'Missing origin' }, { status: 403 });
    }
  }

  // --- Admin UI gate (cookie presence; requireAdmin still verifies signature) ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(COOKIE)?.value;
    if (!token) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('next', pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
