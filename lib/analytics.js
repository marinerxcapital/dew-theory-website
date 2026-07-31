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

/**
 * Last N calendar days summary (UTC day buckets) for admin weekly strip.
 * @param {Array} events
 * @param {number} [days=7]
 * @param {Date} [now]
 */
export function weeklyEventSummary(events, days = 7, now = new Date()) {
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const inWindow = (events || []).filter((e) => {
    const t = new Date(e.at || e.created_at).getTime();
    return !Number.isNaN(t) && t >= start.getTime() && t <= end.getTime();
  });

  const types = [
    'product_view',
    'add_to_cart',
    'checkout_started',
    'checkout_completed',
    'booking_started',
    'booking_confirmed',
    'membership_interest'
  ];

  const byType = {};
  for (const t of types) byType[t] = countEventsByType(inWindow, t);

  return {
    days,
    from: start.toISOString(),
    to: end.toISOString(),
    total_events: inWindow.length,
    byType
  };
}
