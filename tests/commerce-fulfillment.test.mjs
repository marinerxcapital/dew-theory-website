/**
 * Commerce durable persistence + fulfillment job tests
 */
import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { resetCommerceBackendForTests, getCommerceBackend } from '../lib/commerce/index.js';
import { persistPaidOrderWithJob } from '../lib/fulfillment/jobs.js';
import { signRequest, verifyHmacRequest } from '../lib/internal/hmac-auth.js';
import { validateVerifiedMappingsForLines } from '../lib/suppliers/skin-script/mapping.js';
import { canTransition, isRetryableError, blockedStatusForError } from '../lib/fulfillment/state-machine.js';

describe('fulfillment state machine', () => {
  it('allows paid → queued_for_supplier', () => {
    assert.equal(canTransition('paid', 'queued_for_supplier'), true);
  });

  it('blocks invalid transitions', () => {
    assert.equal(canTransition('pending_payment', 'submitted_to_skin_script'), false);
  });

  it('classifies retryable vs blocked errors', () => {
    assert.equal(isRetryableError('network_error'), true);
    assert.equal(isRetryableError('blocked_out_of_stock'), false);
    assert.equal(blockedStatusForError('captcha_detected'), 'blocked_human_verification');
  });
});

describe('commerce file backend', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('creates idempotent fulfillment job for paid order', async () => {
    const order = {
      id: `ord_commerce_${Date.now()}`,
      status: 'paid',
      stripe_session_id: `cs_test_${Date.now()}`,
      items: [],
      created_at: new Date().toISOString()
    };
    const r1 = await persistPaidOrderWithJob(order);
    assert.equal(r1.created, true);
    assert.ok(r1.job?.id);

    const r2 = await persistPaidOrderWithJob(order);
    assert.equal(r2.idempotent, true);
    assert.equal(r2.job.id, r1.job.id);
  });
});

describe('verified supplier mapping', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
  });

  it('rejects unverified mappings in production mode', async () => {
    const db = await getCommerceBackend();
    await db.upsertSupplierMapping({
      product_id: 'test-product',
      skin_script_sku: 'SS-TEST',
      verified: 0,
      active: 1
    });
    const result = await validateVerifiedMappingsForLines(
      [{ product_id: 'test-product', quantity: 1 }],
      { requireVerified: true }
    );
    assert.equal(result.ok, false);
    assert.equal(result.code, 'blocked_supplier_mapping');
  });
});

describe('HMAC auth', () => {
  beforeEach(() => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
    process.env.SKIN_SCRIPT_RPA_HMAC_SECRET = 'test-secret-for-unit-tests-only';
  });

  it('signs and verifies requests', async () => {
    const body = JSON.stringify({ hello: 'world' });
    const { timestamp, nonce, signature } = signRequest('POST', '/v1/fulfillment/jobs', body);
    const req = new Request('http://localhost/v1/fulfillment/jobs', {
      method: 'POST',
      headers: {
        'x-dew-timestamp': String(timestamp),
        'x-dew-nonce': nonce,
        'x-dew-signature': signature
      },
      body
    });
    const result = await verifyHmacRequest(req, body);
    assert.equal(result.ok, true);
  });

  it('rejects replay', async () => {
    const body = '{}';
    const { timestamp, nonce, signature } = signRequest('POST', '/v1/test', body);
    const headers = {
      'x-dew-timestamp': String(timestamp),
      'x-dew-nonce': nonce,
      'x-dew-signature': signature
    };
    const req1 = new Request('http://localhost/v1/test', { method: 'POST', headers, body });
    assert.equal((await verifyHmacRequest(req1, body)).ok, true);
    const req2 = new Request('http://localhost/v1/test', { method: 'POST', headers, body });
    assert.equal((await verifyHmacRequest(req2, body)).ok, false);
  });
});
