import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PATCH(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  const body = await request.json();
  const before = readStore().discount_codes.find((d) => d.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let after;
  mutateStore((s) => {
    const idx = s.discount_codes.findIndex((d) => d.id === params.id);
    after = {
      ...s.discount_codes[idx],
      active: typeof body.active === 'boolean' ? body.active : s.discount_codes[idx].active,
      value: body.value != null ? Number(body.value) : s.discount_codes[idx].value,
      max_uses: body.max_uses !== undefined ? body.max_uses : s.discount_codes[idx].max_uses
    };
    s.discount_codes[idx] = after;
    return s;
  });

  audit(admin.id, 'discount.update', 'DiscountCodes', params.id, { before, after });
  return NextResponse.json({ discount: after });
}
