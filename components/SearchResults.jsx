'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { searchStorefront, SEARCH_GROUP_ORDER } from '@/lib/search';

/**
 * Search results.
 *
 * Runs the existing local storefront index (lib/search.js) against the query in
 * the URL, so results are linkable and the back button works. Nothing is
 * hardcoded and there is no invented "popular searches" list — an empty query
 * shows the catalog entry points instead.
 */
export default function SearchResults() {
  const params = useSearchParams();
  const urlQuery = params.get('q') || '';
  const [input, setInput] = useState(urlQuery);

  const query = urlQuery.trim();
  const { groups, total } = useMemo(
    () => searchStorefront(query, { catalog: PRODUCTS, limit: 24 }),
    [query]
  );

  return (
    <div>
      <form action="/search" method="get" role="search" className="border-b border-border pb-4">
        <label className="flex items-center gap-3">
          <span className="sr-only">Search products, ingredients and pages</span>
          <input
            type="search"
            name="q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products, ingredients, pages"
            autoComplete="off"
            className="w-full border-0 bg-transparent py-3 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-normal text-ink placeholder:text-muted focus-visible:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 font-body text-[0.68rem] font-medium uppercase tracking-lockup text-ink"
          >
            Search
          </button>
        </label>
      </form>

      <p
        aria-live="polite"
        className="mt-5 font-body text-[0.72rem] uppercase tracking-eyebrow text-muted"
      >
        {query
          ? `${total} ${total === 1 ? 'result' : 'results'} for “${query}”`
          : 'Enter a term to search the catalog'}
      </p>

      {query && total === 0 ? (
        <div className="mt-10 border-t border-border pt-10">
          <p className="font-display text-[1.5rem] text-ink">Nothing matched that.</p>
          <p className="mt-3 max-w-measure font-body text-[0.96rem] leading-[1.7] text-muted">
            Try a product name, an active, or a concern such as dehydration, congestion or uneven
            tone. You can also browse everything, or shop by skin concern.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="btn-primary inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Shop all products
            </Link>
            <Link
              href="/skin-concerns"
              className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Shop by concern
            </Link>
          </div>
        </div>
      ) : null}

      {SEARCH_GROUP_ORDER.filter((g) => groups[g]?.length).map((group) => (
        <section key={group} className="mt-12">
          <h2 className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            {group}
          </h2>
          <ul className="mt-5 border-t border-border">
            {groups[group].map((item) => (
              <li key={item.id} className="border-b border-border">
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 py-5 transition-opacity hover:opacity-70 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="font-display text-[1.2rem] font-normal leading-snug text-ink">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="font-body text-[0.8rem] uppercase tracking-eyebrow text-muted">
                      {item.subtitle}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!query ? (
        <div className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
          {[
            ['Shop all products', '/shop'],
            ['Shop by skin concern', '/skin-concerns'],
            ['Take the skin quiz', '/skin-quiz']
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="border border-hairline px-6 py-5 font-body text-[0.7rem] font-medium uppercase tracking-lockup text-ink transition-colors hover:bg-surface"
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
