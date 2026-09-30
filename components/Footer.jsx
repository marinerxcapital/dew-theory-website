'use client';

import Link from 'next/link';
import Wordmark from './Wordmark';
import { FREE_SHIPPING_THRESHOLD_USD, formatMoney } from '@/lib/shipping';
import { getFooterLegalLinks } from '@/lib/legal-documents';

/**
 * Brand-ending band, restyled to the pearl/editorial system.
 *
 * The information architecture and the legal link source are unchanged — the
 * policy list still comes from `getFooterLegalLinks()` so nothing about the
 * published policies is invented here. Only the material and typography move
 * to the approved direction: wordmark first, hairline rules, no card chrome.
 */

const footerLegal = getFooterLegalLinks();

const columns = [
  {
    head: 'Shop',
    items: [
      ['Shop all', '/shop'],
      ['Cleansers', '/shop?type=Cleanser'],
      ['Serums', '/shop?type=Serum'],
      ['Moisturizers', '/shop?type=Moisturizer'],
      ['SPF', '/shop?type=SPF'],
      ['Skin concerns', '/skin-concerns'],
      ['Routines', '/routine'],
      ['Favorites', '/favorites'],
      ['Shopping bag', '/cart']
    ]
  },
  {
    head: 'Guidance',
    items: [
      ['Virtual consultation', '/virtual-consultation'],
      ['Skin quiz', '/skin-quiz'],
      ['How it works', '/how-it-works'],
      ['Ingredient library', '/ingredients']
    ]
  },
  {
    head: 'House',
    items: [
      ['Journal', '/journal'],
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Help center', '/help']
    ]
  },
  {
    head: 'Help',
    items: footerLegal.map((l) => [l.label, l.href])
  }
];

export default function Footer() {

  return (
    <footer className="site-footer grain relative mt-24 overflow-hidden">
      <div className="relative z-[1] mx-auto max-w-shell px-5 pb-12 pt-section-sm sm:px-6 sm:pt-section-md lg:px-10 lg:pt-section-lg">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
            <Wordmark sizes="(max-width: 1024px) 74vw, 22vw"
              src="/logo-dewtheory-glass-wordmark-transparent.png"
              className="h-auto w-[min(21rem,74vw)] lg:w-[min(22rem,22vw)]"
            />
            <p className="mt-8 max-w-sm font-body text-[0.95rem] font-normal leading-[1.7] text-muted">
              Barrier-first Skin Script skincare and one-to-one guidance from a licensed
              aesthetician. If you do not need it, you do not buy it.
            </p>
            <p className="mt-6 font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
              Free shipping {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-ink">
                {col.head}
              </p>
              <ul className="mt-6 space-y-3">
                {col.items.map(([label, href]) => (
                  <li key={`${col.head}-${href}-${label}`}>
                    <Link prefetch={false}
                      href={href}
                      className="font-body text-[0.9rem] font-normal text-muted transition-colors duration-200 hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            © {new Date().getFullYear()} Dew Theory · Emily Mitchener, Licensed Aesthetician
          </p>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Clinical · Precise · Personal
          </p>
        </div>
      </div>
    </footer>
  );
}
