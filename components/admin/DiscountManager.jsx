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
    referrer_customer_id: '',
    expires_at: ''
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ value: '', max_uses: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function create(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        referrer_customer_id: form.referrer_customer_id || null,
        expires_at: form.expires_at || null
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setCodes((c) => [data.discount, ...c]);
    setForm({
      code: '',
      type: 'percentage',
      value: '15',
      max_uses: '',
      referrer_customer_id: '',
      expires_at: ''
    });
    setMsg('Code created');
    router.refresh();
  }

  async function toggle(id, active) {
    setMsg('');
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active })
    });
    if (res.ok) {
      const data = await res.json();
      setCodes((list) => list.map((c) => (c.id === id ? data.discount : c)));
      setMsg(data.discount.active ? 'Activated' : 'Deactivated');
      router.refresh();
    }
  }

  function startEdit(c) {
    setEditId(c.id);
    setEditForm({
      value: String(c.value),
      max_uses: c.max_uses != null ? String(c.max_uses) : ''
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: parseFloat(editForm.value),
        max_uses: editForm.max_uses === '' ? null : parseInt(editForm.max_uses, 10)
      })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Update failed');
      return;
    }
    const data = await res.json();
    setCodes((list) => list.map((c) => (c.id === id ? data.discount : c)));
    setEditId(null);
    setMsg('Saved');
    router.refresh();
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form onSubmit={create} className="space-y-4 glass-1 p-6">
        <h2 className="font-display text-xl font-normal text-graphite">Create code</h2>
        <input
          required
          placeholder="Code (e.g. DEW15)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light uppercase"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed $</option>
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          />
        </div>
        <input
          placeholder="Max uses (optional)"
          value={form.max_uses}
          onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
        />
        <input
          type="date"
          placeholder="Expires"
          value={form.expires_at}
          onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
          aria-label="Expires at"
        />
        <input
          placeholder="Referrer customer id (optional)"
          value={form.referrer_customer_id}
          onChange={(e) => setForm((f) => ({ ...f, referrer_customer_id: e.target.value }))}
          className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
        />
        {error && (
          <p className="font-body text-xs font-light text-charcoal/70" role="alert">
            {error}
          </p>
        )}
        {msg && (
          <p className="font-body text-xs font-light text-charcoal/60" role="status">
            {msg}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
        >
          Create
        </button>
      </form>

      <ul className="divide-y divide-chrome/20 border-y border-chrome/20">
        {codes.map((c) => (
          <li key={c.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-normal text-graphite">{c.code}</p>
                <p className="mt-1 font-body text-xs font-light text-charcoal/60">
                  {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} ·{' '}
                  <span className="text-charcoal">
                    redemptions {c.uses_count ?? 0}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ' (unlimited)'}
                  </span>
                  {c.expires_at ? ` · expires ${c.expires_at}` : ''}
                  {' · '}
                  {c.active ? 'active' : 'inactive'}
                </p>
                {c.referrer_customer_id && (
                  <p className="mt-1 font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                    Referrer id: {c.referrer_customer_id}
                  </p>
                )}
                {c.stripe_promotion_code_id && (
                  <p className="mt-1 font-body text-[0.65rem] font-light text-chrome">
                    Stripe: {c.stripe_promotion_code_id}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (editId === c.id ? setEditId(null) : startEdit(c))}
                  className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
                >
                  {editId === c.id ? 'Cancel' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(c.id, c.active)}
                  className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
                >
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
            {editId === c.id && (
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-chrome/15 pt-3">
                <label className="font-body text-xs font-light text-charcoal/70">
                  Value
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.value}
                    onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))}
                    className="mt-1 block w-24 border border-chrome/30 bg-pearl/90 px-2 py-2"
                  />
                </label>
                <label className="font-body text-xs font-light text-charcoal/70">
                  Max uses
                  <input
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={editForm.max_uses}
                    onChange={(e) => setEditForm((f) => ({ ...f, max_uses: e.target.value }))}
                    className="mt-1 block w-24 border border-chrome/30 bg-pearl/90 px-2 py-2"
                  />
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => saveEdit(c.id)}
                  className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-pearl"
                >
                  Save
                </button>
              </div>
            )}
          </li>
        ))}
        {!codes.length && (
          <li className="py-8 font-body text-sm font-light text-charcoal/50">No discount codes yet.</li>
        )}
      </ul>
    </div>
  );
}
