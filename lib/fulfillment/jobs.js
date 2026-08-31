/**
 * Fulfillment job lifecycle — durable outbox from paid order → supplier submission.
 */
import { newId, nowIso } from '../commerce/schema.js';
import {
  commerceCreateFulfillmentAttempt,
  commerceGetFulfillmentJob,
  commerceGetFulfillmentJobByOrder,
  commerceGetOrder,
  commerceListFulfillmentAttempts,
  commerceRecordSupplierOrderEvent,
  commerceUpsertFulfillmentJob,
  commerceUpsertOrder
} from '../commerce/index.js';
import { blockedStatusForError, canTransition, isRetryableError } from './state-machine.js';
import { logInfo, logWarn } from '../log.js';
import { sendFulfillmentAlert } from './alerts.js';

const SUPPLIER = 'skin_script';

const BLOCKED_NO_CLAIM = new Set([
  'blocked_supplier_mapping',
  'blocked_out_of_stock',
  'blocked_price_drift',
  'blocked_address_validation',
  'blocked_human_verification',
  'blocked_payment_authentication',
  'blocked_supplier_policy',
  'submission_ambiguous',
  'cancelled'
]);

/**
 * Create fulfillment job idempotently when order becomes paid.
 * @param {object} order
 */
export async function ensureFulfillmentJobForPaidOrder(order) {
  if (!order?.id) throw new Error('order required');
  if (order.status !== 'paid' && order.status !== 'queued_for_supplier') {
    return { created: false, skipped: true, reason: 'order_not_paid' };
  }

  const existing = await commerceGetFulfillmentJobByOrder(order.id, SUPPLIER);
  if (existing) {
    return { created: false, job: existing, idempotent: true };
  }

  const ts = nowIso();
  const job = await commerceUpsertFulfillmentJob({
    order_id: order.id,
    supplier: SUPPLIER,
    status: 'queued_for_supplier',
    attempt_count: 0,
    max_attempts: Number(process.env.FULFILLMENT_MAX_ATTEMPTS || 3),
    idempotency_key: `paid:${order.id}:${order.stripe_session_id || order.stripe_payment_intent || order.id}`,
    payload: {
      stripe_session_id: order.stripe_session_id || null,
      stripe_payment_intent: order.stripe_payment_intent || null
    },
    created_at: ts,
    updated_at: ts
  });

  await commerceRecordSupplierOrderEvent({
    order_id: order.id,
    fulfillment_job_id: job.id,
    event_type: 'fulfillment_job_created',
    payload: { status: job.status }
  });

  logInfo('fulfillment.job_created', {
    order_id: order.id,
    fulfillment_job_id: job.id
  });

  return { created: true, job };
}

/**
 * Mark order paid + create fulfillment job in one logical transaction.
 * @param {object} order
 */
export async function persistPaidOrderWithJob(order) {
  const saved = await commerceUpsertOrder(order);
  const jobResult = await ensureFulfillmentJobForPaidOrder(saved);
  return { order: saved, ...jobResult };
}

/**
 * @param {string} jobId
 * @param {string} workerId
 */
export async function claimFulfillmentJob(jobId, workerId) {
  const job = await commerceGetFulfillmentJob(jobId);
  if (!job) return { ok: false, code: 'job_not_found' };

  if (job.locked_at && job.locked_by && job.locked_by !== workerId) {
    const lockAge = Date.now() - Date.parse(job.locked_at);
    if (lockAge < Number(process.env.FULFILLMENT_LOCK_TTL_MS || 900000)) {
      return { ok: false, code: 'job_locked', job };
    }
  }

  if (['submitted_to_skin_script', 'supplier_processing', 'supplier_shipped', 'fulfilled'].includes(job.status)) {
    return { ok: false, code: 'job_already_complete', job, idempotent: true };
  }

  if (BLOCKED_NO_CLAIM.has(job.status)) {
    return { ok: false, code: 'job_blocked', job };
  }

  const ts = nowIso();
  const updated = await commerceUpsertFulfillmentJob({
    ...job,
    status: 'processing_supplier',
    locked_at: ts,
    locked_by: workerId,
    started_at: job.started_at || ts,
    attempt_count: (job.attempt_count || 0) + 1
  });

  return { ok: true, job: updated };
}

/**
 * @param {object} params
 */
export async function recordFulfillmentAttempt(params) {
  return commerceCreateFulfillmentAttempt({
    id: newId('fa'),
    fulfillment_job_id: params.job_id,
    attempt_number: params.attempt_number,
    stage: params.stage || null,
    result: params.result || null,
    error_code: params.error_code || null,
    error_summary: params.error_summary || null,
    supplier_order_id: params.supplier_order_id || null,
    started_at: params.started_at || nowIso(),
    ended_at: params.ended_at || nowIso(),
    metadata: params.metadata || null
  });
}

