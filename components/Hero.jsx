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

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    let frame = 0;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sweep-x', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--sweep-y', `${((e.clientY - r.top) / r.height) * 100}%`);
        frame = 0;
      });
    };

    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  useEffect(() => {
    if (!reduced) return;
    ref.current?.querySelectorAll('video').forEach((v) => {
      v.pause();
      v.removeAttribute('autoplay');
    });
    setHasVideo(false);
  }, [reduced]);

  return (
    <section
      ref={ref}
      className={`relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 ${
        reduced ? '' : 'specular'
      }`}
    >
      {/* Plane 1 — ambient material */}
      <div className="iridescent absolute inset-0 -z-20" aria-hidden="true" />

      {reduced ? (
        <Image
          src="/hero-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover opacity-45"
          aria-hidden="true"
        />
      ) : (
        <video
          className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000 ${
            hasVideo ? 'opacity-45' : 'opacity-0'
          }`}
          src="/hero.mp4"
          poster="/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
        />
      )}

      <div className="glass-2 absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-vignette absolute inset-0 -z-[5]" aria-hidden="true" />

      <div className="relative z-[1] mx-auto grid w-full max-w-shell gap-12 px-5 pb-24 sm:gap-16 sm:px-6 sm:pb-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-10">
        <div data-reveal-group="hero" className="min-w-0">
          <p
            data-reveal
            className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            Skin care · Studio · Skin Script
          </p>

          <h1
            data-reveal
            className="mt-7 max-w-lg font-display text-[clamp(1.75rem,5vw,2.85rem)] font-normal leading-[1.18] text-graphite sm:mt-8"
          >
            Clinical formulations,
            <br />
            <em className="not-italic text-graphite/90">finished by hand.</em>
          </h1>

          <p
            data-reveal
            className="mt-7 max-w-md font-body text-sm font-light leading-relaxed text-charcoal/78 sm:mt-8 sm:text-[1.05rem] sm:leading-relaxed"
          >
            Skin Script actives you can take home, and facials with Emily Mitchener that decide
            which of them you actually need. Two halves of the same routine.
          </p>

          <div
            data-reveal
            className="mt-9 flex w-full flex-col gap-3 sm:mt-11 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <Link
              href="/book"
              className="sweep btn-primary w-full px-9 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup sm:w-auto"
            >
              Book a facial
            </Link>
            <Link
              href="/shop"
              className="sweep btn-ghost w-full px-9 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup sm:w-auto"
            >
              Shop the collection
            </Link>
          </div>
        </div>

        {/* Portrait glass column — chrome frame, poster only (no second video) */}
        <div data-reveal className="relative mx-auto hidden w-full max-w-md md:block">
          <div
            className="pointer-events-none absolute -inset-6 -z-10 opacity-70"
            aria-hidden="true"
          >
            <div className="absolute inset-8 rounded-full bg-ice/30 blur-3xl" />
            <div className="absolute bottom-4 right-0 h-40 w-40 rounded-full bg-blush/25 blur-3xl" />
          </div>

          <div className="chrome-frame relative aspect-[4/5] w-full overflow-hidden rounded-[3px]">
            <div className="glass-1 absolute inset-0 overflow-hidden rounded-[3px]">
              <div className="iridescent absolute inset-0" aria-hidden="true" />
              <Image
                src="/hero-poster.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 0px, 420px"
                className="media-lift object-cover"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite/25 via-transparent to-pearl/20"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="absolute -bottom-5 left-6 right-6 flex items-center justify-between gap-4">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent via-chrome/50 to-transparent"
            />
            <p className="shrink-0 font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
              In studio
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent via-chrome/50 to-transparent"
            />
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="scroll-cue pointer-events-none absolute bottom-8 left-1/2 h-12 w-px -translate-x-1/2"
      />
    </section>
  );
}
