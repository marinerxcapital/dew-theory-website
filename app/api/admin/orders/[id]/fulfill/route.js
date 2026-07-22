import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { fulfillOrder } from '@/lib/dropship/fulfill-order';

/**
 * POST /api/admin/orders/:id/fulfill
 * Auto-submit to Skin Script adapter (mock/http). Idempotent.
 * body: { force?: boolean }
 */
export async function POST(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = await fulfillOrder(params.id, {
    adminId: admin.id,
    force: Boolean(body.force)
  });

  if (!result.ok && result.code === 'order_not_found') {
    return NextResponse.json({ error: result.error, code: result.code }, { status: 404 });
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
        order: result.order || null,
        classification: result.classification || null
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    idempotent: Boolean(result.idempotent),
    code: result.code,
    order: result.order
  });
}
