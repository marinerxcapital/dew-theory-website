import { NextResponse } from 'next/server';
import {
  createSessionToken,
  sessionCookieOptions,
  validateCredentials
} from '@/lib/admin-auth';
import { audit, mutateStore } from '@/lib/store';

// Simple in-memory rate limit (per process)
const attempts = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 20;
  const entry = attempts.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  attempts.set(ip, entry);
  return entry.count > max;
}

export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local';

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const admin = validateCredentials(body.email || '', body.password || '');

    if (!admin) {
      mutateStore((s) => {
        s.audit_log.unshift({
          id: `aud_${Date.now()}`,
          admin_id: null,
          action: 'admin.login_failed',
          entity: 'Admins',
          entity_id: body.email || '',
          diff: { ip },
          created_at: new Date().toISOString()
        });
        return s;
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createSessionToken(admin);
    const cookie = sessionCookieOptions(token);
    audit(admin.id, 'admin.login_success', 'Admins', admin.id, { ip });

    const res = NextResponse.json({ ok: true, admin: { name: admin.name, role: admin.role } });
    res.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
