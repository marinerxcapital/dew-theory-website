/**
 * Commerce table names and JSON serialization helpers for durable persistence.
 */

export const COMMERCE_TABLES = [
  'orders',
  'fulfillment_jobs',
  'fulfillment_attempts',
  'webhook_events',
  'supplier_mappings',
  'supplier_order_events',
  'audit_log',
  'hmac_nonces'
];

export function toJson(value) {
  return JSON.stringify(value ?? null);
}

export function fromJson(raw, fallback = null) {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
