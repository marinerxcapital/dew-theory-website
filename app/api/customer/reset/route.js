import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/admin-auth';
import { consumePasswordReset, startSession } from '@/lib/customers/auth';
import { setCustomerSessionCookie } from '@/lib/customers/guards';
import { checkThrottle } from '@/lib/customers/throttle';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const limit = checkThrottle(request, 'customer-reset', 10, 30 * 60 * 1000);
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
    const result = await consumePasswordReset(body?.token, body?.password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    // Every prior grant was revoked by the reset; issue a fresh one so the
    // customer lands signed in on the account page.
    const token = await startSession(result.customer.id);
    await setCustomerSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[customer/reset] failed', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Could not reset the password' }, { status: 500 });
  }
}
