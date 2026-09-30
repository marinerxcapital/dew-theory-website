'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { IconArrowRight } from './Icons';
import { productImageAlt, productImageSrc } from '@/lib/product-image';
import { formatMoney } from '@/lib/shipping';

/**
 * Pearl editorial hero — the DT-01 composition.
 *
 * Left: an oversized didone headline, a tracked uppercase support line, and one
 * filled plus one outlined action. Right: a real catalog product standing on a
 * restrained refraction field (light through glass, not a gradient panel).
 *
 * The product record is passed from the server page, so name, category, price
 * and image are never hardcoded. The reveal is scoped to `.js-motion` (set by
 * MotionRoot only when motion is enabled), so with JS disabled or
 * reduced-motion on the copy is plain and visible.
 *
 * @param {{ product?: object }} props
 */
export default function Hero({ product = null }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reveal = () => {
      root.querySelectorAll('[data-reveal-blur]').forEach((el) => {
        el.dataset.revealed = 'true';
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return undefined;
    }

    // Two frames so the hidden initial state is committed before the reveal
    // transition runs — otherwise the browser collapses both states into a
    // single paint and the blur-to-sharp never renders.
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(reveal);
    });

    return () => {
      window.cancelAnimationFrame(outer);
      if (inner) window.cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden border-b border-border bg-void"
      aria-label="Dew Theory"
    >
      {/* Light the product performs in — glass wash, spectral streaks, a bright
          bloom behind the bottle, and a soft shadow beneath it. Decorative. */}
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art__glass" />
        <div className="hero-art__streak" />
        <div
          className="hero-art__bloom"
          style={{ right: '6%', top: '14%', width: '34rem', height: '34rem' }}
        />
        <div
          className="hero-art__shadow"
          style={{ bottom: '4%', width: '26rem', height: '3.25rem' }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent to-void"
        aria-hidden="true"
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-shell items-center gap-12 px-5 pb-14 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-20 lg:pt-14">
        {/* Copy — columns 1–6 */}
        <div className="min-w-0 lg:col-span-6">
          <p
            data-reveal-blur
            className="reveal-blur font-body text-micro font-medium uppercase tracking-eyebrow text-muted"
          >
            Professional skincare · personalized
          </p>

          <h1 className="mt-5 font-display font-normal leading-[0.92] tracking-hero text-ink">
            <span
              data-reveal-blur
              style={{ transitionDelay: '80ms' }}
              className="reveal-blur block"
            >
              Your skin.
            </span>
            <span
              data-reveal-blur
              style={{ transitionDelay: '180ms' }}
              className="reveal-blur block"
            >
              Understood.
            </span>
          </h1>

          <p
            data-reveal-blur
            style={{ transitionDelay: '280ms' }}
            className="reveal-blur mt-6 max-w-md font-body text-[1.0625rem] font-normal leading-[1.65] text-muted"
          >
            Personalized skincare guidance for real skin, and intentional routines that work.
          </p>

          <div
            data-reveal-blur
            style={{ transitionDelay: '380ms' }}
            className="reveal-blur mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
          >
            <Link prefetch={false}
              href="/virtual-consultation"
              className="btn-primary inline-flex w-full min-h-[56px] items-center justify-center gap-3 px-9 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup sm:w-auto"
            >
              Start a consultation
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link prefetch={false}
              href="/shop"
              className="btn-ghost inline-flex w-full min-h-[56px] items-center justify-center gap-3 px-9 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup sm:w-auto"
            >
              Shop skincare
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Product — columns 7–12 */}
        {product ? (
          <div className="relative lg:col-span-6 lg:col-start-7">
            <div className="relative mx-auto w-[min(78vw,24rem)] lg:mx-0 lg:ml-auto lg:w-[min(34vw,30rem)]">
              <div className="relative overflow-hidden" style={{ aspectRatio: '52 / 77' }}>
                <Image
                  src={productImageSrc(product)}
                  alt={productImageAlt(product)}
                  fill
                  priority
                  fetchPriority="high"
                  decoding="async"
                  sizes="(max-width: 1023px) 78vw, 34vw"
                  quality={85}
                  className="object-contain"
                />
              </div>

              <Link prefetch={false}
                href={`/shop/${product.id}`}
                data-reveal-blur
                style={{ transitionDelay: '520ms' }}
                className="reveal-blur mt-6 flex w-full items-baseline justify-between gap-4 border-t border-hairline pt-4 transition-opacity hover:opacity-70"
              >
                <span>
                  <span className="block font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                    {product.category}
                  </span>
                  <span className="mt-1.5 block font-display text-[1.35rem] font-normal leading-snug text-ink">
                    {product.name}
                  </span>
                </span>
                <span className="shrink-0 font-body text-[0.8rem] font-medium text-ink">
                  {formatMoney(product.retail_price)}
                </span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
