/**
 * Cron auth + fail-closed apply for catalog sync.
 */

import { timingSafeEqual } from 'crypto';
import { evaluateCatalogSyncReadiness } from './catalog-sync-readiness.js';
import { recordCatalogSyncMeta, runCatalogSync } from './catalog-sync.js';

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * @param {{ get: (name: string) => string | null }} headers
 * @param {NodeJS.ProcessEnv} [env]
 */
export function authorizeCronRequest(headers, env = process.env) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return { ok: false, status: 503, code: 'cron_unconfigured', error: 'CRON_SECRET not configured' };
  }

  const auth = headers?.get?.('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const headerSecret = headers?.get?.('x-cron-secret') || '';
  if (!safeEqual(bearer, secret) && !safeEqual(headerSecret, secret)) {
    return { ok: false, status: 401, code: 'cron_unauthorized', error: 'Unauthorized' };
  }
  return { ok: true };
}

/**
 * Production apply only when a live source + secrets are ready.
 * Otherwise skip (do not silently apply mock as live).
 * @param {{ env?: NodeJS.ProcessEnv, record?: boolean }} [opts]
 */
export async function runCatalogSyncCron(opts = {}) {
  const env = opts.env || process.env;
  const readiness = evaluateCatalogSyncReadiness(env);

  if (!readiness.applyAllowed) {
    const summary = {
      ok: true,
      skipped: true,
      code: readiness.code,
      reason: readiness.reason,
      source: readiness.mode,
      live: readiness.live,
      dry_run: true,
      totals: { drafts: 0, create: 0, update: 0, skip: 0, error: 0 }
    };
    if (opts.record !== false) {
      recordCatalogSyncMeta({
        dry_run: true,
        skipped: true,
        code: readiness.code,
        last_source: readiness.mode,
        last_adapter: null,
        last_totals: summary.totals,
        last_reason: readiness.reason
      });
    }
    return summary;
  }

  const result = await runCatalogSync({
    dry_run: false,
    source: readiness.mode,
    adminId: 'cron',
    revalidate: true,
    record: opts.record !== false
  });

  return {
    ok: true,
    skipped: false,
    code: 'applied',
    source: readiness.mode,
    live: readiness.live,
    totals: result.totals,
    touchedIds: result.touchedIds || [],
    adapter: result.adapter,
    allowlist: result.allowlist
  };
}
