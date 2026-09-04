import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  commerceAudit,
  commerceGetFulfillmentJobByOrder,
  commerceGetOrder,
  commerceUpsertFulfillmentJob,
  commerceUpsertOrder
} from '@/lib/commerce';
import { buildManualFulfillmentUpdate } from '@/lib/admin/manual-fulfillment';

/**
 * POST /api/admin/orders/:id/manual-fulfill
 * Owner records supplier PO / tracking / status. Never calls live Skin Script.
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

  const order = await commerceGetOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found', code: 'order_not_found' }, { status: 404 });
  }

  const job = await commerceGetFulfillmentJobByOrder(params.id);
  const built = buildManualFulfillmentUpdate({ order, job, body });
  if (!built.ok) {
    return NextResponse.json(
      { error: built.error, code: built.code },
      { status: built.status || 400 }
    );
  }

  const savedOrder = await commerceUpsertOrder(built.order);
  let savedJob = null;
  if (built.job) {
    savedJob = await commerceUpsertFulfillmentJob(built.job);
  }

  await commerceAudit(admin.id, 'order.manual_fulfill', 'Orders', params.id, {
    before: order.status,
    after: savedOrder.status,
    supplier_order_id: savedOrder.supplier_order_id || null,
    tracking_number: savedOrder.tracking_number || null,
    carrier: savedOrder.carrier || null,
    action: body.action || null
  });

  return NextResponse.json({
    ok: true,
    order: savedOrder,
    job: savedJob
  });
}
