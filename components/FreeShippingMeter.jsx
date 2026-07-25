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
      className={`border border-chrome/20 bg-pearl/50 p-4 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
          Shipping
        </p>
        <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-charcoal/70">
          {unlocked ? 'Free unlocked' : `${formatMoney(FLAT_SHIPPING_USD)} flat`}
        </p>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-chrome/15"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-ice/80 via-lavender/70 to-chrome/60 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 font-body text-xs font-light leading-relaxed text-charcoal/70">
        {unlocked ? (
          <>
            Free shipping applied — subtotal is {formatMoney(threshold)}+ before discount.
          </>
        ) : (
          <>
            Add <span className="text-charcoal">{formatMoney(remaining)}</span> more for free
            shipping (threshold {formatMoney(threshold)} pre-discount). Otherwise{' '}
            {formatMoney(FLAT_SHIPPING_USD)} flat.
          </>
        )}
      </p>
    </div>
  );
}
