import Link from 'next/link';
import { Suspense } from 'react';
import ShopGrid from '@/components/ShopGrid';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

export const metadata = {
  title: 'Shop Skin Script Skincare',
  description:
    'Shop Skin Script professional skincare — the same actives Emily uses in the studio. Free shipping at $49+ pre-discount. Cleansers, serums, moisturizers, SPF, and more.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop Skin Script — Dew Theory',
    description:
      'Professional Skin Script skincare with clear retail pricing. Free shipping at $49+.',
    url: '/shop',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Dew Theory shop' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Skin Script — Dew Theory',
    description: 'Professional Skin Script skincare with clear retail pricing.',
    images: ['/logo.png']
  }
};

export const revalidate = 60;

export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;

  return (
    <section className="relative mx-auto max-w-shell px-5 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-12 lg:px-10">
      <div data-reveal-group="shop-head">
        <p
          data-reveal
          className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted"
        >
          Skin Script
        </p>
        <h1
          data-reveal
          className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,5vw,3.5rem)] font-normal leading-[1.05] text-ink"
        >
          Shop skincare
        </h1>
        <p
          data-reveal
          className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          {count === 0
            ? 'Products will appear here once the catalog is ready.'
            : `${count} professional formulation${count === 1 ? '' : 's'} — the same actives Emily uses in treatment.`}
        </p>
        {count > 0 && (
          <p
            data-reveal
            className="mt-5 inline-flex max-w-xl border border-border bg-surface-light px-4 py-3 font-body text-xs font-normal leading-relaxed text-charcoal"
          >
            Free shipping at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal (before
            discount). Below that, {formatMoney(FLAT_SHIPPING_USD)} flat.
          </p>
        )}

        <div data-reveal className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Link
            href="/quiz"
            className="group flex flex-col justify-between bg-dew p-6 text-white transition-colors hover:bg-dew-dark sm:p-7"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-white/70">
              Teens → 60 & beyond
            </p>
            <div className="mt-6">
              <p className="font-display text-2xl font-normal text-white">Skin quiz</p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-white/80">
                Four questions. A morning and evening sequence built for your chapter of skin.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-white">
                Start the quiz →
              </span>
            </div>
          </Link>
          <Link
            href="/routine"
            className="group flex flex-col justify-between border border-border bg-white p-6 transition-colors hover:border-ink sm:p-7"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
              AM · PM builder
            </p>
            <div className="mt-6">
              <p className="font-display text-2xl font-normal text-ink">Build your routine</p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-muted">
                Choose each step. Thin to thick. SPF last by day. Add the sequence in one tap.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink">
                Open builder →
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-10 sm:mt-12">
        <Suspense
          fallback={
            <p className="font-body text-sm text-muted" role="status">
              Loading collection…
            </p>
          }
        >
          <ShopGrid products={all} />
        </Suspense>
      </div>
    </section>
  );
}
