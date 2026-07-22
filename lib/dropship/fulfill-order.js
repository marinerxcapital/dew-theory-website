/**
 * Automated dropship fulfillment for paid orders.
 * Idempotent by order id — never double-submit when supplier_order_id already set.
 */

import { logInfo, logWarn } from '../log.js';
import { audit, mutateStore, readStore } from '../store.js';
import { getSkinScriptAdapter } from '../suppliers/skin-script/index.js';
import { classifyFulfillmentError } from '../ai/map-catalog-rows.js';

/**
 * Resolve skin_script_sku for a line item from product catalog.
 * @param {object} line
 * @param {object[]} products
 */
export function resolveLineSku(line, products) {
  if (line.skin_script_sku) return String(line.skin_script_sku);
  const p = (products || []).find((x) => x.id === line.product_id);
  if (p?.skin_script_sku) return String(p.skin_script_sku);
  // Stable derived SKU matches mock adapter convention when catalog not yet synced
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

/**
 * @param {string} orderId
 * @param {{ adminId?: string|null, adapterMode?: string, force?: boolean }} [opts]
 * @returns {Promise<{ ok: boolean, order?: object, error?: string, code?: string, idempotent?: boolean }>}
 */
export async function fulfillOrder(orderId, opts = {}) {
  const id = String(orderId || '');
  if (!id) {
    return { ok: false, error: 'order id required', code: 'order_id_required' };
  }

  const store = readStore();
  const order = (store.orders || []).find((o) => o.id === id);
  if (!order) {
    return { ok: false, error: 'Order not found', code: 'order_not_found' };
  }

  // Idempotent success
  if (order.supplier_order_id && !opts.force) {
    return {
      ok: true,
      order,
      idempotent: true,
      code: 'already_submitted'
    };
  }

  if (order.status === 'cancelled' || order.status === 'payment_failed') {
    return {
      ok: false,
      error: `Cannot fulfill order in status ${order.status}`,
      code: 'order_not_fulfillable'
    };
  }

  if (
    order.status !== 'paid' &&
    order.status !== 'queued_for_supplier' &&
    order.status !== 'failed_supplier' &&
    !opts.force
  ) {
    // Allow retry from failed_supplier; paid is normal path
    if (order.status === 'submitted_to_skin_script' && order.supplier_order_id) {
      return { ok: true, order, idempotent: true, code: 'already_submitted' };
    }
    if (order.status !== 'paid' && order.status !== 'queued_for_supplier') {
      return {
        ok: false,
        error: `Order status must be paid (or failed_supplier retry); got ${order.status}`,
        code: 'order_not_paid'
      };
    }
  }

  const products = store.products || [];
  const lines = [];
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
    const updated = markFulfillmentFailure(id, msg, 'sku_missing', opts.adminId);
    return { ok: false, error: msg, code: 'sku_missing', order: updated };
  }

  if (!lines.length) {
    const msg = 'Order has no line items';
    const updated = markFulfillmentFailure(id, msg, 'empty_lines', opts.adminId);
    return { ok: false, error: msg, code: 'empty_lines', order: updated };
  }

  // Queue flag before supplier call
  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === id);
    if (idx < 0) return s;
    s.orders[idx] = {
      ...s.orders[idx],
      status: 'queued_for_supplier',
      fulfillment_error: null,
      updated_at: new Date().toISOString()
    };
    return s;
  });

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

    let after;
    mutateStore((s) => {
      const idx = s.orders.findIndex((o) => o.id === id);
      if (idx < 0) return s;
      const now = new Date().toISOString();
      after = {
        ...s.orders[idx],
        status: 'submitted_to_skin_script',
        supplier_order_id: result.external_id,
        supplier_status: result.status,
        supplier_raw: sanitizeSupplierRaw(result.raw),
        submitted_to_skin_script_at: s.orders[idx].submitted_to_skin_script_at || now,
        fulfillment_error: null,
        fulfillment_error_code: null,
        updated_at: now
      };
      s.orders[idx] = after;
      return s;
    });

    if (opts.adminId) {
      audit(opts.adminId, 'order.auto_fulfill', 'Orders', id, {
        supplier_order_id: result.external_id,
        adapter: adapter.name
      });
    }

    logInfo('dropship.fulfilled', {
      order_id: id,
      supplier_order_id: result.external_id
    });

    return { ok: true, order: after, code: 'submitted' };
  } catch (err) {
    const message = err?.message || 'Supplier fulfill failed';
    const code = err?.code || 'supplier_error';

    let classification = null;
    try {
      classification = await classifyFulfillmentError(message);
    } catch {
      /* optional AI */
    }

    const updated = markFulfillmentFailure(
      id,
      message,
      code,
      opts.adminId,
      classification
    );

    logWarn('dropship.failed', {
      order_id: id,
      code,
      error: message
    });

    return {
      ok: false,
      error: message,
      code,
      order: updated,
      classification
    };
  }
}

function markFulfillmentFailure(orderId, message, code, adminId, classification) {
  let after;
  mutateStore((s) => {
    const idx = s.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return s;
    after = {
      ...s.orders[idx],
      status: 'failed_supplier',
      fulfillment_error: String(message).slice(0, 2000),
      fulfillment_error_code: code,
      fulfillment_classification: classification || null,
      updated_at: new Date().toISOString()
    };
    s.orders[idx] = after;
    return s;
  });
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
  return true; // default on for mock path convenience
}

export async function maybeAutoFulfill(orderId) {
  if (!shouldAutoFulfill()) {
    return { ok: false, skipped: true, code: 'auto_fulfill_disabled' };
  }
  return fulfillOrder(orderId);
}
