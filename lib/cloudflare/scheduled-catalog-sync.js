/**
 * Cloudflare Worker scheduled handler — POST /api/cron/catalog-sync.
 * Does not apply catalog itself; the route enforces CRON_SECRET + fail-closed readiness.
 */

function cronLog(payload) {
  console.log(JSON.stringify({ event: 'catalog_sync_cron', ...payload }));
}

/**
 * @param {object} [controller]
 * @param {Record<string, string>} env
 */
export async function handleCatalogSyncScheduled(controller, env = {}) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    cronLog({ skipped: true, code: 'cron_unconfigured' });
    return { skipped: true, code: 'cron_unconfigured' };
  }

  const site = String(env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(/\/$/, '');
  const headers = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json'
  };

  let res;
  try {
    if (env.WORKER_SELF_REFERENCE && typeof env.WORKER_SELF_REFERENCE.fetch === 'function') {
      res = await env.WORKER_SELF_REFERENCE.fetch(`${site}/api/cron/catalog-sync`, {
        method: 'POST',
        headers
      });
    } else {
      res = await fetch(`${site}/api/cron/catalog-sync`, {
        method: 'POST',
        headers
      });
    }
  } catch (err) {
    cronLog({ ok: false, code: 'cron_fetch_failed', error: err?.message || 'fetch failed' });
    return { ok: false, code: 'cron_fetch_failed' };
  }

  const body = await res.json().catch(() => ({}));
  cronLog({
    status: res.status,
    skipped: Boolean(body.skipped),
    code: body.code,
    totals: body.totals || null
  });
  return body;
}
