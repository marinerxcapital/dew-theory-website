'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function CopyField({ label, value }) {
  const text = value == null || value === '' ? '—' : String(value);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (text === '—') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-chrome/15 py-2">
      <div className="min-w-0">
        <div className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">{label}</div>
        <div className="mt-0.5 break-all font-body text-sm text-forest">{text}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={text === '—'}
        className="shrink-0 rounded-sm border border-sage-deep/25 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-forest disabled:opacity-40"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

const ACTIONS = [
  { id: 'mark_submitted', label: 'Mark submitted' },
  { id: 'mark_shipped', label: 'Mark shipped' },
  { id: 'mark_fulfilled', label: 'Mark fulfilled' },
  { id: 'mark_needs_review', label: 'Mark needs review' }
];

export default function ManualFulfillmentPanel({ order, automationLive = false, modeLabel = 'Mock' }) {
  const router = useRouter();
  const [vendorOrderId, setVendorOrderId] = useState(order?.supplier_order_id || '');
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '');
  const [carrier, setCarrier] = useState(order?.carrier || '');
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const ship = order?.shipping_address || {};
  const customer = order?.customer || {};
  const lines = useMemo(() => order?.items || [], [order]);

  async function submit(action) {
    setLoading(action);
    setMsg('');
    setError('');
    const res = await fetch(`/api/admin/orders/${order.id}/manual-fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        vendor_order_id: vendorOrderId || undefined,
        tracking_number: trackingNumber || undefined,
        carrier: carrier || undefined
      })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      setError(data.error || 'Update failed');
      return;
    }
    setMsg(`Saved · ${data.order?.status || action}`);
    if (data.order?.supplier_order_id) setVendorOrderId(data.order.supplier_order_id);
    if (data.order?.tracking_number) setTrackingNumber(data.order.tracking_number);
    if (data.order?.carrier) setCarrier(data.order.carrier);
    router.refresh();
  }

  return (
    <div className="glass-1 space-y-6 p-6">
      <div>
        <h2 className="font-display text-xl font-normal text-forest">Manual owner fulfillment</h2>
        {!automationLive && (
          <p className="mt-2 font-body text-xs font-light text-muted">
            Manual owner fulfillment — SKIN_SCRIPT_MODE is {String(modeLabel).toLowerCase()} / RPA not
            live. Record supplier PO and tracking here; this path never calls live Skin Script or
            bypasses CAPTCHA.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
          Copyable ship details
        </h3>
        <div className="mt-2">
          <CopyField label="Customer name" value={customer.name} />
          <CopyField label="Customer email" value={customer.email} />
          <CopyField label="Address line 1" value={ship.line1} />
          <CopyField label="Address line 2" value={ship.line2} />
          <CopyField
            label="City / state / postal"
            value={[ship.city, ship.state, ship.postal_code].filter(Boolean).join(', ')}
          />
        </div>
      </div>

      <div>
        <h3 className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">Line items</h3>
        <ul className="mt-2 divide-y divide-chrome/15 border-y border-chrome/15">
          {lines.map((li, i) => {
            const portalSku =
              li.skin_script_sku || li.portal_sku || li.supplier_sku || li.mapping_sku || null;
            return (
              <li key={i} className="space-y-1 py-3">
                <CopyField label="Product ID" value={li.product_id || li.sku} />
                <CopyField label="Name" value={li.name} />
                <CopyField label="Qty" value={li.quantity} />
                <CopyField label="Variant" value={li.variant} />
                <CopyField label="Portal SKU" value={portalSku} />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">
            Vendor order ID
          </span>
          <input
            value={vendorOrderId}
            onChange={(e) => setVendorOrderId(e.target.value)}
            className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
            placeholder="Skin Script PO #"
          />
        </label>
        <label className="block text-sm">
          <span className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">
            Tracking number
          </span>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">
            Carrier (optional)
          </span>
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
            placeholder="USPS / UPS / FedEx"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={Boolean(loading)}
            onClick={() => submit(a.id)}
            className="rounded-sm border border-forest bg-forest px-4 py-2.5 font-label text-[0.62rem] uppercase tracking-lockup text-ivory disabled:opacity-60"
          >
            {loading === a.id ? 'Saving…' : a.label}
          </button>
        ))}
      </div>

      {msg && <p className="font-body text-xs text-forest">{msg}</p>}
      {error && (
        <p className="font-body text-xs text-promo" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
