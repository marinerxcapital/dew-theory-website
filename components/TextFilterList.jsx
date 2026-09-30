'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

/**
 * A searchable, typographic list.
 *
 * Used by the ingredient library and anywhere else that needs a quiet filter
 * over a real dataset. No fuzzy magic and no invented "trending" terms: it
 * filters the items it is given, and shows an honest empty state when nothing
 * matches.
 *
 * @param {{
 *   items: Array<{ key: string, title: string, subtitle?: string, href?: string, meta?: string }>,
 *   placeholder?: string,
 *   label?: string,
 *   emptyMessage?: string
 * }} props
 */
export default function TextFilterList({
  items,
  placeholder = 'Search',
  label = 'Search',
  emptyMessage = 'Nothing matches that yet.'
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    const tokens = needle.split(/\s+/).filter(Boolean);
    return items.filter((it) => {
      const hay = `${it.title} ${it.subtitle || ''} ${it.meta || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [items, q]);

  return (
    <div>
      <div className="border-b border-border pb-4">
        <label className="flex items-center gap-3">
          <span className="sr-only">{label}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full border-0 bg-transparent py-3 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-normal text-ink placeholder:text-muted focus-visible:outline-none"
          />
        </label>
      </div>

      <p aria-live="polite" className="mt-4 font-body text-[0.72rem] uppercase tracking-eyebrow text-muted">
        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        {q.trim() ? ` matching “${q.trim()}”` : ''}
      </p>

      {filtered.length ? (
        <ul className="mt-6 border-t border-border">
          {filtered.map((it) => (
            <li key={it.key} className="border-b border-border">
              <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                <div className="min-w-0">
                  <h2 className="font-display text-[1.25rem] font-normal leading-snug text-ink">
                    {it.href ? (
                      <Link
                        href={it.href}
                        className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-ink"
                      >
                        {it.title}
                      </Link>
                    ) : (
                      it.title
                    )}
                  </h2>
                  {it.subtitle ? (
                    <p className="mt-2 max-w-measure font-body text-[0.94rem] leading-[1.7] text-muted">
                      {it.subtitle}
                    </p>
                  ) : null}
                </div>
                {it.meta ? (
                  <p className="shrink-0 font-body text-[0.72rem] uppercase tracking-eyebrow text-muted">
                    {it.meta}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 font-body text-[0.98rem] text-muted">{emptyMessage}</p>
      )}
    </div>
  );
}
