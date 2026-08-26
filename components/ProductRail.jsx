'use client';

import { useRef } from 'react';
import ProductCard from '@/components/ProductCard';

/**
 * Horizontal product rail with accessible prev/next controls.
 */
export default function ProductRail({ products = [], label = 'Products' }) {
  const scrollerRef = useRef(null);

  if (!products.length) return null;

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="sr-only">{label}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="inline-flex h-10 w-10 items-center justify-center border border-border bg-white text-ink hover:border-ink"
            aria-label={`Scroll ${label} left`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="inline-flex h-10 w-10 items-center justify-center border border-border bg-white text-ink hover:border-ink"
            aria-label={`Scroll ${label} right`}
          >
            ›
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="product-rail" tabIndex={0} aria-label={label}>
        {products.map((p, i) => (
          <div key={p.id} className="min-w-0">
            <ProductCard product={p} compact revealIndex={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
