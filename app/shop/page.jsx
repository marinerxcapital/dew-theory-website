import Link from 'next/link';
import Rule from '@/components/Rule';
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
    <section className="relative mx-auto max-w-shell px-6 pb-24 pt-28 sm:pb-32 sm:pt-32 lg:px-10">
      <div data-reveal-group="shop-head">
        <Rule left="Shop" right="Skin Script" data-reveal />
        <h1
          data-reveal
          className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-graphite sm:mt-6"
        >
          The collection
        </h1>
        <p
          data-reveal
          className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-charcoal/75 sm:mt-6"
        >
          {count === 0
            ? 'Products will appear here once the catalog is ready.'
            : `${count} Skin Script formulation${count === 1 ? '' : 's'} — professional actives, clear pricing.`}
        </p>
        {count > 0 && (
          <p
            data-reveal
            className="mt-5 inline-flex max-w-xl border border-chrome/15 bg-surface px-4 py-3 font-body text-xs font-normal leading-relaxed text-charcoal/70"
          >
            Free shipping at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal
            (before discount). Below that, {formatMoney(FLAT_SHIPPING_USD)} flat.
          </p>
        )}

        <div
          data-reveal
          className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4"
        >
          <Link
            href="/quiz"
            className="group flex flex-col justify-between rounded-[2px] border border-chrome/15 bg-graphite p-6 text-pearl transition-colors hover:bg-[#2a2d36] sm:p-7"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-pearl/55">
              Teens → 60 & beyond
            </p>
            <div className="mt-6">
              <p className="font-display text-2xl font-normal text-pearl">Skin quiz</p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-pearl/70">
                Four questions. A morning and evening sequence built for your chapter of skin.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-pearl">
                Start the quiz
                <span className="h-px w-6 bg-pearl/40 transition-[width] group-hover:w-10" />
              </span>
            </div>
          </Link>
          <Link
            href="/routine"
            className="group flex flex-col justify-between rounded-[2px] border border-chrome/15 bg-surface p-6 shadow-card transition-shadow hover:shadow-card-hover sm:p-7"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-chrome">
              AM · PM builder
            </p>
            <div className="mt-6">
              <p className="font-display text-2xl font-normal text-graphite">Build your routine</p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal/70">
                Choose each step. Thin to thick. SPF last by day. Add the sequence in one tap.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-graphite">
                Open builder
                <span className="h-px w-6 bg-chrome/50 transition-[width] group-hover:w-10" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-10 sm:mt-12">
        <ShopGrid products={all} />
      </div>
    </section>
  );
}
