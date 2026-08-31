/**
 * RPA adapter ↔ mock RPA service integration (HMAC-signed HTTP).
 */
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { createRpaSkinScriptAdapter } from '../lib/suppliers/skin-script/rpa-adapter.js';
import { resetCommerceBackendForTests } from '../lib/commerce/index.js';
import { createMockRpaServer } from './helpers/mock-rpa-server.mjs';

describe('RPA adapter mock service integration', () => {
  /** @type {ReturnType<typeof createMockRpaServer>} */
  let mock;
  /** @type {string} */
  let baseUrl;
  const saved = {};

  beforeEach(async () => {
    resetCommerceBackendForTests();
    process.env.STORE_BACKEND = 'file';
    process.env.SKIN_SCRIPT_RPA_HMAC_SECRET = 'test-rpa-hmac-secret-integration';

    saved.SKIN_SCRIPT_RPA_SERVICE_URL = process.env.SKIN_SCRIPT_RPA_SERVICE_URL;
    saved.SKIN_SCRIPT_RPA_ENABLED = process.env.SKIN_SCRIPT_RPA_ENABLED;
    saved.SKIN_SCRIPT_DRY_RUN = process.env.SKIN_SCRIPT_DRY_RUN;

    mock = createMockRpaServer();
    const started = await mock.start();
    baseUrl = started.baseUrl;
    process.env.SKIN_SCRIPT_RPA_SERVICE_URL = baseUrl;
    process.env.SKIN_SCRIPT_RPA_ENABLED = 'true';
  });

  afterEach(async () => {
    await mock.stop();
    if (saved.SKIN_SCRIPT_RPA_SERVICE_URL === undefined) delete process.env.SKIN_SCRIPT_RPA_SERVICE_URL;
    else process.env.SKIN_SCRIPT_RPA_SERVICE_URL = saved.SKIN_SCRIPT_RPA_SERVICE_URL;
    if (saved.SKIN_SCRIPT_RPA_ENABLED === undefined) delete process.env.SKIN_SCRIPT_RPA_ENABLED;
    else process.env.SKIN_SCRIPT_RPA_ENABLED = saved.SKIN_SCRIPT_RPA_ENABLED;
    if (saved.SKIN_SCRIPT_DRY_RUN === undefined) delete process.env.SKIN_SCRIPT_DRY_RUN;
    else process.env.SKIN_SCRIPT_DRY_RUN = saved.SKIN_SCRIPT_DRY_RUN;
  });

  it('submits dry-run job with valid HMAC headers', async () => {
    process.env.SKIN_SCRIPT_DRY_RUN = 'true';
    const adapter = createRpaSkinScriptAdapter();

    const result = await adapter.createDropshipOrder({
      order_id: 'ord_rpa_int_1',
      idempotency_key: 'ord_rpa_int_1',
      customer: { name: 'Test', email: 't@example.com' },
      shipping_address: { line1: '1 Main', city: 'Austin', state: 'TX', postal_code: '78701' },
      lines: [{ product_id: 'test-product', skin_script_sku: 'SS-TEST', quantity: 1 }]
    });

    assert.equal(result.status, 'dry_run_ready');
    assert.equal(result.external_id, 'fj_mock_dry_run');
    assert.equal(mock.requests.length, 1);
    assert.equal(mock.requests[0].auth.ok, true);
    assert.equal(mock.requests[0].path, '/v1/fulfillment/jobs');
    assert.equal(mock.requests[0].body.dry_run, true);
  });

  it('returns supplier order id on live submit path', async () => {
    delete process.env.SKIN_SCRIPT_DRY_RUN;
    const adapter = createRpaSkinScriptAdapter();

    const result = await adapter.createDropshipOrder({
      order_id: 'ord_rpa_int_2',
      customer: { name: 'Test', email: 't@example.com' },
      shipping_address: { line1: '1 Main', city: 'Austin', state: 'TX', postal_code: '78701' },
      lines: [{ product_id: 'test-product', skin_script_sku: 'SS-TEST', quantity: 1 }]
    });

    assert.equal(result.external_id, 'SS-MOCK-001');
    assert.equal(result.status, 'accepted');
  });

  it('checks inventory via signed POST', async () => {
    const adapter = createRpaSkinScriptAdapter();
    const rows = await adapter.getInventory(['SS-A', 'SS-B']);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].in_stock, true);
    assert.ok(mock.requests.some((r) => r.path === '/v1/inventory/check'));
  });

  it('respects kill switch when RPA disabled', async () => {
    process.env.SKIN_SCRIPT_RPA_ENABLED = 'false';
    const adapter = createRpaSkinScriptAdapter();
    await assert.rejects(
      () =>
        adapter.createDropshipOrder({
          order_id: 'ord_rpa_int_3',
          lines: [{ skin_script_sku: 'SS-TEST', quantity: 1 }]
        }),
      (err) => err.code === 'rpa_disabled'
    );
  });
});
