'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DiscountManager({ initial }) {
  const router = useRouter();
  const [codes, setCodes] = useState(initial);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '15',
    max_uses: '',
    referrer_customer_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function create(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        referrer_customer_id: form.referrer_customer_id || null
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setCodes((c) => [data.discount, ...c]);
    setForm({ code: '', type: 'percentage', value: '15', max_uses: '', referrer_customer_id: '' });
    router.refresh();
  }

  async function toggle(id, active) {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active })
    });
    if (res.ok) {
      const data = await res.json();
      setCodes((list) => list.map((c) => (c.id === id ? data.discount : c)));
      router.refresh();
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form onSubmit={create} className="space-y-4 glass-1 p-6">
        <h2 className="font-display text-xl text-graphite">Create code</h2>
        <input
          required
          placeholder="Code (e.g. DEW15)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm uppercase"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed $</option>
          </select>
          <input
            type="number"
            step="0.01"
            required
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm"
          />
        </div>
        <input
          placeholder="Max uses (optional)"
          value={form.max_uses}
          onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm"
        />
        <input
          placeholder="Referrer customer id (optional)"
          value={form.referrer_customer_id}
          onChange={(e) => setForm((f) => ({ ...f, referrer_customer_id: e.target.value }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm"
        />
        {error && <p className="text-xs text-charcoal/70">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] uppercase tracking-lockup text-pearl"
        >
          Create
        </button>
      </form>

      <ul className="divide-y divide-chrome/20 border-y border-chrome/20">
        {codes.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-display text-lg text-graphite">{c.code}</p>
              <p className="font-body text-xs font-light text-charcoal/60">
                {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} · used {c.uses_count}
                {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                {c.referrer_customer_id ? ` · ref ${c.referrer_customer_id}` : ''} ·{' '}
                {c.active ? 'active' : 'inactive'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(c.id, c.active)}
              className="font-label text-[0.62rem] uppercase tracking-lockup text-chrome hover:text-charcoal"
            >
              {c.active ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
