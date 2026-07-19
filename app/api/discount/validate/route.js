import { NextResponse } from 'next/server';
import { resolveDiscountCode } from '@/lib/discounts';
import { readStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const store = readStore();
    const result = resolveDiscountCode(body.code, store.discount_codes || []);

    if (!result.ok) {
      const status = result.code === 'discount_not_found' || result.code === 'discount_inactive' ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status }
      );
    }

    return NextResponse.json({
      discount: {
        id: result.discount.id,
        code: result.discount.code,
        type: result.discount.type,
        value: result.discount.value,
        active: result.discount.active
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Validation failed', code: 'discount_validate_failed' },
      { status: 500 }
    );
  }
}
