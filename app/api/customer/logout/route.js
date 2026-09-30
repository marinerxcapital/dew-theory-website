import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { assertSameOrigin } from '@/lib/admin-auth';
import { CUSTOMER_COOKIE, endSession } from '@/lib/customers/auth';
import { clearCustomerSessionCookie } from '@/lib/customers/guards';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  try {
    const jar = await cookies();
    const token = jar.get(CUSTOMER_COOKIE)?.value || null;
    await endSession(token);
    await clearCustomerSessionCookie();
  } catch {
    /* signing out is idempotent — never surface an error */
  }
  return NextResponse.json({ ok: true });
}
