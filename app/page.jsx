import Link from 'next/link';
import { Suspense } from 'react';
import Hero from '@/components/Hero';
import ProductRail from '@/components/ProductRail';
import StickyCtaBar from '@/components/StickyCtaBar';
import { getFeaturedProducts } from '@/lib/products-server';

export const metadata = {
  title: 'Professional Skin Script Skincare',
  description:
    'Shop Skin Script professional skincare and book a virtual consultation with licensed aesthetician Emily Mitchener. Free shipping at $49+.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dew Theory — Professional Skin Script Skincare',
    description:
      'Skin Script actives for home and virtual consultations with Emily Mitchener. Free shipping at $49+.',
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dew Theory',
    images: [{ url: '/logo-dewtheory-og-20260825.png', width: 1200, height: 630, alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Professional Skin Script Skincare',
    description:
      'Skin Script actives for home and virtual consultations with Emily Mitchener.',
    images: ['/logo-dewtheory-og-20260825.png']
  }
};

export const revalidate = 60;

const EMILY_PICK_IDS = [
  'green-tea-citrus-cleanser',
  'hydrating-skin-serum',
  'ageless-moisturizer',
  'mandelic-brightening-serum',
  'sheer-protection-spf'
];

export default function Home() {
  const emilyPicks = getFeaturedProducts(EMILY_PICK_IDS);

  return (
    <>
      <Hero />
      <StickyCtaBar />

      {/* Emily's Picks — this is what you need */}
      <section className="border-b border-border bg-ivory py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="editorial-label">this is what you need</p>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
                Emily&apos;s picks
              </h2>
              <p className="mt-2 max-w-md font-body text-sm text-muted">
                Where most people start — sequenced for home, chosen the way Emily chooses in the room.
              </p>
            </div>
            <Link
              href="/shop"
              className="font-label text-[0.65rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
            >
              Shop all
            </Link>
          </div>
          <Suspense fallback={null}>
            <ProductRail products={emilyPicks} label="Emily's picks" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
