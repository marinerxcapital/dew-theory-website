import { NextResponse } from 'next/server';
import { readStore, mutateStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const code = String(body.code || '')
      .trim()
      .toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'Enter a code' }, { status: 400 });
    }

    const store = readStore();
    const discount = store.discount_codes.find(
      (d) => d.code.toUpperCase() === code && d.active
    );

    if (!discount) {
      return NextResponse.json({ error: 'Code not found or inactive' }, { status: 404 });
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    if (discount.max_uses != null && discount.uses_count >= discount.max_uses) {
      return NextResponse.json({ error: 'Code fully redeemed' }, { status: 400 });
    }

    return NextResponse.json({
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        active: discount.active
      }
    });
  } catch {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
