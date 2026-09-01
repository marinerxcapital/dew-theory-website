/** Shared operational status levels for admin command center. */

export const STATUS = {
  HEALTHY: 'healthy',
  ATTENTION: 'attention',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
  DISABLED: 'disabled',
  NOT_CONFIGURED: 'not_configured',
  UNKNOWN: 'unknown'
};

export const STATUS_LABEL = {
  healthy: 'Healthy',
  attention: 'Attention',
  degraded: 'Degraded',
  critical: 'Critical',
  disabled: 'Disabled',
  not_configured: 'Not configured',
  unknown: 'Unknown'
};

/** Worst status wins when aggregating domains. */
export function worstStatus(...statuses) {
  const rank = {
    critical: 5,
    degraded: 4,
    attention: 3,
    unknown: 2,
    not_configured: 1,
    disabled: 1,
    healthy: 0
  };
  let best = STATUS.HEALTHY;
  let max = 0;
  for (const s of statuses) {
    const key = String(s || STATUS.UNKNOWN).toLowerCase();
    const r = rank[key] ?? 2;
    if (r > max) {
      max = r;
      best = key;
    }
  }
  return best;
}
