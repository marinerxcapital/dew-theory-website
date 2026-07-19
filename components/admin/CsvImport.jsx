'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CATEGORIES } from '@/lib/products';

const TARGET_FIELDS = [
  'name',
  'category',
  'size',
  'wholesale_price',
  'description',
  'ingredients',
  'sku'
];

function parseCsv(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };

  const split = (line) => {
    const cells = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cells.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const rows = lines.slice(1).map((line) => {
    const cells = split(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? '';
    });
    return obj;
  });
  return { headers, rows };
}

function guessMap(headers) {
  const map = {};
  const aliases = {
    name: ['name', 'product', 'product_name', 'title'],
    category: ['category', 'type', 'product_category'],
    size: ['size', 'volume', 'oz'],
    wholesale_price: ['wholesale_price', 'wholesale', 'cost', 'unit_cost', 'price_wholesale'],
    description: ['description', 'desc', 'description_short', 'short_description'],
    ingredients: ['ingredients', 'key_actives', 'actives'],
    sku: ['sku', 'skin_script_sku', 'product_sku', 'id']
  };
  for (const field of TARGET_FIELDS) {
    const hit = headers.find((h) => aliases[field].includes(h));
    if (hit) map[field] = hit;
  }
  return map;
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

export default function CsvImport() {
  const router = useRouter();
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function onFile(e) {
    setError('');
    setResult(null);
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
      buildPreview(r, guessed);
    };
    reader.readAsText(file);
  }

  function buildPreview(r, m) {
    const built = r.map((row, i) => {
      const wholesale = parseFloat(row[m.wholesale_price] || '0') || 0;
      const name = row[m.name] || `Product ${i + 1}`;
      return {
        id: slugify(row[m.sku] || name) || `import-${i}`,
        name,
        category: row[m.category] || 'Serum',
        size: row[m.size] || '',
        wholesale_price: wholesale,
        retail_price: wholesale * 2,
        description_short: row[m.description] || '',
        ingredients_raw: row[m.ingredients] || '',
        skin_script_sku: row[m.sku] || null,
        source: 'csv_import',
        stock_status: 'in_stock',
        active: true
      };
    });
    setPreview(built);
  }

  function updateMap(field, header) {
    const next = { ...map, [field]: header };
    setMap(next);
    buildPreview(rows, next);
  }

  function updateRetail(idx, value) {
    setPreview((list) =>
      list.map((p, i) => (i === idx ? { ...p, retail_price: parseFloat(value) || 0 } : p))
    );
  }

  async function commit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: preview })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
        setLoading(false);
        return;
      }
      setResult(data);
      setLoading(false);
      router.refresh();
    } catch {
      setError('Import failed');
      setLoading(false);
    }
  }

  const mapped = useMemo(() => Object.keys(map).filter((k) => map[k]).length, [map]);

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
          ingredients, sku. Retail = wholesale × 2, editable per row before confirm.
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

      {preview.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Review ({preview.length} rows)</h2>
          <div className="mt-4 overflow-x-auto">
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
                    <td className="py-3 pr-3">${p.wholesale_price.toFixed(2)}</td>
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
          <button
            type="button"
            onClick={commit}
            disabled={loading}
            className="mt-6 border border-graphite bg-graphite px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
          >
            {loading ? 'Importing…' : 'Confirm import'}
          </button>
        </div>
      )}

      {error && (
        <p className="font-body text-sm font-light text-charcoal/70" role="alert">
          {error}
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
