/**
 * Commerce failure injection + idempotency tests (RPA fulfillment edge cases)
 */
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  resetCommerceBackendForTests,
  getCommerceBackend,
  commerceGetFulfillmentJob
} from '../lib/commerce/index.js';
import {
  persistPaidOrderWithJob,
  completeFulfillmentSuccess,
  completeFulfillmentFailure,
  cancelFulfillmentJob,
  claimFulfillmentJob
} from '../lib/fulfillment/jobs.js';
import { signRequest, verifyHmacRequest } from '../lib/internal/hmac-auth.js';
import { validateVerifiedMappingsForLines } from '../lib/suppliers/skin-script/mapping.js';
import {
  isRetryableError,
  blockedStatusForError,
  NON_RETRYABLE_ERROR_CODES
} from '../lib/fulfillment/state-machine.js';
import { fulfillOrder, shouldAutoFulfill } from '../lib/dropship/fulfill-order.js';

function paidOrder(suffix = Date.now()) {
  return {
    id: `ord_fail_inj_${suffix}`,
    status: 'paid',
    stripe_session_id: `cs_test_${suffix}`,
    items: [{ product_id: 'test-product', quantity: 1 }],
    created_at: new Date().toISOString()
  };
}

describe('duplicate fulfillment job creation', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('persistPaidOrderWithJob is idempotent on repeated calls', async () => {
    const order = paidOrder();
    const r1 = await persistPaidOrderWithJob(order);
    assert.equal(r1.created, true);
    assert.ok(r1.job?.id);
    assert.equal(r1.job.status, 'queued_for_supplier');

    const r2 = await persistPaidOrderWithJob({ ...order, updated_at: new Date().toISOString() });
    assert.equal(r2.idempotent, true);
    assert.equal(r2.created, false);
    assert.equal(r2.job.id, r1.job.id);
  });
});

describe('HMAC nonce and clock skew', () => {
  const saved = {};

  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
    process.env.SKIN_SCRIPT_RPA_HMAC_SECRET = 'test-secret-for-unit-tests-only';
    saved.HMAC_CLOCK_SKEW_SEC = process.env.HMAC_CLOCK_SKEW_SEC;
    process.env.HMAC_CLOCK_SKEW_SEC = '60';
  });

  afterEach(() => {
    if (saved.HMAC_CLOCK_SKEW_SEC === undefined) delete process.env.HMAC_CLOCK_SKEW_SEC;
    else process.env.HMAC_CLOCK_SKEW_SEC = saved.HMAC_CLOCK_SKEW_SEC;
  });

  it('rejects duplicate nonce (replay)', async () => {
    const body = JSON.stringify({ job_id: 'fj_test' });
    const { timestamp, nonce, signature } = signRequest('POST', '/v1/fulfillment/jobs', body);
    const headers = {
      'x-dew-timestamp': String(timestamp),
      'x-dew-nonce': nonce,
      'x-dew-signature': signature
    };
    const req1 = new Request('http://localhost/v1/fulfillment/jobs', { method: 'POST', headers, body });
    assert.equal((await verifyHmacRequest(req1, body)).ok, true);

    const req2 = new Request('http://localhost/v1/fulfillment/jobs', { method: 'POST', headers, body });
    const replay = await verifyHmacRequest(req2, body);
    assert.equal(replay.ok, false);
    assert.equal(replay.code, 'hmac_replay');
  });

  it('rejects timestamp outside allowed clock skew', async () => {
    const body = '{}';
    const staleTs = Math.floor(Date.now() / 1000) - 120;
    const { timestamp, nonce, signature } = signRequest('POST', '/v1/test', body, staleTs);
    const req = new Request('http://localhost/v1/test', {
      method: 'POST',
      headers: {
        'x-dew-timestamp': String(timestamp),
        'x-dew-nonce': nonce,
        'x-dew-signature': signature
      },
      body
    });
    const result = await verifyHmacRequest(req, body);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'hmac_timestamp_invalid');
  });
});

describe('fulfillment blocked after supplier submission', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('blocks retry when order already has supplier_order_id', async () => {
    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);
    const supplierOrderId = `SS-ORD-${Date.now()}`;

    const success = await completeFulfillmentSuccess({
      job_id: job.id,
      order_id: order.id,
      supplier_order_id: supplierOrderId,
      supplier_status: 'accepted'
    });
    assert.equal(success.ok, true);
    assert.equal(success.order.supplier_order_id, supplierOrderId);

    const claim = await claimFulfillmentJob(job.id, 'worker-test');
    assert.equal(claim.ok, false);
    assert.equal(claim.code, 'job_already_complete');
    assert.equal(claim.idempotent, true);

    const fulfill = await fulfillOrder(order.id);
    assert.equal(fulfill.ok, true);
    assert.equal(fulfill.code, 'already_submitted');
    assert.equal(fulfill.idempotent, true);
  });
});

describe('cancelFulfillmentJob', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('cancels job when no supplier order exists', async () => {
    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);

    const result = await cancelFulfillmentJob(job.id, 'customer_requested');
    assert.equal(result.ok, true);
    assert.equal(result.job.status, 'cancelled');
    assert.equal(result.job.error_code, 'cancelled');
    assert.equal(result.job.error_message, 'customer_requested');
    assert.equal(result.job.supplier_order_id, undefined);
  });

  it('fails when supplier order already submitted', async () => {
    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);
    await completeFulfillmentSuccess({
      job_id: job.id,
      order_id: order.id,
      supplier_order_id: `SS-ORD-${Date.now()}`,
      supplier_status: 'accepted'
    });

    const result = await cancelFulfillmentJob(job.id, 'too_late');
    assert.equal(result.ok, false);
    assert.equal(result.code, 'supplier_already_submitted');
    assert.ok(result.job.supplier_order_id);
  });
});

