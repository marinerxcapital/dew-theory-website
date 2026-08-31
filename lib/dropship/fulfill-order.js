/**
 * Automated dropship fulfillment for paid orders.
 * Idempotent by order id — never double-submit when supplier_order_id already set.
 * Production RPA mode requires verified supplier mappings (never derived SKUs).
 */

import { logInfo, logWarn } from '../log.js';
import { audit, mutateStore, readStore } from '../store.js';
import { getSkinScriptAdapter } from '../suppliers/skin-script/index.js';
import { classifyFulfillmentError } from '../ai/map-catalog-rows.js';
import { validateVerifiedMappingsForLines } from '../suppliers/skin-script/mapping.js';
import {
  commerceGetOrder,
  commerceUpsertOrder,
  commerceGetFulfillmentJobByOrder
} from '../commerce/index.js';
import {
  ensureFulfillmentJobForPaidOrder,
  completeFulfillmentFailure,
  completeFulfillmentSuccess
} from '../fulfillment/jobs.js';
import { blockedStatusForError } from '../fulfillment/state-machine.js';

/**
 * Resolve skin_script_sku for a line item from product catalog.
 * Mock/http modes only — RPA production uses verified mappings.
 * @param {object} line
 * @param {object[]} products
 */
export function resolveLineSku(line, products) {
  if (line.skin_script_sku) return String(line.skin_script_sku);
  const p = (products || []).find((x) => x.id === line.product_id);
  if (p?.skin_script_sku) return String(p.skin_script_sku);
  if (p?.id) {
    return `SS-${String(p.id).toUpperCase().replace(/-/g, '_')}`;
  }
  if (line.product_id) {
    return `SS-${String(line.product_id).toUpperCase().replace(/-/g, '_')}`;
  }
  return null;
}

/**
 * Sanitize supplier raw payload for storage (no secrets).
 */
export function sanitizeSupplierRaw(raw) {
  if (!raw || typeof raw !== 'object') return raw || null;
  const { authorization, api_key, password, ...rest } = raw;
  return rest;
}

async function loadOrder(orderId) {
  const durable = await commerceGetOrder(orderId);
  if (durable) return durable;
  const store = readStore();
  return (store.orders || []).find((o) => o.id === orderId) || null;
}

function syncOrderToLegacyStore(order) {
  if (!order?.id) return;
  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      s.orders[idx] = { ...s.orders[idx], ...order };
    } else {
      s.orders.unshift(order);
    }
    return s;
  });
}

/**
 * @param {string} orderId
 * @param {{ adminId?: string|null, adapterMode?: string, force?: boolean }} [opts]
 */
