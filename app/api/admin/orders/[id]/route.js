import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { validateOrderStatus } from '@/lib/order-status';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PATCH(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  const body = await request.json();
  const before = readStore().orders.find((o) => o.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const check = validateOrderStatus(body.status ?? before.status);
  if (!check.ok) {
    return NextResponse.json(
      { error: check.error, code: check.code },
      { status: check.status }
    );
  }

  let after;
  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === params.id);
    after = {
      ...s.orders[idx],
      status: check.status,
      updated_at: new Date().toISOString()
    };
    if (check.status === 'submitted_to_skin_script' && !after.submitted_to_skin_script_at) {
      after.submitted_to_skin_script_at = after.updated_at;
    }
    s.orders[idx] = after;
    return s;
  });

  if (before.status !== after.status) {
    audit(admin.id, 'order.status_update', 'Orders', params.id, {
      before: before.status,
      after: after.status
    });
  }

  return NextResponse.json({ order: after });
}
