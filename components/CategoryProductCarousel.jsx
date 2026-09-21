'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';

/**
 * Premium rotating product-card carousel: LEFT / CENTER / RIGHT ring.
 * Deterministic circular indices; never clones the same product into two visible slots.
 */
export default function CategoryProductCarousel({
  products = [],
  categoryLabel = 'Products',
  autoIntervalMs = 6000
}) {
  const list = useMemo(() => (Array.isArray(products) ? products.filter(Boolean) : []), [products]);
  const n = list.length;
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const statusId = `${reactId}-status`;
  const rootRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mod = useCallback((i) => (n === 0 ? 0 : ((i % n) + n) % n), [n]);

  const goNext = useCallback(() => {
    if (n < 2) return;
    setIndex((i) => mod(i + 1));
  }, [mod, n]);

  const goPrev = useCallback(() => {
    if (n < 2) return;
    setIndex((i) => mod(i - 1));
  }, [mod, n]);

  useEffect(() => {
    if (n < 2 || paused || reduceMotion || !inView) return undefined;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return undefined;
    const t = window.setInterval(goNext, autoIntervalMs);
    return () => window.clearInterval(t);
  }, [autoIntervalMs, goNext, inView, n, paused, reduceMotion]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') setPaused(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const pauseForUser = useCallback(() => {
    setPaused(true);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (n < 2) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        pauseForUser();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseForUser();
        goPrev();
      }
    },
    [goNext, goPrev, n, pauseForUser]
  );

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const start = touchStartX.current;
    const end = e.changedTouches?.[0]?.clientX;
    touchStartX.current = null;
    if (start == null || end == null || n < 2) return;
    const dx = end - start;
    if (Math.abs(dx) < 40) return;
    pauseForUser();
    if (dx < 0) goNext();
    else goPrev();
  };

  if (n === 0) return null;

  // Slot assignment — never show same product twice
  let slots = [];
  if (n === 1) {
    slots = [{ role: 'center', product: list[0], key: list[0].id }];
  } else if (n === 2) {
    slots = [
      { role: 'left', product: list[mod(index)], key: `${list[mod(index)].id}-a` },
      { role: 'center', product: list[mod(index + 1)], key: `${list[mod(index + 1)].id}-b` }
    ];
  } else {
    const center = list[mod(index)];
    const left = list[mod(index - 1)];
    const right = list[mod(index + 1)];
    slots = [
      { role: 'left', product: left, key: left.id },
      { role: 'center', product: center, key: center.id },
      { role: 'right', product: right, key: right.id }
    ];
  }

  const statusText =
    n === 0
      ? ''
      : `Showing ${list[mod(index)].name} (${mod(index) + 1} of ${n}) in ${categoryLabel}`;

  return (
    <section
      ref={rootRef}
      className="category-product-carousel relative"
      aria-labelledby={labelId}
      aria-roledescription="carousel"
      onMouseEnter={pauseForUser}
      onFocusCapture={pauseForUser}
      onPointerDown={pauseForUser}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={labelId} className="font-display text-2xl font-normal text-ink sm:text-3xl">
            {categoryLabel}
          </h2>
          <p className="mt-1 font-body text-sm text-muted">
            {n} product{n === 1 ? '' : 's'}
          </p>
        </div>
        {n > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-dew-outline px-3 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
              onClick={() => {
                pauseForUser();
                goPrev();
              }}
              aria-label={`Previous ${categoryLabel} product`}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn-dew-outline px-3 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
              onClick={() => {
                pauseForUser();
                goNext();
              }}
              aria-label={`Next ${categoryLabel} product`}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="relative mx-auto h-[min(34rem,72vw)] max-w-4xl"
        aria-live="polite"
        aria-atomic="true"
      >
        <p id={statusId} className="sr-only">
          {statusText}
        </p>
        {slots.map(({ role, product, key }) => (
          <div
            key={key}
            data-slot={role}
            className={`carousel-slot absolute inset-y-0 left-1/2 w-[min(18rem,78%)] ${
              reduceMotion ? 'transition-none' : 'transition-[transform,opacity] duration-500 ease-out'
            }`}
            style={slotStyle(role, n)}
            aria-hidden={role !== 'center'}
          >
            <ProductCard
              product={product}
              compact
              showQuickAdd={role === 'center'}
              priority={role === 'center'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function slotStyle(role, n) {
  if (n === 1) {
    return { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 };
  }
  if (n === 2) {
    if (role === 'left') {
      return { transform: 'translateX(-95%) scale(0.88)', opacity: 0.72, zIndex: 2 };
    }
    return { transform: 'translateX(-20%) scale(1)', opacity: 1, zIndex: 3 };
  }
  switch (role) {
    case 'left':
      return { transform: 'translateX(-115%) scale(0.88)', opacity: 0.72, zIndex: 2 };
    case 'right':
      return { transform: 'translateX(15%) scale(0.88)', opacity: 0.72, zIndex: 2 };
    case 'center':
    default:
      return { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 };
  }
}
