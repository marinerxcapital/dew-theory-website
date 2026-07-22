'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogSyncPanel() {
  const router = useRouter();
  const [source, setSource] = useState('mock');
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
        setError(data.error || 'Sync failed');
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

  return (
    <div className="glass-1 p-8">
      <h2 className="font-display text-xl font-normal text-graphite">Run sync</h2>
      <p className="mt-2 max-w-2xl font-body text-sm font-light text-charcoal/70">
        Dry-run first. Apply writes products with <code className="text-xs">source=sync</code> and
        revalidates the storefront. HTTP/csv_feed need env credentials or feed URL.
      </p>

      <label className="mt-6 block font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
        Source adapter
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="mt-2 block w-full max-w-xs border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        >
          <option value="mock">mock (offline sample catalog)</option>
          <option value="csv_feed">csv_feed (SKIN_SCRIPT_FEED_URL)</option>
          <option value="http">http (partner API — stub until configured)</option>
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

      {result && (
        <div className="mt-8 space-y-4 border-t border-chrome/20 pt-6">
          <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            {result.dry_run ? 'Dry-run plan' : 'Applied'} · {result.adapter}
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
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Create</p>
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
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Update</p>
              <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light">
                {result.update.map((r) => (
                  <li key={r.id || r.sku}>
                    {r.name} · {r.sku}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.error?.length > 0 && (
            <div>
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">Errors</p>
              <ul className="mt-2 max-h-40 overflow-auto font-body text-xs font-light text-charcoal/80">
                {result.error.map((r, i) => (
                  <li key={i}>
                    {r.sku || '—'} · {r.reason} {r.error ? `· ${r.error}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