describe('validateVerifiedMappingsForLines', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('passes when mapping is verified and active', async () => {
    const db = await getCommerceBackend();
    await db.upsertSupplierMapping({
      product_id: 'verified-product',
      skin_script_sku: 'SS-VERIFIED',
      verified: 1,
      verified_at: new Date().toISOString(),
      active: 1
    });

    const result = await validateVerifiedMappingsForLines(
      [{ product_id: 'verified-product', quantity: 2 }],
      { requireVerified: true }
    );
    assert.equal(result.ok, true);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0].skin_script_sku, 'SS-VERIFIED');
    assert.equal(result.lines[0].mapping_verified, true);
    assert.equal(result.missing.length, 0);
    assert.equal(result.unverified.length, 0);
  });
});

describe('financial cap state machine', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('treats cap errors as non-retryable in state machine and records failure without retry schedule', async () => {
    assert.ok(NON_RETRYABLE_ERROR_CODES.has('order_cap_exceeded'));
    assert.ok(NON_RETRYABLE_ERROR_CODES.has('quantity_cap_exceeded'));
    assert.equal(isRetryableError('order_cap_exceeded'), false);
    assert.equal(isRetryableError('quantity_cap_exceeded'), false);
    assert.equal(blockedStatusForError('order_cap_exceeded'), null);
    assert.equal(blockedStatusForError('quantity_cap_exceeded'), null);

    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);

    const failure = await completeFulfillmentFailure({
      job_id: job.id,
      order_id: order.id,
      error_code: 'order_cap_exceeded',
      error_message: 'Order total exceeds cap',
      stage: 'pre_submit_review'
    });
    assert.equal(failure.ok, false);
    assert.equal(failure.blocked, false);
    assert.equal(failure.error_code, 'order_cap_exceeded');

    const updated = await commerceGetFulfillmentJob(job.id);
    assert.equal(updated.status, 'queued_for_supplier');
    assert.equal(updated.next_attempt_at, null);
    assert.equal(updated.error_code, 'order_cap_exceeded');
    assert.equal(updated.completed_at, null);
  });
});

describe('claimFulfillmentJob locking', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('blocks concurrent claim from another worker while lock is held', async () => {
    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);

    const first = await claimFulfillmentJob(job.id, 'worker-a');
    assert.equal(first.ok, true);
    assert.equal(first.job.locked_by, 'worker-a');

    const second = await claimFulfillmentJob(job.id, 'worker-b');
    assert.equal(second.ok, false);
    assert.equal(second.code, 'job_locked');
  });

  it('schedules retry for retryable network_error failures', async () => {
    const order = paidOrder();
    const { job } = await persistPaidOrderWithJob(order);
    await claimFulfillmentJob(job.id, 'worker-retry');

    const failure = await completeFulfillmentFailure({
      job_id: job.id,
      order_id: order.id,
      error_code: 'network_error',
      error_message: 'Connection reset',
      stage: 'login'
    });
    assert.equal(failure.ok, false);
    assert.equal(failure.blocked, false);
    assert.equal(failure.job.status, 'queued_for_supplier');
    assert.ok(failure.job.next_attempt_at);
    assert.equal(failure.job.completed_at, null);
  });
});

describe('shouldAutoFulfill RPA gate', () => {
  const saved = {};

  beforeEach(() => {
    saved.AUTO_FULFILL = process.env.AUTO_FULFILL;
    saved.SKIN_SCRIPT_MODE = process.env.SKIN_SCRIPT_MODE;
    saved.SKIN_SCRIPT_RPA_ENABLED = process.env.SKIN_SCRIPT_RPA_ENABLED;
    delete process.env.AUTO_FULFILL;
  });

  afterEach(() => {
    if (saved.AUTO_FULFILL === undefined) delete process.env.AUTO_FULFILL;
    else process.env.AUTO_FULFILL = saved.AUTO_FULFILL;
    if (saved.SKIN_SCRIPT_MODE === undefined) delete process.env.SKIN_SCRIPT_MODE;
    else process.env.SKIN_SCRIPT_MODE = saved.SKIN_SCRIPT_MODE;
    if (saved.SKIN_SCRIPT_RPA_ENABLED === undefined) delete process.env.SKIN_SCRIPT_RPA_ENABLED;
    else process.env.SKIN_SCRIPT_RPA_ENABLED = saved.SKIN_SCRIPT_RPA_ENABLED;
  });

  it('returns false when SKIN_SCRIPT_MODE=rpa and SKIN_SCRIPT_RPA_ENABLED is not true', () => {
    process.env.SKIN_SCRIPT_MODE = 'rpa';
    delete process.env.SKIN_SCRIPT_RPA_ENABLED;
    assert.equal(shouldAutoFulfill(), false);

    process.env.SKIN_SCRIPT_RPA_ENABLED = 'false';
    assert.equal(shouldAutoFulfill(), false);

    process.env.SKIN_SCRIPT_RPA_ENABLED = 'true';
    assert.equal(shouldAutoFulfill(), true);
  });
});
