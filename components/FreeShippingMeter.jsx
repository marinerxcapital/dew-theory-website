'use client';

import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

/**
 * Visual free-shipping progress — uses confirmed $7 / $49+ rules only.
 * @param {{ subtotal: number, className?: string }} props
 */
export default function FreeShippingMeter({ subtotal = 0, className = '' }) {
  const pre = Math.max(0, Number(subtotal) || 0);
  const threshold = FREE_SHIPPING_THRESHOLD_USD;
  const unlocked = pre >= threshold;
  const remaining = Math.max(0, threshold - pre);
  const pct = Math.min(100, Math.round((pre / threshold) * 100));

  return (
    <div
      className={`border border-border bg-surface-light p-4 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
          Shipping
        </p>
        <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-ink">
          {unlocked ? 'Free unlocked' : `${formatMoney(FLAT_SHIPPING_USD)} flat`}
        </p>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={
          unlocked
            ? 'Free shipping unlocked'
            : `${formatMoney(remaining)} away from free shipping`
        }
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            unlocked ? 'bg-dew' : 'bg-ink'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 font-body text-xs font-normal leading-relaxed text-muted">
        {unlocked ? (
          <>
            Free shipping applied — subtotal is {formatMoney(threshold)}+ before discount.
          </>
        ) : (
          <>
            You&apos;re <span className="text-ink">{formatMoney(remaining)}</span> away from free
            shipping. Otherwise {formatMoney(FLAT_SHIPPING_USD)} flat.
          </>
        )}
      </p>
    </div>
  );
}
