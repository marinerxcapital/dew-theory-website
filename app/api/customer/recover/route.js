import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/admin-auth';
import {
  GENERIC_RECOVER_MESSAGE,
  createPasswordReset
} from '@/lib/customers/auth';
import { checkThrottle } from '@/lib/customers/throttle';
import { getEmailConfig, sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Password reset request.
 *
 * Always answers with the same sentence whether or not the address exists, so
 * this endpoint is not an account-enumeration oracle. The reset link is only
 * ever sent by email — never returned in the HTTP response.
 *
 * Delivery uses the existing shared mailer. Without `RESEND_API_KEY` configured
 * the message is recorded as `logged` rather than sent, which is the same
 * behaviour every other transactional email in this project already has.
 */
export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const limit = checkThrottle(request, 'customer-recover', 6, 30 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
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
    const result = await createPasswordReset(body?.email);
    if (result.token && result.customer) {
      const cfg = getEmailConfig();
      const link = `${cfg.siteUrl}/account/reset?token=${encodeURIComponent(result.token)}`;
      await sendEmail({
        to: result.customer.email,
        subject: 'Reset your Dew Theory password',
        text:
          `Someone asked to reset the password for this Dew Theory account.\n\n` +
          `Open this link within one hour to choose a new password:\n${link}\n\n` +
          `If it was not you, ignore this email — nothing changes until the link is used.`,
        tags: ['password-reset']
      });
    }
  } catch {
    /* fall through to the generic answer on purpose */
  }

  return NextResponse.json({ ok: true, message: GENERIC_RECOVER_MESSAGE });
}
