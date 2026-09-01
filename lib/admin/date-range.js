/**
 * Parse admin dashboard date range from search params.
 * @param {{ range?: string, from?: string, to?: string }} params
 */
export function parseAdminRange(params = {}) {
  const now = new Date();
  const range = params.range || '30d';
  let from = params.from ? new Date(params.from) : null;
  let to = params.to ? new Date(params.to) : null;

  if (!from && !to) {
    to = now;
    from = new Date(now);
    if (range === 'today') {
      from.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      from.setDate(from.getDate() - 7);
    } else if (range === '30d') {
      from.setDate(from.getDate() - 30);
    } else if (range === '90d') {
      from.setDate(from.getDate() - 90);
    } else if (range === 'all') {
      from = new Date(0);
    } else {
      from.setDate(from.getDate() - 30);
    }
  }

  if (!to) to = now;
  if (!from) from = new Date(now.getTime() - 30 * 86400000);

  return {
    range,
    from,
    to,
    fromIso: from.toISOString(),
    toIso: to.toISOString()
  };
}

export function inRange(iso, from, to) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}
