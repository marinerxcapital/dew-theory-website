/**
 * Small fixed-window throttle for auth endpoints.
 *
 * Same shape as the existing admin-login throttle: a module-level Map. On
 * Cloudflare Workers that means the counter is per-isolate rather than global,
 * so it raises the cost of credential stuffing without pretending to be a
 * distributed rate limiter. A durable limiter belongs in D1 or Cloudflare's
 * Rate Limiting rules; this is defence in depth, not the only control.
 */
const WINDOWS = new Map();

function keyFor(request, scope) {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  return `${scope}:${ip}`;
}

/**
 * @returns {{ ok: true } | { ok: false, retryAfterSeconds: number }}
 */
export function checkThrottle(request, scope, limit, windowMs) {
  const key = keyFor(request, scope);
  const now = Date.now();
  const existing = WINDOWS.get(key);

  if (!existing || now >= existing.resetAt) {
    WINDOWS.set(key, { count: 1, resetAt: now + windowMs });
    if (WINDOWS.size > 5000) {
      for (const [k, v] of WINDOWS) {
        if (now >= v.resetAt) WINDOWS.delete(k);
      }
    }
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    };
  }

  existing.count += 1;
  return { ok: true };
}

/** Test helper. */
export function resetThrottleForTests() {
  WINDOWS.clear();
}
