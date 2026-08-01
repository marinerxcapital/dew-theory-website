'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);
  return reduced;
}

/** Featured product images for the hero rail — real catalog photography. */
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

export default function Hero() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden border-b border-chrome/15 bg-pearl pt-24 sm:pt-28"
    >
      <div className="relative z-[1] mx-auto grid w-full max-w-shell gap-12 px-5 pb-16 pt-6 sm:gap-16 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-24">
        <div data-reveal-group="hero" className="min-w-0">
          <p
            data-reveal
            className="eyebrow-line font-label text-[0.7rem] font-normal uppercase tracking-[0.22em] text-chrome"
          >
            Skin care · Facials · Skin Script
          </p>

          <h1
            data-reveal
            className="mt-6 max-w-xl font-display text-[clamp(2.15rem,5.2vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.01em] text-graphite sm:mt-7"
          >
            Clinical formulations,
            <br />
            <em className="not-italic text-graphite">finished by hand.</em>
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-md font-body text-[1.05rem] font-normal leading-relaxed text-charcoal/80 sm:mt-7"
          >
            Professional Skin Script actives for home, and facials with Emily Mitchener that decide
            which of them you actually need.
          </p>

          <div
            data-reveal
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          >
            <Link
              href="/book"
              className="btn-primary w-full min-h-[48px] px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup sm:w-auto"
            >
              Book a facial
            </Link>
            <Link
              href="/shop"
              className="btn-ghost w-full min-h-[48px] px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup sm:w-auto"
            >
              Shop the collection
            </Link>
          </div>

          <p
            data-reveal
            className="mt-8 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
          >
            Free shipping at $49+ · Licensed aesthetician
          </p>
        </div>

        {/* Product photography rail — no abstract rainbow frames */}
        <div data-reveal className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {HERO_PRODUCTS.map((p, i) => (
              <Link
                key={p.href}
                href={p.href}
                className={`group relative overflow-hidden rounded-[2px] border border-chrome/15 bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
                  i === 1 ? 'mt-6 sm:mt-8' : i === 2 ? 'mt-3 sm:mt-4' : ''
                }`}
              >
                <div className="relative aspect-[52/77] w-full">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 30vw, 200px"
                    className={`object-cover object-center transition-transform duration-700 group-hover:scale-[1.03] ${
                      reduced ? '' : ''
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-5 text-center font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
            Skin Script · Studio packshots
          </p>
        </div>
      </div>
    </section>
  );
}
