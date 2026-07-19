'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CATEGORIES } from '@/lib/products';
import {
  TARGET_FIELDS,
  parseCsv,
  guessMap,
  buildImportPreview,
  planImport
} from '@/lib/csv-import';

export default function CsvImport() {
  const router = useRouter();
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [preview, setPreview] = useState([]);
  const [bad, setBad] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dryResult, setDryResult] = useState(null);

  function applyPreview(r, m) {
    const { products, bad: badRows } = buildImportPreview(r, m);
    setPreview(products);
    setBad(badRows);
  }

  function onFile(e) {
    setError('');
    setResult(null);
    setDryResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { headers: h, rows: r } = parseCsv(String(reader.result || ''));
      if (!h.length) {
        setError('Empty or invalid CSV');
        return;
      }
      setHeaders(h);
      setRows(r);
      const guessed = guessMap(h);
      setMap(guessed);
      applyPreview(r, guessed);
    };
    reader.readAsText(file);
  }

  function updateMap(field, header) {
    const next = { ...map, [field]: header || undefined };
    if (!header) delete next[field];
    setMap(next);
    applyPreview(rows, next);
  }

  function updateRetail(idx, value) {
    setPreview((list) =>
      list.map((p, i) => (i === idx ? { ...p, retail_price: parseFloat(value) || 0 } : p))
    );
  }

  async function runImport(dryRun) {
    if (!preview.length) {
      setError('No valid rows to import');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setDryResult(null);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: preview, dry_run: dryRun })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
        setLoading(false);
        return;
      }
      if (dryRun) {
        setDryResult(data);
      } else {
        setResult(data);
        router.refresh();
      }
      setLoading(false);
    } catch {
      setError(dryRun ? 'Dry-run failed' : 'Import failed');
      setLoading(false);
    }
  }

  const mapped = useMemo(() => Object.keys(map).filter((k) => map[k]).length, [map]);
  const localPlan = useMemo(() => planImport(preview, []), [preview]);

  return (
    <div className="space-y-10">
      <div className="glass-1 p-6">
        <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          Upload CSV
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="mt-3 block w-full font-body text-sm font-light"
        />
        <p className="mt-3 font-body text-xs font-light text-charcoal/55">
          Expected columns (flexible names): name, category, size, wholesale_price, description,
          ingredients, sku. Retail = wholesale × 2, editable per row. Sample file:{' '}
          <code className="text-charcoal/70">data/sample-import.csv</code>. Dry-run before commit.
        </p>
      </div>

      {headers.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Column mapping</h2>
          <p className="mt-1 font-body text-xs font-light text-charcoal/60">{mapped} fields mapped</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TARGET_FIELDS.map((field) => (
              <div key={field}>
                <label className="font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome">
                  {field}
                  {field === 'name' || field === 'wholesale_price' ? ' *' : ''}
                </label>
                <select
                  value={map[field] || ''}
                  onChange={(e) => updateMap(field, e.target.value)}
                  className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-2 py-2 font-body text-sm font-light"
                >
                  <option value="">— skip —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {bad.length > 0 && (
        <div className="glass-1 border border-chrome/30 p-5" role="status">
          <h2 className="font-display text-lg font-normal text-graphite">
            Bad rows ({bad.length}) — skipped
          </h2>
          <ul className="mt-3 space-y-1 font-body text-xs font-light text-charcoal/70">
            {bad.slice(0, 20).map((b) => (
              <li key={b.row}>
                Row {b.row}: {b.reason}
              </li>
            ))}
            {bad.length > 20 && <li>…and {bad.length - 20} more</li>}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">
            Review ({preview.length} valid · {bad.length} skipped)
          </h2>
          <div className="table-scroll mt-4">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-chrome/25 font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Wholesale</th>
                  <th className="py-2 pr-3">Retail</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={p.id + i} className="border-b border-chrome/15 font-body font-light">
                    <td className="py-3 pr-3">{p.name}</td>
                    <td className="py-3 pr-3">
                      {CATEGORIES.includes(p.category) ? p.category : p.category}
                    </td>
                    <td className="py-3 pr-3">${Number(p.wholesale_price).toFixed(2)}</td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        value={p.retail_price}
                        onChange={(e) => updateRetail(i, e.target.value)}
                        className="w-24 border border-chrome/30 px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => runImport(true)}
              disabled={loading}
              className="border border-graphite/30 px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
            >
              {loading ? '…' : 'Dry-run'}
            </button>
            <button
              type="button"
              onClick={() => runImport(false)}
              disabled={loading}
              className="border border-graphite bg-graphite px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
            >
              {loading ? 'Importing…' : 'Confirm import'}
            </button>
          </div>
          <p className="mt-3 font-body text-xs font-light text-charcoal/55">
            Local preview: {localPlan.total} rows ready (server dry-run reports create vs update).
          </p>
        </div>
      )}

      {error && (
        <p className="font-body text-sm font-light text-charcoal/70" role="alert">
          {error}
        </p>
      )}
      {dryResult && (
        <p className="font-body text-sm font-light text-charcoal/75" role="status">
          Dry-run: would create {dryResult.wouldCreate}, update {dryResult.wouldUpdate}
          {dryResult.bad?.length ? `, skip ${dryResult.bad.length} bad` : ''}. Nothing written.
        </p>
      )}
      {result && (
        <p className="font-body text-sm font-light text-charcoal/75">
          Imported {result.created} new, updated {result.updated} existing products.
        </p>
      )}
    </div>
  );
}
