import Image from 'next/image';
import Link from 'next/link';

/** Featured product images for the hero — real catalog photography (WebP). */
const HERO_PRODUCTS = [
  {
    src: '/images/products/skin-script/00-green-tea-citrus-cleanser.webp',
    alt: 'Green Tea Citrus Cleanser',
    href: '/shop/green-tea-citrus-cleanser'
  },
  {
    src: '/images/products/skin-script/02-ageless-skin-hydrating-serum.webp',
    alt: 'Hydrating Skin Serum',
    href: '/shop/hydrating-skin-serum'
  },
  {
    src: '/images/products/skin-script/03-ageless-skin-moisturizer.webp',
    alt: 'Ageless Moisturizer',
    href: '/shop/ageless-moisturizer'
  }
];

/**
 * Server Component hero — Sephora-grade retail confidence, Dew Theory identity.
 */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-white">
      <div className="relative z-[1] mx-auto grid w-full max-w-shell gap-10 px-5 pb-14 pt-10 sm:gap-12 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-0 lg:px-0 lg:pb-0 lg:pt-0">
        <div className="flex min-w-0 flex-col justify-center lg:px-10 lg:py-16 xl:px-14">
          <p className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted">
            Clinical · Quiet · Precise
          </p>

          <h1 className="mt-4 max-w-xl font-display text-[clamp(2.35rem,5.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.015em] text-ink sm:mt-5">
            Clinical skincare, selected by the aesthetician who uses it.
          </h1>

          <p className="mt-5 max-w-md font-body text-base font-normal leading-relaxed text-charcoal sm:mt-6 sm:text-[1.05rem]">
            Professional Skin Script actives for home — and facials with Emily Mitchener that decide
            which of them you actually need.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/shop"
              className="btn-primary w-full min-h-[48px] px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup sm:w-auto"
            >
              Shop Skin Script
            </Link>
            <Link
              href="/quiz"
              className="btn-dew-outline w-full min-h-[48px] px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup sm:w-auto"
            >
              Take the Skin Quiz
            </Link>
          </div>

          <p className="mt-7 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
            Free shipping at $49+ · Licensed aesthetician
          </p>
        </div>

        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[280px] overflow-hidden bg-surface-light sm:min-h-[360px] lg:min-h-full">
            <Link href={HERO_PRODUCTS[0].href} className="absolute inset-0 block">
              <Image
                src={HERO_PRODUCTS[0].src}
                alt={HERO_PRODUCTS[0].alt}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700 motion-safe:hover:scale-[1.02]"
              />
            </Link>
          </div>
          <div className="flex flex-col bg-dew-surface">
            <Link
              href="/quiz"
              className="flex flex-1 flex-col justify-between border-b border-dew/15 p-6 transition-colors hover:bg-dew-soft sm:p-8"
            >
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-dew">
                Not sure where to start?
              </p>
              <div className="mt-8">
                <p className="font-display text-2xl text-ink sm:text-3xl">Skin Quiz</p>
                <p className="mt-2 font-body text-sm text-charcoal/80">
                  Four questions. A morning and evening sequence for your chapter of skin.
                </p>
                <span className="mt-5 inline-flex font-label text-[0.62rem] uppercase tracking-lockup text-dew-dark">
                  Find my routine →
                </span>
              </div>
            </Link>
            <Link
              href="/services"
              className="flex flex-1 flex-col justify-between p-6 transition-colors hover:bg-dew-soft sm:p-8"
            >
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-dew">
                In studio
              </p>
              <div className="mt-6">
                <p className="font-display text-2xl text-ink sm:text-3xl">Book a facial</p>
                <p className="mt-2 font-body text-sm text-charcoal/80">
                  Barrier-first treatments with Emily Mitchener.
                </p>
                <span className="mt-5 inline-flex font-label text-[0.62rem] uppercase tracking-lockup text-dew-dark">
                  View services →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
