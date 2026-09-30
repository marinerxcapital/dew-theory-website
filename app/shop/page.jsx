import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { Suspense } from 'react';
import ShopGrid from '@/components/ShopGrid';
import ProductRail from '@/components/ProductRail';
import TrustStrip from '@/components/TrustStrip';
import { IconArrowRight } from '@/components/Icons';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { presentCategories } from '@/lib/shop-filters';

export const metadata = withPageMetadata('/shop', {
  title: 'Shop Skin Script Skincare',
  description:
    'Shop Skin Script professional skincare — the same actives Emily uses in the studio. Free shipping at $49+ pre-discount. Cleansers, serums, moisturizers, SPF, and more.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop Skin Script — Dew Theory',
    description: 'Professional Skin Script skincare with clear retail pricing. Free shipping at $49+.',
    url: '/shop',
    images: [{ url: '/logo-dewtheory-glass-wordmark-transparent.png', width: 3000, height: 1000, alt: 'Dew Theory shop' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Skin Script — Dew Theory',
    description: 'Professional Skin Script skincare with clear retail pricing.',
    images: ['/logo-dewtheory-glass-wordmark-transparent.png']
  }
});

export const revalidate = 60;

/*
 * Shop All — the DT-02 composition.
 *
 * A full-bleed editorial band, then the filter rail and product grid as the
 * primary body of the page. The per-category carousels that used to sit here
 * have been replaced by a compact category row: the grid plus its filters
 * already cover discovery, and the mockup gives the grid the whole viewport.
 * Every category entry point is preserved.
 */
export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;
  const categories = presentCategories(visible);

  return (
    <div className="bg-void">
      <header className="relative isolate overflow-hidden border-b border-border">
        {/* Same light as the hero, so the two flagship surfaces read as one
            campaign rather than two different pages. */}
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__glass" />
          <div className="hero-art__streak" />
          <div
            className="hero-art__bloom"
            style={{ right: '4%', top: '-24%', width: '30rem', height: '30rem' }}
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-shell px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Skin Script
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.8rem,7.6vw,6rem)] font-normal leading-[0.9] tracking-hero text-ink">
            Shop
          </h1>
          <p className="mt-5 max-w-xl font-body text-[1.05rem] font-normal leading-[1.6] tracking-[0.02em] text-ink">
            Skincare selected with purpose.
          </p>
          <p className="mt-4 max-w-xl font-body text-[0.95rem] font-normal leading-[1.7] text-muted">
            {count === 0
              ? 'Products will appear here once the catalog is ready.'
              : count +
                ' professional formulations — the same actives a licensed aesthetician uses in treatment.'}
          </p>
        </div>
      </header>

      <div className="border-b border-border bg-void py-8 sm:py-10">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <TrustStrip />
        </div>
      </div>

      <section className="mx-auto max-w-shell px-5 pt-10 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Shop by type
          </h2>
          <Link
            href="/skin-concerns"
            className="group inline-flex items-center gap-2 font-body text-[0.68rem] font-medium uppercase tracking-lockup text-ink"
          >
            Shop by skin concern
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  href={'/shop?type=' + encodeURIComponent(cat)}
                  className="inline-flex min-h-[40px] items-center border border-hairline px-4 font-body text-[0.7rem] uppercase tracking-eyebrow text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mx-auto max-w-shell space-y-8 px-5 py-10 sm:px-6 lg:px-10" aria-label="Category collections">
        {categories.map(category => <details key={category} className="rounded-card border border-border bg-green-50 p-5">
          <summary className="flex min-h-[44px] cursor-pointer items-center font-display text-2xl text-ink">{category}</summary>
          <div className="mt-6"><ProductRail products={visible.filter(p => p.category === category)} label={`${category} collection`} /></div>
        </details>)}
      </section>

      <section className="mx-auto max-w-shell px-5 pb-24 pt-10 sm:px-6 lg:px-10">
        <h2 className="sr-only">All products</h2>
        <Suspense
          fallback={
            <p className="font-body text-sm text-muted" role="status">
              Loading collection…
            </p>
          }
        >
          <ShopGrid products={all} />
        </Suspense>
      </section>
    </div>
  );
}
