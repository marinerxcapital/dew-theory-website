import { NextResponse } from 'next/server';
import { sendMembershipInterestEmail } from '@/lib/email';
import { mutateStore, trackEvent } from '@/lib/store';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON', code: 'invalid_json' }, { status: 400 });
    }

    const name = String(body.name || '')
      .trim()
      .slice(0, 200);
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
      .slice(0, 320);

    if (!name) {
      return NextResponse.json({ error: 'Name is required', code: 'name_required' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required', code: 'email_invalid' },
        { status: 400 }
      );
    }

    const row = {
      id: `mi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      email,
      created_at: new Date().toISOString()
    };

    mutateStore((s) => {
      if (!Array.isArray(s.membership_interest)) s.membership_interest = [];
      const exists = s.membership_interest.find((r) => r.email === email);
      if (!exists) s.membership_interest.unshift(row);
      s.membership_interest = s.membership_interest.slice(0, 2000);
      return s;
    });

    trackEvent('membership_interest', { email_domain: email.split('@')[1] || '' });

    // Best-effort email; interest is already stored
    sendMembershipInterestEmail({ name, email }).catch(() => {});

    return NextResponse.json({ ok: true, code: 'membership_interest_saved' });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed', code: 'membership_interest_error' },
      { status: 500 }
    );
  }
}
