'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';
import { buildSearchIndex, searchStorefront, SEARCH_GROUP_ORDER } from '@/lib/search';

/**
 * Global storefront search combobox — products, services, guides, pages.
 */
export default function GlobalSearch({
  className = '',
  compact = false,
  onNavigate,
  autoFocus = false
} = {}) {
  const router = useRouter();
  const listId = useId();
  const inputId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const index = useMemo(() => buildSearchIndex(PRODUCTS), []);
  const results = useMemo(
    () => searchStorefront(query, { index, limit: 10 }),
    [query, index]
  );

  const flat = results.flat;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const go = useCallback(
    (href) => {
      if (!href) return;
      close();
      setQuery('');
      onNavigate?.();
      router.push(href);
    },
    [close, onNavigate, router]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open, close]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }
    if (!flat.length) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        go(`/shop?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % flat.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = activeIndex >= 0 ? flat[activeIndex] : flat[0];
      if (target) go(target.href);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <label htmlFor={inputId} className="sr-only">
        Search skincare, services, and guides
      </label>
      <div className="relative flex items-center">
        <span
          className="pointer-events-none absolute left-3 text-muted"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={open && (flat.length > 0 || query.trim().length > 0)}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && flat[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined
          }
          autoComplete="off"
          placeholder={compact ? 'Search…' : 'Search skincare, services, concerns…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full rounded-[2px] border border-border bg-surface-light py-2.5 pl-9 pr-3 font-body text-sm text-ink placeholder:text-muted/80 focus:border-ink focus:bg-white focus:outline-none"
        />
      </div>

      {open && query.trim() ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[60] max-h-[min(70vh,28rem)] overflow-y-auto rounded-[2px] border border-border bg-white shadow-card-hover"
        >
          {flat.length === 0 ? (
            <div className="px-4 py-5" role="option" aria-selected="false">
              <p className="font-body text-sm text-charcoal">No matches for “{query.trim()}”.</p>
              <Link
                href="/shop"
                onClick={() => {
                  close();
                  onNavigate?.();
                }}
                className="mt-3 inline-flex font-label text-[0.65rem] uppercase tracking-lockup text-dew"
              >
                View the shop
              </Link>
            </div>
          ) : (
            SEARCH_GROUP_ORDER.filter((g) => results.groups[g]?.length).map((group) => (
              <div key={group} className="border-b border-border last:border-0">
                <p className="px-4 pb-1 pt-3 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                  {group}
                </p>
                <ul>
                  {results.groups[group].map((item) => {
                    const idx = flat.findIndex((f) => f.id === item.id);
                    const active = idx === activeIndex;
                    return (
                      <li key={item.id} role="presentation">
                        <button
                          type="button"
                          id={`${listId}-opt-${idx}`}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => go(item.href)}
                          className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors ${
                            active ? 'bg-dew-soft' : 'hover:bg-surface-light'
                          }`}
                        >
                          <span className="font-body text-sm font-normal text-ink">{item.title}</span>
                          {item.subtitle ? (
                            <span className="mt-0.5 font-label text-[0.6rem] uppercase tracking-lockup text-muted">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
          {flat.length > 0 ? (
            <div className="border-t border-border px-4 py-2.5">
              <button
                type="button"
                onClick={() => go(`/shop?q=${encodeURIComponent(query.trim())}`)}
                className="font-label text-[0.62rem] uppercase tracking-lockup text-ink underline-offset-2 hover:underline"
              >
                View all results in Shop
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
