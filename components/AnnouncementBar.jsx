'use client';

import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD_USD, formatMoney } from '@/lib/shipping';

/**
 * Compact announcement bar — factual free-shipping message by default.
 * tone: ink (default) | promo (red) | service (dew green)
 */
export default function AnnouncementBar({
  tone = 'ink',
  message,
  href = '/shipping',
  cta = 'Details'
} = {}) {
  const text =
    message ||
    `Free shipping on ${formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal`;

  const toneClass =
    tone === 'promo'
      ? 'announcement-bar announcement-bar--promo'
      : tone === 'service'
        ? 'announcement-bar announcement-bar--service'
        : 'announcement-bar';

  return (
    <div className={toneClass} role="region" aria-label="Store announcement">
      <div className="mx-auto flex max-w-shell items-center justify-center gap-3 px-4 py-2 sm:px-6 lg:px-10">
        <p className="text-center font-label text-[0.62rem] font-normal uppercase tracking-lockup text-ivory sm:text-[0.68rem]">
          {text}
        </p>
        {href ? (
          <Link
            href={href}
            className="hidden font-label text-[0.62rem] font-normal uppercase tracking-lockup text-ivory/85 underline-offset-2 hover:text-ivory hover:underline sm:inline"
          >
            {cta}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
