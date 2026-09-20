import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

/**
 * Light factual trust row — no reviews, ratings, or invented credentials.
 * Facts: Skin Script professional actives, virtual consult with Emily, $49 / $7 shipping.
 */
const ITEMS = [
  {
    id: 'actives',
    label: 'Skin Script',
    body: 'Professional actives for home — the same line Emily uses in treatment.'
  },
  {
    id: 'consult',
    label: 'Virtual consult',
    body: 'Meet with Emily by Zoom for a plan built around your skin.'
  }
];

export default function TrustStrip({ className = '' }) {
  return (
    <ul
      className={`grid gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-3 ${className}`.trim()}
    >
      {ITEMS.map((item) => (
        <li key={item.id} className="bg-ivory px-5 py-5 sm:px-6">
          <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
            {item.label}
          </p>
          <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal">
            {item.body}
          </p>
        </li>
      ))}
      <li className="bg-ivory px-5 py-5 sm:px-6">
        <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
          Shipping
        </p>
        <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal">
          Free at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal (before discount).
          Below that, {formatMoney(FLAT_SHIPPING_USD)} flat.
        </p>
      </li>
    </ul>
  );
}
