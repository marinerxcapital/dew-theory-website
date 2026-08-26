'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  SORT_OPTIONS,
  collectConcerns,
  collectSkinTypes,
  presentCategories,
  filterProducts,
  sortProducts,
  parseShopParams,
  shopStateToParams,
  countActiveFilters
} from '@/lib/shop-filters';
import { isShopVisible } from '@/lib/shop';
import { searchStorefront } from '@/lib/search';

function emptyState(filters, clearAll) {
  return (
    <div
      id="shop-product-grid"
      className="mt-6 rounded-[2px] border border-border bg-white p-10 text-center sm:mt-8"
      role="status"
    >
      <p className="font-display text-xl font-normal text-ink">No products match</p>
      <p className="mx-auto mt-3 max-w-sm font-body text-sm font-normal text-muted">
        Try clearing filters, or let the Skin Quiz suggest a sequence.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={clearAll}
          className="btn-primary px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
        >
          Clear filters
        </button>
        <Link
          href="/quiz"
          className="btn-dew-outline px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
        >
          Skin Quiz
        </Link>
      </div>
    </div>
  );
}

export default function ShopGrid({ products = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const catalog = useMemo(() => products.filter(isShopVisible), [products]);
  const categories = useMemo(() => presentCategories(catalog), [catalog]);
  const concerns = useMemo(() => collectConcerns(catalog), [catalog]);
  const skinTypes = useMemo(() => collectSkinTypes(catalog), [catalog]);

  const state = useMemo(() => parseShopParams(searchParams), [searchParams]);
  const q = searchParams.get('q') || '';

  const filtered = useMemo(() => {
    let list = filterProducts(catalog, state);
    if (q.trim()) {
      const { flat } = searchStorefront(q, { catalog, limit: 50 });
      const ids = new Set(
        flat.filter((i) => i.kind === 'product').map((i) => i.href.replace('/shop/', ''))
      );
      // Also include products whose name matches even if search groups oddly
      list = list.filter(
        (p) =>
          ids.has(p.id) ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.description_short || '').toLowerCase().includes(q.toLowerCase())
      );
    }
    return sortProducts(list, state.sort);
  }, [catalog, state, q]);

  const activeCount = countActiveFilters(state) + (q ? 1 : 0);

  const pushState = useCallback(
    (next) => {
      const params = shopStateToParams(next);
      if (q) params.set('q', q);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, q, router]
  );

  const clearAll = () => {
    router.push(pathname, { scroll: false });
    setDrawerOpen(false);
  };

  const setFilter = (key, value) => {
    const next = { ...state, [key]: value || '' };
    pushState(next);
  };

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  if (!products.length) {
    return (
      <div className="rounded-[2px] border border-border bg-white p-10 text-center" role="status">
        <p className="font-display text-xl font-normal text-ink">No products yet</p>
        <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted">
          The collection will appear here once products are added to the catalog.
        </p>
      </div>
    );
  }

  if (!catalog.length) {
    return (
      <div className="rounded-[2px] border border-border bg-white p-10 text-center" role="status">
        <p className="font-display text-xl font-normal text-ink">Nothing available</p>
        <p className="mx-auto mt-3 max-w-md font-body text-sm text-muted">
          All listed items are currently discontinued or inactive.
        </p>
      </div>
    );
  }

  const FilterFields = ({ idPrefix = 'desk' }) => (
    <div className="space-y-8">
      <fieldset>
        <legend className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
          Product type
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!state.type}
            onClick={() => setFilter('type', '')}
            className="filter-chip rounded-[2px] px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-muted"
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={`${idPrefix}-type-${c}`}
              type="button"
              aria-pressed={state.type === c}
              onClick={() => setFilter('type', state.type === c ? '' : c)}
              className="filter-chip rounded-[2px] px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-muted"
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
          Skin concern
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {concerns.map((c) => (
            <button
              key={`${idPrefix}-concern-${c}`}
              type="button"
              aria-pressed={state.concern === c}
              onClick={() => setFilter('concern', state.concern === c ? '' : c)}
              className="filter-chip rounded-[2px] px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-muted"
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
          Skin type
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {skinTypes.map((s) => (
            <button
              key={`${idPrefix}-skin-${s}`}
              type="button"
              aria-pressed={state.skin === s}
              onClick={() => setFilter('skin', state.skin === s ? '' : s)}
              className="filter-chip rounded-[2px] px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-muted"
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
          Routine time
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: '', label: 'Any' },
            { id: 'am', label: 'AM' },
            { id: 'pm', label: 'PM' }
          ].map((t) => (
            <button
              key={`${idPrefix}-time-${t.id || 'any'}`}
              type="button"
              aria-pressed={state.time === t.id || (!state.time && !t.id)}
              onClick={() => setFilter('time', t.id)}
              className="filter-chip rounded-[2px] px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-muted"
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );

  const chips = [];
  if (q) chips.push({ key: 'q', label: `Search: ${q}`, clear: () => {
    const params = shopStateToParams(state);
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }});
  if (state.type) chips.push({ key: 'type', label: state.type, clear: () => setFilter('type', '') });
  if (state.concern)
    chips.push({ key: 'concern', label: state.concern, clear: () => setFilter('concern', '') });
  if (state.skin) chips.push({ key: 'skin', label: state.skin, clear: () => setFilter('skin', '') });
  if (state.time)
    chips.push({
      key: 'time',
      label: state.time.toUpperCase(),
      clear: () => setFilter('time', '')
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          {activeCount ? ` · ${activeCount} filter${activeCount === 1 ? '' : 's'}` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost px-4 py-2.5 font-label text-[0.62rem] uppercase tracking-lockup lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
          >
            Filter{activeCount ? ` (${activeCount})` : ''}
          </button>
          <label className="flex items-center gap-2">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">
              Sort
            </span>
            <select
              value={state.sort || 'featured'}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="min-h-[40px] rounded-[2px] border border-border bg-white px-3 py-2 font-body text-sm text-ink"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-2 rounded-full border border-dew/30 bg-dew-soft px-3 py-1.5 font-label text-[0.58rem] uppercase tracking-lockup text-dew-dark"
            >
              {c.label}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove {c.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="font-label text-[0.58rem] uppercase tracking-lockup text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[8.5rem]">
            <FilterFields idPrefix="desk" />
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="mt-8 font-label text-[0.62rem] uppercase tracking-lockup text-dew underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        </aside>

        <div>
          {filtered.length === 0
            ? emptyState(state, clearAll)
            : (
              <div
                id="shop-product-grid"
                className="content-auto grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
                data-reveal-group="shop"
              >
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} revealIndex={i} />
                ))}
              </div>
            )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[8px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card-hover">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-2xl text-ink">Filter</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] px-2 font-label text-[0.65rem] uppercase tracking-lockup"
              >
                Done
              </button>
            </div>
            <FilterFields idPrefix="mobile" />
            <button
              type="button"
              onClick={clearAll}
              className="btn-ghost mt-8 w-full py-3 font-label text-[0.65rem] uppercase tracking-lockup"
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
