'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark';

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
  const [lit, setLit] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  // Wordmark light catch — instant under reduced motion, delayed otherwise
  useEffect(() => {
    if (reduced) {
      setLit(true);
      return undefined;
    }
    const t = setTimeout(() => setLit(true), 420);
    return () => clearTimeout(t);
  }, [reduced]);

  // Specular follows pointer only when motion is allowed
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

  // Pause any playing video if preference flips to reduce
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

      {/* Motion: looping video. Reduced: static poster only (no autoplay). */}
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero-poster.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
          aria-hidden="true"
        />
      ) : (
        <video
          className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000 ${
            hasVideo ? 'opacity-40' : 'opacity-0'
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

      <div className="mx-auto grid w-full max-w-shell gap-10 px-5 pb-20 sm:gap-14 sm:px-6 sm:pb-24 lg:grid-cols-[1.05fr_0.85fr] lg:items-center lg:px-10">
        <div data-reveal-group="hero" className="min-w-0">
          <h1 data-reveal>
            <Wordmark
              lit={lit}
              className="block w-full max-w-xl text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.95]"
            />
            <span className="mt-5 block font-display text-[clamp(1.35rem,3.8vw,2.4rem)] font-normal leading-[1.25] text-graphite sm:mt-6">
              Clinical formulations,
              <br />
              finished by hand.
            </span>
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-md font-body text-sm font-light leading-relaxed text-charcoal/75 sm:mt-7 sm:text-base"
          >
            Skin Script actives you can take home, and facials with Emily Mitchener that decide
            which of them you actually need. Two halves of the same routine.
          </p>

          <div data-reveal className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/book"
              className="sweep w-full border border-graphite/70 bg-graphite px-8 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl sm:w-auto sm:px-9"
            >
              Book a facial
            </Link>
            <Link
              href="/shop"
              className="sweep w-full border border-graphite/25 px-8 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal transition-colors duration-300 hover:border-graphite/60 sm:w-auto sm:px-9"
            >
              Shop the collection
            </Link>
          </div>
        </div>

        <div data-reveal className="relative mx-auto hidden aspect-[4/5] w-full max-w-sm md:block">
          <div className="glass-1 absolute inset-0 overflow-hidden rounded-[2px]">
            <div className="iridescent absolute inset-0" aria-hidden="true" />
            {reduced ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/hero-poster.webp"
                alt=""
                className="media-lift relative h-full w-full object-cover"
                aria-hidden="true"
              />
            ) : (
              <video
                className="media-lift relative h-full w-full object-cover"
                src="/hero.mp4"
                poster="/hero-poster.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
            )}
          </div>
          <span aria-hidden="true" className="absolute -bottom-px left-8 right-8 h-px bg-pearl/90" />
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-chrome/50"
      />
    </section>
  );
}
