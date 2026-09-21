import Link from 'next/link';
import { Suspense } from 'react';
import CategoryProductCarousel from '@/components/CategoryProductCarousel';
import ShopGrid from '@/components/ShopGrid';
import TrustStrip from '@/components/TrustStrip';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { presentCategories } from '@/lib/shop-filters';

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
    images: [{ url: '/logo-dewtheory-og-20260825.png', width: 1200, height: 630, alt: 'Dew Theory shop' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Skin Script — Dew Theory',
    description: 'Professional Skin Script skincare with clear retail pricing.',
    images: ['/logo-dewtheory-og-20260825.png']
  }
};

export const revalidate = 60;

export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;
  const categories = presentCategories(visible);

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
        {count > 0 ? (
          <div data-reveal className="mt-6">
            <TrustStrip />
          </div>
        ) : null}

        <div data-reveal className="mt-8 grid gap-3">
          <Link
            href="/virtual-consultation"
            className="group flex flex-col justify-between bg-forest p-6 text-ivory transition-colors hover:bg-sage-deep sm:p-7"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-ivory/80">
              One-on-one · Zoom
            </p>
            <div className="mt-6">
              <p className="font-display text-2xl font-normal text-ivory">Virtual consultation</p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-ivory/85">
                A focused skin review with Emily, plus a personalized morning and evening plan.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ivory">
                Book a consultation →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-12 space-y-14 sm:mt-16" data-reveal-group="shop-carousels">
          {categories.map((cat) => {
            const items = visible.filter((p) => p.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat} data-reveal>
                <CategoryProductCarousel products={items} categoryLabel={cat} />
                <div className="mt-4">
                  <Link
                    href={`/shop?type=${encodeURIComponent(cat)}`}
                    className="font-label text-[0.62rem] uppercase tracking-lockup text-ink underline-offset-4 hover:underline"
                  >
                    View all {cat}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-14 sm:mt-16">
        <h2 className="font-display text-2xl font-normal text-ink sm:text-3xl">Browse all</h2>
        <p className="mt-2 max-w-xl font-body text-sm text-muted">
          Filter and sort the full collection — carousels are for discovery; this grid is always available.
        </p>
        <div className="mt-6">
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
      </div>
    </section>
  );
}
