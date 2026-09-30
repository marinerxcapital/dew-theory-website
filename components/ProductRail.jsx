'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';

/** Custom arrow — drawn, not a default chevron glyph. */
function RailArrow({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
    >
      {direction === 'left' ? (
        <>
          <path d="M15 4.5 8 12l7 7.5" />
          <path d="M8 12h11" />
        </>
      ) : (
        <>
          <path d="M9 4.5 16 12l-7 7.5" />
          <path d="M5 12h11" />
        </>
      )}
    </svg>
  );
}

/**
 * Horizontal product rail.
 *
 * Scroll-snap on the track, custom drawn arrows, and a thin pink scroll-progress
 * bar that reports real scroll position rather than a decorative animation.
 * Arrows disable at the ends, so the control never lies about available travel.
 *
 * @param {{ products?: object[], label?: string, hideHeader?: boolean }} props
 */
export default function ProductRail({ products = [], label = 'Products', hideHeader = false }) {
  const scrollerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max <= 1 ? 1 : Math.min(1, Math.max(0, el.scrollLeft / max));
    setProgress(ratio);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(max <= 1 || el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      // Closed collection details have no layout; measure when they open.
      if (!entry?.contentRect.width) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure, products.length]);

  if (!products.length) return null;

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.82));
    el.scrollBy({ left: dir * amount, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  const arrowClass = (disabled) =>
    `inline-flex h-11 w-11 items-center justify-center border transition-colors duration-200 ${
      disabled
        ? 'cursor-not-allowed border-border text-muted'
        : 'border-border text-ink hover:border-pink hover:text-pink-bright'
    }`;

  return (
    <div className="relative">
      {!hideHeader ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            {label}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              className={arrowClass(atStart)}
              aria-label={`Scroll ${label} left`}
            >
              <RailArrow direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              className={arrowClass(atEnd)}
              aria-label={`Scroll ${label} right`}
            >
              <RailArrow direction="right" />
            </button>
          </div>
        </div>
      ) : (
        <p className="sr-only">{label}</p>
      )}

      <div
        ref={scrollerRef}
        onScroll={measure}
        className="product-rail"
        tabIndex={0}
        role="group"
        aria-label={label}
      >
        {products.map((p, i) => (
          <div key={p.id} className="min-w-0">
            <ProductCard product={p} compact revealIndex={i} priority={false} />
          </div>
        ))}
      </div>

      <div className="mt-4 h-px w-full bg-border" aria-hidden="true">
        <span
          className="block h-px bg-pink transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(8, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
