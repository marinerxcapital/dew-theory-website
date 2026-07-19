'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/products';
import { defaultRetailFromWholesale } from '@/lib/product-admin';

const STOCK = ['in_stock', 'out_of_stock', 'discontinued'];

export default function ProductForm({ product = null }) {
  const router = useRouter();
  const isNew = !product;
  const [form, setForm] = useState({
    id: product?.id || '',
    name: product?.name || '',
    category: product?.category || CATEGORIES[0],
    size: product?.size || '',
    wholesale_price: product?.wholesale_price ?? '',
    retail_price: product?.retail_price ?? '',
    description_short: product?.description_short || '',
    how_to_use: product?.how_to_use || '',
    stock_status: product?.stock_status || 'in_stock',
    skin_script_sku: product?.skin_script_sku || '',
    active: product?.active !== false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'wholesale_price') {
        const retail = defaultRetailFromWholesale(value);
        if (retail != null) next.retail_price = retail.toFixed(2);
      }
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${product.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          wholesale_price: parseFloat(form.wholesale_price),
          retail_price: parseFloat(form.retail_price),
          active: Boolean(form.active)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Save failed');
        setLoading(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Save failed');
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!product) return;
    const ok = window.confirm(
      `Delete "${product.name}" permanently?\n\nOK = hard delete\nCancel = keep product\n\nTip: uncheck Active or set stock to discontinued to hide from shop without deleting.`
    );
    if (!ok) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/products');
      router.refresh();
    } else {
      setError('Delete failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {isNew && (
        <div>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            ID (slug)
          </label>
          <input
            required
            value={form.id}
            onChange={(e) =>
              setField(
                'id',
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
              )
            }
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          />
        </div>
      )}
      {[
        ['name', 'Name', 'text'],
        ['size', 'Size', 'text'],
        ['description_short', 'Short description', 'text'],
        ['how_to_use', 'How to use', 'text'],
        ['skin_script_sku', 'Skin Script SKU (optional)', 'text']
      ].map(([key, label]) => (
        <div key={key}>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            {label}
          </label>
          <input
            required={key === 'name'}
            value={form[key]}
            onChange={(e) => setField(key, e.target.value)}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          />
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Wholesale ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.wholesale_price}
            onChange={(e) => setField('wholesale_price', e.target.value)}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          />
        </div>
        <div>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Retail ($) — auto ×2, editable
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.retail_price}
            onChange={(e) => setField('retail_price', e.target.value)}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Stock
          </label>
          <select
            value={form.stock_status}
            onChange={(e) => setField('stock_status', e.target.value)}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          >
            {STOCK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3 font-body text-sm font-light text-charcoal">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setField('active', e.target.checked)}
          className="size-4 accent-graphite"
        />
        Active on shop (uncheck to hide without deleting)
      </label>

      {error && (
        <p className="font-body text-xs font-light text-charcoal/70" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="border border-graphite bg-graphite px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="border border-chrome/40 px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
