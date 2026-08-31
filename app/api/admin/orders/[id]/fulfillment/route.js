import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { commerceGetFulfillmentJobByOrder, commerceListFulfillmentAttempts } from '@/lib/commerce/index';

/** GET /api/admin/orders/:id/fulfillment — sanitized job + attempt history */
export async function GET(_request, { params }) {
  const gate = await requireAdminApi(_request);
  if (!gate.ok) return gate.response;

  const job = await commerceGetFulfillmentJobByOrder(params.id);
  if (!job) {
    return NextResponse.json({ job: null, attempts: [] });
  }

  const attempts = await commerceListFulfillmentAttempts(job.id);
  const sanitized = {
    id: job.id,
    order_id: job.order_id,
    supplier: job.supplier,
    status: job.status,
    attempt_count: job.attempt_count,
    max_attempts: job.max_attempts,
    error_code: job.error_code,
    error_message: job.error_message,
    supplier_order_id: job.supplier_order_id,
    created_at: job.created_at,
    updated_at: job.updated_at,
    started_at: job.started_at,
    completed_at: job.completed_at
  };

  return NextResponse.json({
    job: sanitized,
    attempts: attempts.map((a) => ({
      id: a.id,
      attempt_number: a.attempt_number,
      stage: a.stage,
      result: a.result,
      error_code: a.error_code,
      error_summary: a.error_summary,
      started_at: a.started_at,
      ended_at: a.ended_at
    }))
  });
}
