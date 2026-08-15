'use client';

import { useState } from 'react';

/**
 * Accessible disclosure list — proper button + aria-expanded/aria-controls.
 * items: [{ id, q, a }]
 */
export default function Accordion({ items = [], idPrefix = 'accordion' }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => {
        const id = `${idPrefix}-${item.id || i}`;
        const panelId = `${id}-panel`;
        const buttonId = `${id}-button`;
        const isOpen = openId === id;
        return (
          <div key={id}>
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-ink sm:py-6"
              >
                <span className="font-display text-lg font-normal text-ink sm:text-xl">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center border border-border text-sm text-muted transition-transform duration-300 ${
                    isOpen ? 'rotate-45 border-ink/40 text-ink' : ''
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6 pr-10 sm:pb-7"
            >
              <p className="max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
