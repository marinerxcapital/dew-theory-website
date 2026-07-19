'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@/lib/products';

export default function ShopGrid({ products }) {
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  const filters = ['all', ...CATEGORIES.filter((c) => products.some((p) => p.category === c))];

  return (
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-chrome/20 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-8 [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter by category"
      >
        {filters.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setCategory(c)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const idx = filters.indexOf(c);
                const next =
                  e.key === 'ArrowRight'
                    ? filters[(idx + 1) % filters.length]
                    : filters[(idx - 1 + filters.length) % filters.length];
                setCategory(next);
                // Focus moves with selection on next paint via re-render of active tab
                requestAnimationFrame(() => {
                  const el = document.querySelector(`[role="tab"][aria-selected="true"]`);
                  el?.focus();
                });
              }}
              className={`shrink-0 whitespace-nowrap px-3 py-2 font-label text-[0.62rem] font-light uppercase tracking-lockup transition-colors sm:px-4 sm:text-[0.66rem] ${
                active
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-chrome hover:text-charcoal'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          );
        })}
      </div>

      <p className="mt-8 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>

      <div
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-reveal-group="shop"
      >
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
