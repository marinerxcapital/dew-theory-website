#!/usr/bin/env node
/**
 * Operator E2E: Node RPA adapter → local RPA service → live Skin Script portal (dry-run).
 * Requires RPA service on SKIN_SCRIPT_RPA_SERVICE_URL with matching HMAC secret.
 *
 * Example:
 *   # start RPA: cd services/skin-script-rpa && uvicorn app.main:app --port 18080
 *   SKIN_SCRIPT_RPA_SERVICE_URL=http://127.0.0.1:18080 \
 *   SKIN_SCRIPT_RPA_HMAC_SECRET=your-secret \
 *   node scripts/e2e-rpa-live-stack.mjs
 */
import { createRpaSkinScriptAdapter } from '../lib/suppliers/skin-script/rpa-adapter.js';
import { resetCommerceBackendForTests } from '../lib/commerce/index.js';

const base = process.env.SKIN_SCRIPT_RPA_SERVICE_URL;
const secret = process.env.SKIN_SCRIPT_RPA_HMAC_SECRET;
if (!base || !secret) {
  console.error('Set SKIN_SCRIPT_RPA_SERVICE_URL and SKIN_SCRIPT_RPA_HMAC_SECRET');
  process.exit(2);
}

process.env.STORE_BACKEND = 'file';
process.env.SKIN_SCRIPT_RPA_ENABLED = 'true';
process.env.SKIN_SCRIPT_DRY_RUN = 'true';
resetCommerceBackendForTests();

const adapter = createRpaSkinScriptAdapter();
const orderId = `ord_e2e_stack_${Date.now()}`;

const result = await adapter.createDropshipOrder({
  order_id: orderId,
  idempotency_key: orderId,
  customer: { name: 'Test Client', email: 'test@example.com', phone: '555-0100' },
  shipping_address: {
    line1: '123 Main St',
    city: 'Portland',
    state: 'OR',
    postal_code: '97201',
    country: 'US',
  },
  lines: [{
    product_id: 'green-tea-citrus-cleanser',
    skin_script_sku: '1010240',
    supplier_product_url: 'https://skinscript.com/product/green-tea-citrus-cleanser/',
    supplier_product_name: 'Green Tea Citrus Cleanser',
    quantity: 1,
    unit_wholesale: 18.0,
    variant: '6.4 oz',
  }],
});

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'dry_run_ready') {
  process.exit(1);
}
