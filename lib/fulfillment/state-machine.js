/**
 * Canonical fulfillment / order state machine.
 * Preserves existing Dew Theory names where practical.
 */

export const FULFILLMENT_STATES = [
  'pending_payment',
  'paid',
  'queued_for_supplier',
  'processing_supplier',
  'blocked_supplier_mapping',
  'blocked_out_of_stock',
  'blocked_price_drift',
  'blocked_address_validation',
  'blocked_human_verification',
  'blocked_payment_authentication',
  'blocked_supplier_policy',
  'submission_ambiguous',
  'failed_supplier',
  'submitted_to_skin_script',
  'supplier_processing',
  'supplier_shipped',
  'supplier_cancelled',
  'fulfilled',
  'cancelled',
  'payment_failed'
];

/** Terminal blocked states — no auto-retry without human action */
export const BLOCKED_STATES = new Set([
  'blocked_supplier_mapping',
  'blocked_out_of_stock',
  'blocked_price_drift',
  'blocked_address_validation',
  'blocked_human_verification',
  'blocked_payment_authentication',
  'blocked_supplier_policy',
  'submission_ambiguous'
]);

/** Transient failures eligible for auto-retry */
export const RETRYABLE_ERROR_CODES = new Set([
  'navigation_timeout',
  'network_error',
  'supplier_5xx',
  'browser_crash',
  'transient_supplier_error',
  'session_expired_relogin_ok'
]);

/** Non-retryable error codes */
export const NON_RETRYABLE_ERROR_CODES = new Set([
  'sku_missing',
  'sku_unknown',
  'blocked_out_of_stock',
  'blocked_price_drift',
  'blocked_address_validation',
  'blocked_human_verification',
  'blocked_payment_authentication',
  'blocked_supplier_mapping',
  'account_mismatch',
  'order_cap_exceeded',
  'quantity_cap_exceeded',
  'supplier_layout_changed'
]);

const ALLOWED_TRANSITIONS = {
  pending_payment: ['paid', 'payment_failed', 'cancelled'],
  paid: ['queued_for_supplier', 'cancelled'],
  queued_for_supplier: [
    'processing_supplier',
    'failed_supplier',
    'blocked_supplier_mapping',
    'blocked_out_of_stock',
    'blocked_price_drift',
    'blocked_address_validation',
    'blocked_human_verification',
    'blocked_payment_authentication',
    'blocked_supplier_policy',
    'cancelled'
  ],
  processing_supplier: [
    'submitted_to_skin_script',
    'failed_supplier',
    'submission_ambiguous',
    'blocked_out_of_stock',
    'blocked_price_drift',
    'blocked_address_validation',
    'blocked_human_verification',
    'blocked_payment_authentication',
    'blocked_supplier_policy',
    'supplier_layout_changed'
  ],
  failed_supplier: ['queued_for_supplier', 'processing_supplier', 'cancelled'],
  submission_ambiguous: ['submitted_to_skin_script', 'processing_supplier', 'failed_supplier'],
  submitted_to_skin_script: ['supplier_processing', 'supplier_shipped', 'fulfilled', 'supplier_cancelled'],
  supplier_processing: ['supplier_shipped', 'fulfilled', 'supplier_cancelled'],
  supplier_shipped: ['fulfilled'],
  blocked_supplier_mapping: ['queued_for_supplier', 'cancelled'],
  blocked_out_of_stock: ['queued_for_supplier', 'cancelled'],
  blocked_price_drift: ['queued_for_supplier', 'cancelled'],
  blocked_address_validation: ['queued_for_supplier', 'cancelled'],
  blocked_human_verification: ['queued_for_supplier', 'cancelled'],
  blocked_payment_authentication: ['queued_for_supplier', 'cancelled'],
  blocked_supplier_policy: ['queued_for_supplier', 'cancelled']
};

/**
 * @param {string} from
 * @param {string} to
 */
export function canTransition(from, to) {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) return from === to;
  return allowed.includes(to) || from === to;
}

/**
 * @param {string} from
 * @param {string} to
 */
export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const err = new Error(`Invalid fulfillment transition ${from} → ${to}`);
    err.code = 'invalid_state_transition';
    throw err;
  }
}

/**
 * @param {string} errorCode
 */
export function isRetryableError(errorCode) {
  if (NON_RETRYABLE_ERROR_CODES.has(errorCode)) return false;
  if (RETRYABLE_ERROR_CODES.has(errorCode)) return true;
  return false;
}

/**
 * Map supplier/RPA error code to blocked order status when appropriate.
 * @param {string} errorCode
 */
export function blockedStatusForError(errorCode) {
  const map = {
    blocked_supplier_mapping: 'blocked_supplier_mapping',
    sku_missing: 'blocked_supplier_mapping',
    sku_unknown: 'blocked_supplier_mapping',
    blocked_out_of_stock: 'blocked_out_of_stock',
    blocked_price_drift: 'blocked_price_drift',
    blocked_address_validation: 'blocked_address_validation',
    blocked_human_verification: 'blocked_human_verification',
    captcha_detected: 'blocked_human_verification',
    mfa_required: 'blocked_human_verification',
    blocked_payment_authentication: 'blocked_payment_authentication',
    payment_challenge: 'blocked_payment_authentication',
    blocked_supplier_policy: 'blocked_supplier_policy',
    submission_ambiguous: 'submission_ambiguous',
    supplier_layout_changed: 'failed_supplier'
  };
  return map[errorCode] || null;
}
