'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function formatWhen(iso) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CatalogSyncPanel({
  allowlist = [],
  allowlistEnabled = 0,
  lastSync = null,
  readiness = null,
  defaultSource = 'mock'
}) {
  const router = useRouter();
  const [source, setSource] = useState(defaultSource);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function run(dryRun) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/sync/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: dryRun, source })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.code || 'Sync failed');
        setResult(data);
        setLoading(false);
        return;
      }
      setResult(data);
      if (!dryRun) router.refresh();
    } catch (err) {
      setError(err?.message || 'Network error');
    }
    setLoading(false);
  }

  const latest = result?.last_sync || lastSync;
  const rows = result?.allowlist?.products || allowlist;
  const enabledCount = result?.allowlist?.enabled ?? allowlistEnabled;
  const ready = result?.readiness || readiness;

  return (
    <div className="space-y-8">
      <div className="glass-1 p-8">
        <h2 className="font-display text-xl font-normal text-graphite">Autonomy status</h2>
        <dl className="mt-4 grid gap-3 font-body text-sm font-light text-charcoal/80 sm:grid-cols-2">
          <div>
            <dt className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Last run</dt>
            <dd>{formatWhen(latest?.last_run_at)}</dd>
          </div>
          <div>
            <dt className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Last apply</dt>
            <dd>{formatWhen(latest?.last_apply_at)}</dd>
          </div>
          <div>
            <dt className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Last mode</dt>
            <dd>
              {latest?.last_source || '—'}
              {latest?.dry_run ? ' · dry-run' : latest?.last_apply_at ? ' · apply' : ''}
              {latest?.skipped ? ` · skipped (${latest.code || 'skipped'})` : ''}
            </dd>
          </div>
          <div>
            <dt className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Live source</dt>
            <dd>
              {ready?.live ? 'Ready' : 'Not live'} · {ready?.code || 'unknown'}
            </dd>
          </div>
        </dl>
        {ready?.reason && (
          <p className="mt-4 font-body text-sm font-light text-charcoal/70">{ready.reason}</p>
        )}
      </div>

      <div className="glass-1 p-8">
        <h2 className="font-display text-xl font-normal text-graphite">Allowlist</h2>
        <p className="mt-2 max-w-2xl font-body text-sm font-light text-charcoal/70">
          {enabledCount} of {rows.length} curated SKUs are sync-enabled. Adding a ninth SKU is a
          data change in <code className="text-xs">data/catalog-allowlist.json</code> — not a code
          rewrite. SKUs off this list are never published.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left font-body text-xs font-light text-charcoal/85">
            <thead>
              <tr className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                <th className="pb-2 pr-4">Dew product id</th>
                <th className="pb-2 pr-4">Skin Script SKU</th>
                <th className="pb-2">Sync</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.product_id} className="border-t border-chrome/15">
                  <td className="py-2 pr-4">{row.product_id}</td>
                  <td className="py-2 pr-4">{row.skin_script_sku}</td>
                  <td className="py-2">{row.sync_enabled ? 'enabled' : 'disabled'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-1 p-8">
        <h2 className="font-display text-xl font-normal text-graphite">Run sync</h2>
        <p className="mt-2 max-w-2xl font-body text-sm font-light text-charcoal/70">
          Dry-run first. Apply writes wholesale / retail / availability / SKU on allowlisted
          products only and revalidates the storefront. Production apply is refused unless the
          chosen source is configured — mock is never treated as live.
        </p>

        <label className="mt-6 block font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          Source adapter
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-2 block w-full max-w-xs border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
          >
            <option value="mock">mock (local/dev only)</option>
            <option value="csv_feed">csv_feed (SKIN_SCRIPT_FEED_URL)</option>
            <option value="rpa">rpa (wholesale portal via Fly service)</option>
            <option value="http">http (partner API — stub until confirmed)</option>
          </select>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => run(true)}
            className="border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
          >
            {loading ? 'Working…' : 'Dry-run'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(false)}
            className="border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
          >
            Apply sync
          </button>
        </div>

        {error && (
          <p className="mt-4 font-body text-sm font-light text-charcoal" role="alert">
            {error}
          </p>
        )}

        {result && (result.totals || result.create || result.skip || result.error) && (
          <div className="mt-8 space-y-4 border-t border-chrome/20 pt-6">
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              {result.dry_run ? 'Dry-run plan' : result.applied ? 'Applied' : 'Result'} ·{' '}
              {result.adapter || result.code || 'sync'}
            </p>
            <ul className="grid gap-2 font-body text-sm font-light text-charcoal/80 sm:grid-cols-2 lg:grid-cols-5">
              <li>Create: {result.totals?.create ?? 0}</li>
              <li>Update: {result.totals?.update ?? 0}</li>
              <li>Skip: {result.totals?.skip ?? 0}</li>
              <li>Error: {result.totals?.error ?? 0}</li>
              <li>Drafts: {result.totals?.drafts ?? 0}</li>
            </ul>

            {result.create?.length > 0 && (
              <div>
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                  Create
                </p>
                <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light">
                  {result.create.map((r) => (
                    <li key={r.id || r.sku}>
                      {r.name} · {r.sku}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.update?.length > 0 && (
              <div>
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                  Update
                </p>
                <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light">
                  {result.update.map((r) => (
                    <li key={r.id || r.sku}>
                      {r.name} · {r.sku}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.skip?.length > 0 && (
              <div>
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                  Skipped
                </p>
                <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light">
                  {result.skip.map((r, i) => (
                    <li key={`${r.sku || r.id || i}-${r.reason}`}>
                      {r.id || '—'} · {r.sku || '—'} · {r.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.error?.length > 0 && (
              <div>
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                  Failed
                </p>
                <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light text-charcoal/80">
                  {result.error.map((r, i) => (
                    <li key={i}>
                      {r.sku || r.id || '—'} · {r.reason} {r.error ? `· ${r.error}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
