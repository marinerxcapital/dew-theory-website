import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Hero from '@/components/Hero';
import StickyCtaBar from '@/components/StickyCtaBar';
import TrustStrip from '@/components/TrustStrip';
import WaysToStart from '@/components/home/WaysToStart';
import ShopByConcern from '@/components/home/ShopByConcern';
import FeaturedProductStory from '@/components/home/FeaturedProductStory';
import PersonalizationHub from '@/components/home/PersonalizationHub';
import MeetEmily from '@/components/home/MeetEmily';
import BestSellers from '@/components/home/BestSellers';
import Education from '@/components/home/Education';
import FinalConsultationCta from '@/components/home/FinalConsultationCta';
import { IconArrowRight } from '@/components/Icons';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { getAllJournalEntries } from '@/lib/journal';

export const metadata = withPageMetadata('/', {
  title: 'Professional Skin Script Skincare',
  description:
    'Professional Skin Script skincare from Dew Theory with Emily Mitchener. Shop clinical actives, build a routine, or book a 1:1 virtual consultation. Free shipping at $49+.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dew Theory — Professional Skin Script Skincare',
    description:
      'Skin Script actives for home, a routine builder, and one-on-one virtual consultations with Emily Mitchener. Free shipping at $49+.',
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dew Theory',
    images: [{ url: '/logo-dewtheory-glass-wordmark-transparent.png', width: 3000, height: 1000, alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Professional Skin Script Skincare',
    description:
      'Skin Script actives for home, a routine builder, and one-on-one virtual consultations with Emily Mitchener.',
    images: ['/logo-dewtheory-glass-wordmark-transparent.png']
  }
});

export const revalidate = 60;

/** Hero and featured-story products, resolved against the live catalog. */
const HERO_PRODUCT_ID = 'hydrating-skin-serum';
const FEATURED_PRODUCT_ID = 'mandelic-brightening-serum';

/** Where most people start — order matters, ids must exist in the catalog. */
const EMILY_PICK_IDS = [
  'green-tea-citrus-cleanser',
  'hydrating-skin-serum',
  'ageless-moisturizer',
  'mandelic-brightening-serum',
  'sheer-protection-spf'
];

/**
 * Homepage, ordered to the approved DT-01 hierarchy: hero, then the concern
 * shelf, then the ways in, the editorial story, personalisation and the edit.
 * Every section below reads live catalog data; nothing here is a mockup-only
 * placeholder.
 */
export default function Home() {
  const visible = getProducts().filter(isShopVisible);
  const byId = (id) => visible.find((p) => p.id === id) || null;

  const heroProduct = byId(HERO_PRODUCT_ID);
  const featuredProduct = byId(FEATURED_PRODUCT_ID) || heroProduct;
  const emilyPicks = EMILY_PICK_IDS.map(byId).filter(Boolean);
  const journal = getAllJournalEntries().slice(0, 3);

  return (
    <>
      <Hero product={heroProduct} />
      <StickyCtaBar />

      <section className="border-b border-border bg-void py-8 sm:py-10" aria-label="How Dew Theory works">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <TrustStrip />
        </div>
      </section>

      <ShopByConcern />
      <WaysToStart />
      <FeaturedProductStory product={featuredProduct} />
      <PersonalizationHub />
      <MeetEmily />
      <BestSellers products={emilyPicks} />

      {/* Journal teaser — real editorial from lib/journal.js */}
      <section className="border-b border-border bg-void" aria-labelledby="journal-teaser">
        <div className="mx-auto max-w-shell px-5 pb-section-sm pt-section-sm sm:px-6 lg:px-10 lg:pt-section-md">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                The journal
              </p>
              <h2
                id="journal-teaser"
                className="mt-4 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-normal leading-[1.05] tracking-headline text-ink"
              >
                Notes on skin
              </h2>
            </div>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 font-body text-[0.68rem] font-medium uppercase tracking-lockup text-ink"
            >
              All entries
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
            {journal.map((entry) => (
              <li key={entry.slug} className="bg-void">
                <Link
                  href={`/journal/${entry.slug}`}
                  className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-300 hover:bg-surface lg:p-8"
                >
                  <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                    {entry.topic} · {entry.edition}
                  </p>
                  <div>
                    <h3 className="font-display text-[1.45rem] font-normal leading-[1.1] text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-4 font-body text-[0.92rem] leading-[1.68] text-muted">
                      {entry.dek}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Education />

      <section className="border-b border-border bg-void py-10 sm:py-12" aria-label="Browse the collection">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-4 px-5 sm:px-6 lg:px-10">
          <p className="max-w-lg font-body text-sm font-normal leading-relaxed text-muted">
            Prefer to browse everything at once? The full Skin Script collection is filterable by
            type, concern, skin type, routine step, and price.
          </p>
          <Link
            href="/shop"
            className="btn-ghost inline-flex min-h-[44px] items-center px-7 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup"
          >
            Browse all products
          </Link>
        </div>
      </section>

      <FinalConsultationCta />
    </>
  );
}
