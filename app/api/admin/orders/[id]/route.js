import { NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/admin-auth';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PATCH(request, { params }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const before = readStore().orders.find((o) => o.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let after;
  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === params.id);
    after = { ...s.orders[idx], status: body.status || s.orders[idx].status };
    s.orders[idx] = after;
    return s;
  });

  audit(admin.id, 'order.status_update', 'Orders', params.id, {
    before: before.status,
    after: after.status
  });

  return NextResponse.json({ order: after });
}
