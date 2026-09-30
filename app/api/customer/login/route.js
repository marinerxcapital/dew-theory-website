import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/admin-auth';
import { authenticateCustomer, startSession } from '@/lib/customers/auth';
import { setCustomerSessionCookie } from '@/lib/customers/guards';
import { checkThrottle } from '@/lib/customers/throttle';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const limit = checkThrottle(request, 'customer-login', 12, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const result = await authenticateCustomer({ email: body?.email, password: body?.password });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

    const token = await startSession(result.customer.id);
    await setCustomerSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[customer/login] failed', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Could not sign in' }, { status: 500 });
  }
}
