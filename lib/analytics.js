/**
 * Analytics helpers (G6) — date filtering over store events/orders.
 */

/**
 * @param {string|null|undefined} fromYmd  YYYY-MM-DD
 * @param {string|null|undefined} toYmd
 * @returns {{ from: Date|null, to: Date|null }}
 */
export function parseDateRange(fromYmd, toYmd) {
  let from = null;
  let to = null;
  if (fromYmd) {
    const d = new Date(fromYmd + 'T00:00:00.000Z');
    if (!Number.isNaN(d.getTime())) from = d;
  }
  if (toYmd) {
    const d = new Date(toYmd + 'T23:59:59.999Z');
    if (!Number.isNaN(d.getTime())) to = d;
  }
  return { from, to };
}

export function inRange(iso, from, to) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (from && t < from.getTime()) return false;
  if (to && t > to.getTime()) return false;
  return true;
}

export function filterByCreatedAt(items, from, to, field = 'created_at') {
  if (!from && !to) return items || [];
  return (items || []).filter((item) => inRange(item?.[field] || item?.at, from, to));
}

export function countEventsByType(events, type) {
  return (events || []).filter((e) => e.type === type).length;
}
