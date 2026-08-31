'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = [
  'pending_payment',
  'paid',
  'queued_for_supplier',
  'processing_supplier',
  'blocked_supplier_mapping',
  'blocked_out_of_stock',
  'blocked_price_drift',
  'blocked_address_validation',
  'blocked_human_verification',
  'blocked_payment_authentication',
  'submission_ambiguous',
  'submitted_to_skin_script',
  'failed_supplier',
  'supplier_processing',
  'supplier_shipped',
  'fulfilled',
  'cancelled',
  'payment_failed'
];

export default function OrderStatusForm({ orderId, current, order }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
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
        ? 'Status updated (manual mark — use Auto-submit to call supplier)'
        : 'Saved'
    );
    router.refresh();
  }

  async function autoFulfill() {
    setFulfilling(true);
    setMsg('');
    const res = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    setFulfilling(false);
    if (!res.ok) {
      setMsg(data.error || 'Auto-submit failed');
      router.refresh();
      return;
    }
    setMsg(
      data.idempotent
        ? `Already submitted · ${data.order?.supplier_order_id || ''}`
        : `Submitted · ${data.order?.supplier_order_id || ''}`
    );
    if (data.order?.status) setStatus(data.order.status);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="glass-1 p-6">
        <h2 className="font-display text-xl font-normal text-graphite">Fulfillment status</h2>
        <p className="mt-2 font-body text-xs font-light text-charcoal/60">
          Manual status change, or use Auto-submit to Skin Script (mock/http adapter) below.
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

      <div className="glass-1 p-6">
        <h2 className="font-display text-xl font-normal text-graphite">Auto-submit to Skin Script</h2>
        <p className="mt-2 font-body text-xs font-light text-charcoal/60">
          Calls the supplier adapter with line SKUs. Idempotent if already submitted. Requires each
          product to have <code className="text-[0.7rem]">skin_script_sku</code>.
        </p>
        {order?.supplier_order_id && (
          <p className="mt-3 font-body text-sm font-light text-charcoal/80">
            Supplier PO: <span className="font-medium">{order.supplier_order_id}</span>
            {order.supplier_status ? ` · ${order.supplier_status}` : ''}
          </p>
        )}
        {order?.fulfillment_error && (
          <p className="mt-2 font-body text-xs font-light text-charcoal/70" role="alert">
            Last error{order.fulfillment_error_code ? ` (${order.fulfillment_error_code})` : ''}:{' '}
            {order.fulfillment_error}
          </p>
        )}
        <button
          type="button"
          disabled={fulfilling}
          onClick={autoFulfill}
          className="mt-4 border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
        >
          {fulfilling ? 'Submitting…' : 'Submit to Skin Script (auto)'}
        </button>
      </div>
    </div>
  );
}