export async function fulfillOrder(orderId, opts = {}) {
  const id = String(orderId || '');
  if (!id) {
    return { ok: false, error: 'order id required', code: 'order_id_required' };
  }

  const order = await loadOrder(id);
  if (!order) {
    return { ok: false, error: 'Order not found', code: 'order_not_found' };
  }

  const mode = String(opts.adapterMode || process.env.SKIN_SCRIPT_MODE || 'mock').toLowerCase();
  const isRpaProduction = mode === 'rpa';

  if (order.supplier_order_id && !opts.force) {
    return { ok: true, order, idempotent: true, code: 'already_submitted' };
  }

  const existingJob = await commerceGetFulfillmentJobByOrder(id);
  if (existingJob?.supplier_order_id && !opts.force) {
    return { ok: true, order, idempotent: true, code: 'already_submitted' };
  }

  if (order.status === 'cancelled' || order.status === 'payment_failed') {
    return {
      ok: false,
      error: `Cannot fulfill order in status ${order.status}`,
      code: 'order_not_fulfillable'
    };
  }

  const fulfillableStatuses = new Set([
    'paid',
    'queued_for_supplier',
    'failed_supplier',
    'processing_supplier'
  ]);
  if (!fulfillableStatuses.has(order.status) && !opts.force) {
    if (order.status === 'submitted_to_skin_script' && order.supplier_order_id) {
      return { ok: true, order, idempotent: true, code: 'already_submitted' };
    }
    return {
      ok: false,
      error: `Order status must be paid (or failed_supplier retry); got ${order.status}`,
      code: 'order_not_paid'
    };
  }

  await ensureFulfillmentJobForPaidOrder(order);

  const store = readStore();
  const products = store.products || [];
  let lines = [];
  let mappingError = null;

  if (isRpaProduction) {
    const mappingResult = await validateVerifiedMappingsForLines(order.items || [], {
      requireVerified: true
    });
    if (!mappingResult.ok) {
      mappingError = mappingResult;
      const msg =
        mappingResult.unverified?.length
          ? `Unverified supplier mappings: ${mappingResult.unverified.map((u) => u.product_id).join(', ')}`
          : `Missing supplier mappings: ${mappingResult.missing.map((m) => m.product_id).join(', ')}`;
      const updated = await markFulfillmentFailureAsync(
        id,
        msg,
        'blocked_supplier_mapping',
        opts.adminId,
        existingJob?.id
      );
      return { ok: false, error: msg, code: 'blocked_supplier_mapping', order: updated };
    }
    lines = mappingResult.lines.map((l) => ({
      skin_script_sku: l.skin_script_sku,
      product_id: l.product_id,
      name: l.name,
      quantity: l.quantity,
      variant: l.variant || null,
      unit_wholesale: l.expected_wholesale_price,
      supplier_product_url: l.supplier_product_url
    }));
  } else {
    const missing = [];
    for (const item of order.items || []) {
      const sku = resolveLineSku(item, products);
      if (!sku) {
        missing.push(item.product_id || item.name || 'unknown');
        continue;
      }
      const p = products.find((x) => x.id === item.product_id);
      lines.push({
        skin_script_sku: sku,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        variant: item.variant || null,
        unit_wholesale: p?.wholesale_price
      });
    }
    if (missing.length) {
      const msg = `Missing skin_script_sku for: ${missing.join(', ')}`;
      const updated = await markFulfillmentFailureAsync(id, msg, 'sku_missing', opts.adminId, existingJob?.id, null, opts);
      return { ok: false, error: msg, code: 'sku_missing', order: updated };
    }
  }

  if (!lines.length) {
    const msg = 'Order has no line items';
    const updated = await markFulfillmentFailureAsync(id, msg, 'empty_lines', opts.adminId, existingJob?.id);
    return { ok: false, error: msg, code: 'empty_lines', order: updated };
  }

  const queued = {
    ...order,
    status: 'queued_for_supplier',
    fulfillment_error: null,
    updated_at: new Date().toISOString()
  };
  await commerceUpsertOrder(queued);
  syncOrderToLegacyStore(queued);

  const adapter = getSkinScriptAdapter(opts.adapterMode);

  try {
    const result = await adapter.createDropshipOrder({
      order_id: id,
      idempotency_key: id,
      customer: {
        name: order.customer?.name || '',
        email: order.customer?.email || '',
        phone: order.customer?.phone || ''
      },
      shipping_address: order.shipping_address || {},
      lines
    });

    const now = new Date().toISOString();
    const after = {
      ...queued,
      status: result.status === 'dry_run_ready' ? 'queued_for_supplier' : 'submitted_to_skin_script',
      supplier_order_id: result.external_id,
      supplier_status: result.status,
      supplier_raw: sanitizeSupplierRaw(result.raw),
      submitted_to_skin_script_at: queued.submitted_to_skin_script_at || now,
      fulfillment_error: null,
      fulfillment_error_code: null,
      updated_at: now
    };

    await commerceUpsertOrder(after);
    syncOrderToLegacyStore(after);

    if (existingJob?.id && result.status !== 'dry_run_ready') {
      await completeFulfillmentSuccess({
        job_id: existingJob.id,
        order_id: id,
        supplier_order_id: result.external_id,
        supplier_status: result.status,
        raw: sanitizeSupplierRaw(result.raw)
      });
    }

    if (opts.adminId) {
      audit(opts.adminId, 'order.auto_fulfill', 'Orders', id, {
        supplier_order_id: result.external_id,
        adapter: adapter.name
      });
    }

    logInfo('dropship.fulfilled', {
      order_id: id,
      supplier_order_id: result.external_id,
      adapter: adapter.name
    });

    return {
      ok: true,
      order: after,
      code: result.status === 'dry_run_ready' ? 'dry_run_ready' : 'submitted'
    };
  } catch (err) {
    const message = err?.message || 'Supplier fulfill failed';
    const code = err?.code || 'supplier_error';

    let classification = null;
    try {
      classification = await classifyFulfillmentError(message);
    } catch {
      /* optional AI */
    }

    const updated = await markFulfillmentFailureAsync(
      id,
      message,
      code,
      opts.adminId,
      existingJob?.id,
      classification
    );

    logWarn('dropship.failed', { order_id: id, code, error: message });

    return { ok: false, error: message, code, order: updated, classification };
  }
}

async function markFulfillmentFailureAsync(orderId, message, code, adminId, jobId, classification, opts = {}) {
  const mode = String(opts.adapterMode || process.env.SKIN_SCRIPT_MODE || 'mock').toLowerCase();
  const blocked = mode === 'rpa' ? blockedStatusForError(code) : null;
  const status = blocked || 'failed_supplier';
  let after;

  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return s;
    after = {
      ...s.orders[idx],
      status,
      fulfillment_error: String(message).slice(0, 2000),
      fulfillment_error_code: code,
      fulfillment_classification: classification || null,
      updated_at: new Date().toISOString()
    };
    s.orders[idx] = after;
    return s;
  });

  if (after) await commerceUpsertOrder(after);

  if (jobId) {
    await completeFulfillmentFailure({
      job_id: jobId,
      order_id: orderId,
      error_code: code,
      error_message: message,
      stage: 'supplier_submit'
    });
  }

  if (adminId) {
    audit(adminId, 'order.auto_fulfill_failed', 'Orders', orderId, {
      code,
      error: message,
      classification
    });
  }
  return after;
}

/**
 * Fire-and-forget style for checkout/webhook — respects AUTO_FULFILL.
 * Default true for mock automation unless AUTO_FULFILL=false.
 */
export function shouldAutoFulfill() {
  const v = process.env.AUTO_FULFILL;
  if (v === '0' || v === 'false' || v === 'FALSE') return false;
  if (process.env.SKIN_SCRIPT_MODE === 'rpa' && process.env.SKIN_SCRIPT_RPA_ENABLED !== 'true') {
    return false;
  }
  return true;
}

export async function maybeAutoFulfill(orderId) {
  if (!shouldAutoFulfill()) {
    return { ok: false, skipped: true, code: 'auto_fulfill_disabled' };
  }
  return fulfillOrder(orderId);
}
