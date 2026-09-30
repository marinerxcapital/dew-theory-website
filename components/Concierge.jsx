'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const ACTIONS = [
  {
    href: '/skin-quiz',
    eyebrow: '2 minutes',
    title: 'Take the skin quiz',
    body: 'Four questions, one clear place to start.'
  },
  {
    href: '/routine',
    eyebrow: 'AM + PM',
    title: 'Build my routine',
    body: 'Layer a morning and evening path in the right order.'
  },
  {
    href: '/virtual-consultation',
    eyebrow: '1:1 · Zoom',
    title: 'Talk to Emily',
    body: 'A personal read and a plan built around your skin.'
  },
  {
    href: '/shop',
    eyebrow: 'Browse',
    title: 'Shop by concern',
    body: 'Filter the collection by what your skin actually needs.'
  }
];

/**
 * Persistent, lightweight guidance surface. Not a chatbot.
 * Unobtrusive, keyboard-accessible, and kept clear of checkout controls.
 */
export default function Concierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /*
   * The approved mockups have no floating widget, and pinned to the first
   * viewport this one sat on top of real content (the shop trust strip). It now
   * appears only once the visitor has moved past the opening screen, which
   * keeps the surface available without intruding on the composition.
   */
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Keep the helper off admin and the high-intent checkout surface.
  if (pathname?.startsWith('/admin')) return null;
  if (pathname === '/cart' || pathname?.startsWith('/cart/')) return null;

  return (
    <div
      className={
        'fixed bottom-[5.5rem] right-4 z-40 transition-opacity duration-300 lg:bottom-8 lg:right-8 ' +
        (visible || open ? 'opacity-100' : 'pointer-events-none opacity-0')
      }
      aria-hidden={visible || open ? undefined : true}
      inert={visible || open ? undefined : true}
    >
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Need help choosing?"
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-border bg-white shadow-card-hover"
        >
          <div className="spectral-wash px-5 py-5">
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
              Dew Theory concierge
            </p>
            <p className="mt-2 font-display text-xl font-normal leading-snug text-ink">
              Need help choosing?
            </p>
            <p className="mt-2 font-body text-sm font-normal leading-relaxed text-muted">
              Emily has already done the filtering for you. Pick how you want to be guided.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {ACTIONS.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-[56px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ivory"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-label text-[0.55rem] font-normal uppercase tracking-lockup text-muted">
                      {a.eyebrow}
                    </span>
                    <span className="mt-0.5 block font-display text-base font-normal leading-snug text-ink">
                      {a.title}
                    </span>
                    <span className="mt-0.5 block font-body text-xs font-normal leading-relaxed text-muted">
                      {a.body}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-muted transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="btn-primary inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-3 font-label text-[0.62rem] font-normal uppercase tracking-lockup shadow-card"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-2 rounded-full bg-ivory/80"
          />
          Need help choosing?
        </button>
      )}
    </div>
  );
}
