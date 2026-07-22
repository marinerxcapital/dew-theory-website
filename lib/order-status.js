/**
 * Order fulfillment statuses.
 * submitted_to_skin_script = wholesale PO placed (manual or auto dropship).
 * queued_for_supplier / failed_supplier support automated dropship pipeline.
 */

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'queued_for_supplier',
  'submitted_to_skin_script',
  'failed_supplier',
  'fulfilled',
  'cancelled',
  'payment_failed'
];

/** Statuses useful as admin list filters */
export const ORDER_FILTER_STATUSES = [
  'all',
  'paid',
  'queued_for_supplier',
  'submitted_to_skin_script',
  'failed_supplier',
  'fulfilled',
  'pending_payment',
  'cancelled',
  'payment_failed'
];

/**
 * @param {string} next
 * @returns {{ ok: true, status: string } | { ok: false, status: number, error: string, code: string }}
 */
export function validateOrderStatus(next) {
  const s = String(next || '').trim();
  if (!s) {
    return { ok: false, status: 400, error: 'Status is required', code: 'status_required' };
  }
  if (!ORDER_STATUSES.includes(s)) {
    return { ok: false, status: 400, error: `Unknown status "${s}"`, code: 'status_unknown' };
  }
  return { ok: true, status: s };
}

export function filterOrdersByStatus(orders, statusFilter) {
  const list = orders || [];
  if (!statusFilter || statusFilter === 'all') return list;
  return list.filter((o) => o && o.status === statusFilter);
}
