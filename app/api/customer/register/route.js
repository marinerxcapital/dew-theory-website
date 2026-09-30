import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/admin-auth';
import { registerCustomer, startSession } from '@/lib/customers/auth';
import { setCustomerSessionCookie } from '@/lib/customers/guards';
import { checkThrottle } from '@/lib/customers/throttle';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const limit = checkThrottle(request, 'customer-register', 10, 15 * 60 * 1000);
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
    const result = await registerCustomer({
      email: body?.email,
      name: body?.name,
      password: body?.password
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const token = await startSession(result.customer.id);
    await setCustomerSessionCookie(token);
    return NextResponse.json({ ok: true, customer: { email: result.customer.email, name: result.customer.name } });
  } catch (err) {
    console.error('[customer/register] failed', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Could not create the account' }, { status: 500 });
  }
}
