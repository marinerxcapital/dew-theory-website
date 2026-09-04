/**
 * Owner manual fulfillment helpers — no live Skin Script / RPA calls.
 */
import { validateOrderStatus } from '../order-status.js';

/** UI action → durable order/job status */
export const MANUAL_FULFILL_ACTIONS = {
  mark_submitted: 'submitted_to_skin_script',
  mark_shipped: 'supplier_shipped',
  mark_fulfilled: 'fulfilled',
  mark_needs_review: 'submission_ambiguous'
};

/**
 * @param {string} action
 * @returns {{ ok: true, status: string } | { ok: false, error: string, code: string }}
 */
export function resolveManualFulfillAction(action) {
  const key = String(action || '').trim();
  if (!key) {
    return { ok: false, error: 'Action is required', code: 'action_required' };
  }
  const status = MANUAL_FULFILL_ACTIONS[key];
  if (!status) {
    return { ok: false, error: `Unknown action "${key}"`, code: 'action_unknown' };
  }
  return { ok: true, status };
}

/**
 * Pure builder for commerce order + optional fulfillment job patches.
 * Never triggers supplier adapters.
 *
 * @param {object} params
 * @param {object} params.order
 * @param {object|null} [params.job]
 * @param {object} params.body
 * @param {string} [params.body.action]
 * @param {string} [params.body.status]
 * @param {string} [params.body.vendor_order_id]
 * @param {string} [params.body.supplier_order_id]
 * @param {string} [params.body.tracking_number]
 * @param {string} [params.body.carrier]
 * @param {string} [params.now]
 */
export function buildManualFulfillmentUpdate({ order, job = null, body = {}, now }) {
  if (!order?.id) {
    return { ok: false, error: 'Order required', code: 'order_required' };
  }

  let nextStatus = order.status;
  if (body.action) {
    const resolved = resolveManualFulfillAction(body.action);
    if (!resolved.ok) return resolved;
    nextStatus = resolved.status;
  } else if (body.status != null && String(body.status).trim() !== '') {
    nextStatus = String(body.status).trim();
  }

  const check = validateOrderStatus(nextStatus);
  if (!check.ok) {
    return { ok: false, error: check.error, code: check.code, status: check.status };
  }

  const ts = now || new Date().toISOString();
  const vendorRaw = body.vendor_order_id ?? body.supplier_order_id;
  const vendor_order_id =
    vendorRaw != null && String(vendorRaw).trim() !== ''
      ? String(vendorRaw).trim()
      : order.supplier_order_id || null;

  const tracking =
    body.tracking_number != null && String(body.tracking_number).trim() !== ''
      ? String(body.tracking_number).trim()
      : order.tracking_number || null;

  const carrier =
    body.carrier != null && String(body.carrier).trim() !== ''
      ? String(body.carrier).trim()
      : order.carrier || null;

  const orderPatch = {
    ...order,
    status: check.status,
    supplier_order_id: vendor_order_id,
    tracking_number: tracking,
    carrier,
    fulfillment_mode: 'manual_owner',
    updated_at: ts
  };

  if (check.status === 'submitted_to_skin_script' && !orderPatch.submitted_to_skin_script_at) {
    orderPatch.submitted_to_skin_script_at = ts;
  }
  if (check.status === 'supplier_shipped' && !orderPatch.shipped_at) {
    orderPatch.shipped_at = ts;
  }
  if (check.status === 'fulfilled' && !orderPatch.fulfilled_at) {
    orderPatch.fulfilled_at = ts;
  }

  let jobPatch = null;
  if (job) {
    jobPatch = {
      ...job,
      status: check.status,
      supplier_order_id: vendor_order_id || job.supplier_order_id || null,
      error_code: check.status === 'submission_ambiguous' ? 'needs_owner_review' : null,
      error_message:
        check.status === 'submission_ambiguous'
          ? 'Owner marked needs review (manual fulfillment)'
          : null,
      completed_at:
        ['submitted_to_skin_script', 'supplier_shipped', 'fulfilled'].includes(check.status)
          ? job.completed_at || ts
          : job.completed_at || null,
      locked_at: null,
      locked_by: null,
      updated_at: ts
    };
  }

  return {
    ok: true,
    status: check.status,
    order: orderPatch,
    job: jobPatch
  };
}
