'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = [
  'pending_payment',
  'paid',
  'submitted_to_skin_script',
  'fulfilled',
  'cancelled',
  'payment_failed'
];

export default function OrderStatusForm({ orderId, current }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || 'Update failed');
      return;
    }
    setMsg(
      status === 'submitted_to_skin_script'
        ? 'Marked submitted to Skin Script (manual — no API call)'
        : 'Saved'
    );
    router.refresh();
  }

  return (
    <form onSubmit={save} className="glass-1 p-6">
      <h2 className="font-display text-xl font-normal text-graphite">Fulfillment status</h2>
      <p className="mt-2 font-body text-xs font-light text-charcoal/60">
        Manual only — does not scrape or auto-order from Skin Script. Use submitted_to_skin_script
        after you place the wholesale order yourself.
      </p>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mt-4 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Update status'}
      </button>
      {msg && <p className="mt-2 font-body text-xs font-light text-charcoal/60">{msg}</p>}
    </form>
  );
}