/**
 * Complete job success — update order + job atomically (best-effort sequential).
 * @param {object} params
 */
export async function completeFulfillmentSuccess(params) {
  const { job_id, order_id, supplier_order_id, supplier_status, raw } = params;
  const job = await commerceGetFulfillmentJob(job_id);
  const order = await commerceGetOrder(order_id);
  if (!job || !order) {
    return { ok: false, code: 'not_found' };
  }

  const ts = nowIso();
  const updatedOrder = {
    ...order,
    status: 'submitted_to_skin_script',
    supplier_order_id,
    supplier_status: supplier_status || 'accepted',
    supplier_raw: raw || null,
    submitted_to_skin_script_at: order.submitted_to_skin_script_at || ts,
    fulfillment_error: null,
    fulfillment_error_code: null,
    updated_at: ts
  };
  await commerceUpsertOrder(updatedOrder);

  const updatedJob = await commerceUpsertFulfillmentJob({
    ...job,
    status: 'submitted_to_skin_script',
    supplier_order_id,
    completed_at: ts,
    locked_at: null,
    locked_by: null,
    error_code: null,
    error_message: null
  });

  await commerceRecordSupplierOrderEvent({
    order_id,
    fulfillment_job_id: job_id,
    supplier_order_id,
    event_type: 'supplier_submitted',
    payload: { supplier_status, raw }
  });

  logInfo('fulfillment.completed', { order_id, job_id, supplier_order_id });
  return { ok: true, order: updatedOrder, job: updatedJob };
}

/**
 * @param {object} params
 */
export async function completeFulfillmentFailure(params) {
  const { job_id, order_id, error_code, error_message, stage } = params;
  const job = await commerceGetFulfillmentJob(job_id);
  const order = order_id ? await commerceGetOrder(order_id) : null;
  if (!job) return { ok: false, code: 'job_not_found' };

  const blocked = blockedStatusForError(error_code);
  const nextJobStatus = blocked || (isRetryableError(error_code) ? 'failed_supplier' : 'failed_supplier');
  const nextOrderStatus = blocked || 'failed_supplier';

  const ts = nowIso();
  if (order) {
    await commerceUpsertOrder({
      ...order,
      status: nextOrderStatus,
      fulfillment_error: String(error_message || error_code).slice(0, 2000),
      fulfillment_error_code: error_code,
      updated_at: ts
    });
  }

  const retryable = isRetryableError(error_code);
  const attemptCount = job.attempt_count || 0;
  const maxAttempts = job.max_attempts || 3;
  const exhausted = retryable && attemptCount >= maxAttempts;

  const updatedJob = await commerceUpsertFulfillmentJob({
    ...job,
    status: exhausted ? nextJobStatus : blocked ? nextJobStatus : 'queued_for_supplier',
    error_code,
    error_message: String(error_message || '').slice(0, 2000),
    locked_at: null,
    locked_by: null,
    next_attempt_at: retryable && !exhausted && !blocked ? computeNextAttempt(attemptCount) : null,
    completed_at: exhausted || blocked ? ts : null
  });

  await recordFulfillmentAttempt({
    job_id,
    attempt_number: attemptCount,
    stage,
    result: 'failed',
    error_code,
    error_summary: error_message
  });

  if (blocked || exhausted) {
    await sendFulfillmentAlert({
      order_id: order_id || job.order_id,
      fulfillment_job_id: job_id,
      error_code,
      error_message,
      affected_skus: params.affected_skus || []
    });
  }

  logWarn('fulfillment.failed', { order_id, job_id, error_code });
  return { ok: false, job: updatedJob, error_code, blocked: Boolean(blocked) };
}

function computeNextAttempt(attemptCount) {
  const base = Number(process.env.FULFILLMENT_RETRY_BASE_MS || 30000);
  const max = Number(process.env.FULFILLMENT_RETRY_MAX_MS || 600000);
  const delay = Math.min(base * 2 ** Math.max(0, attemptCount - 1), max);
  const jitter = Math.floor(Math.random() * 0.2 * delay);
  return new Date(Date.now() + delay + jitter).toISOString();
}

export async function getFulfillmentJobWithAttempts(jobId) {
  const job = await commerceGetFulfillmentJob(jobId);
  if (!job) return null;
  const attempts = await commerceListFulfillmentAttempts(jobId);
  return { job, attempts };
}

export async function cancelFulfillmentJob(jobId, reason = 'cancelled') {
  const job = await commerceGetFulfillmentJob(jobId);
  if (!job) return { ok: false, code: 'job_not_found' };
  if (job.supplier_order_id) {
    return { ok: false, code: 'supplier_already_submitted', job };
  }
  const updated = await commerceUpsertFulfillmentJob({
    ...job,
    status: 'cancelled',
    error_code: 'cancelled',
    error_message: reason,
    locked_at: null,
    locked_by: null,
    completed_at: nowIso()
  });
  return { ok: true, job: updated };
}
