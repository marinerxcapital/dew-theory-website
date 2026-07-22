'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@/lib/products';
import { isShopVisible } from '@/lib/shop';

export default function ShopGrid({ products = [] }) {
  const [category, setCategory] = useState('all');

  // Hide discontinued / inactive from browse
  const catalog = useMemo(
    () => products.filter(isShopVisible),
    [products]
  );

  const filtered = useMemo(() => {
    if (category === 'all') return catalog;
    return catalog.filter((p) => p.category === category);
  }, [catalog, category]);

  const filters = useMemo(() => {
    const present = CATEGORIES.filter((c) => catalog.some((p) => p.category === c));
    return ['all', ...present];
  }, [catalog]);

  const counts = useMemo(() => {
    const map = { all: catalog.length };
    for (const c of CATEGORIES) {
      map[c] = catalog.filter((p) => p.category === c).length;
    }
    return map;
  }, [catalog]);

  if (!products.length) {
    return (
      <div className="glass-1 p-10 text-center" role="status">
        <p className="font-display text-xl font-normal text-graphite">No products yet</p>
        <p className="mx-auto mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
          The collection will appear here once products are added to the catalog.
        </p>
      </div>
    );
  }

  if (!catalog.length) {
    return (
      <div className="glass-1 p-10 text-center" role="status">
        <p className="font-display text-xl font-normal text-graphite">Nothing available</p>
        <p className="mx-auto mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
          All listed items are currently discontinued or inactive.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-2.5 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter by category"
      >
        {filters.map((c) => {
          const active = category === c;
          const n = counts[c] ?? 0;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="shop-product-grid"
              id={`shop-tab-${c === 'all' ? 'all' : c.replace(/\s+/g, '-').toLowerCase()}`}
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
                requestAnimationFrame(() => {
                  document.querySelector('[role="tab"][aria-selected="true"]')?.focus();
                });
              }}
              className="filter-chip shrink-0 whitespace-nowrap rounded-[2px] px-4 py-2.5 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome sm:text-[0.66rem]"
            >
              {c === 'all' ? 'All' : c}
              <span className="ml-1.5 opacity-70" aria-hidden="true">
                {n}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-8 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        aria-live="polite"
      >
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        {category !== 'all' ? ` · ${category}` : ''}
      </p>

      {filtered.length === 0 ? (
        <div
          id="shop-product-grid"
          role="tabpanel"
          className="glass-1 mt-8 p-10 text-center"
        >
          <p className="font-display text-xl font-normal text-graphite">No products in this category</p>
          <p className="mx-auto mt-3 max-w-sm font-body text-sm font-light text-charcoal/70">
            Try another filter, or view the full collection.
          </p>
          <button
            type="button"
            onClick={() => setCategory('all')}
            className="sweep mt-8 border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Show all
          </button>
        </div>
      ) : (
        <div
          id="shop-product-grid"
          role="tabpanel"
          aria-labelledby={`shop-tab-${category === 'all' ? 'all' : category.replace(/\s+/g, '-').toLowerCase()}`}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
          data-reveal-group="shop"
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
