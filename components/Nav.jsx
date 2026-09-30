'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark';
import AnnouncementBar from './AnnouncementBar';
import dynamic from 'next/dynamic';
import { IconAccount, IconBag, IconClose, IconMenu, IconSearch } from './Icons';
import { useCart } from '@/components/CartProvider';
import { BAG_ADDED_EVENT } from '@/components/bag-signal';
const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false });

/**
 * Public shell header, rebuilt to the approved pearl/editorial mockups:
 * wordmark left, centerd primary navigation, hairline utility icons right,
 * one slim rule beneath. Transparent over the hero, solid ivory on scroll.
 *
 * Existing behaviour is preserved: accessible mobile drawer with focus trap and
 * Escape handling, body scroll lock, bag count with the add-to-bag pop, the
 * global search panel, and the admin short-circuit.
 */

/* The primary navigation. Where the mockups propose a route that already exists
   under a live, indexed URL (consultation, routines), the live URL is kept and
   only the label changes — no route churn, no redirect needed. */
const PRIMARY_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/skin-concerns', label: 'Skin Concerns' },
  { href: '/routine', label: 'Routines' },
  { href: '/virtual-consultation', label: 'Consultation' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' }
];

/* Secondary links shown only in the mobile drawer, where the header rail cannot
   carry them. Keeps every destination reachable on a small screen. */
const MOBILE_SECONDARY = [
  { href: '/ingredients', label: 'Ingredients' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/skin-quiz', label: 'Skin quiz' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/help', label: 'Help' },
  { href: '/contact', label: 'Contact' }
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bagPop, setBagPop] = useState(false);
  const { count, hydrated } = useCart();
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);
  const panelRef = useRef(null);
  const bagPopTimer = useRef(0);

  /* Nav sits transparent over the hero and solidifies on scroll — not always on. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Bag badge bounce when something lands in the bag. */
  useEffect(() => {
    const onAdded = () => {
      setBagPop(true);
      window.clearTimeout(bagPopTimer.current);
      bagPopTimer.current = window.setTimeout(() => setBagPop(false), 460);
    };
    window.addEventListener(BAG_ADDED_EVENT, onAdded);
    return () => {
      window.removeEventListener(BAG_ADDED_EVENT, onAdded);
      window.clearTimeout(bagPopTimer.current);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open && !searchOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, searchOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);


  const isCurrent = (href) => pathname === href || (href !== '/' && pathname?.startsWith(href));
  const bagLabel =
    hydrated && count > 0 ? `Shopping bag, ${count} item${count === 1 ? '' : 's'}` : 'Shopping bag';

  return (
    <header data-nav data-state={scrolled ? 'solid' : 'clear'} className="sticky top-0 z-50">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <AnnouncementBar />

      <div
        className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? 'border-b border-border bg-void/90 backdrop-blur-xl supports-[backdrop-filter]:bg-void/75'
            : 'border-b border-border bg-void/75 backdrop-blur-xl'
        }`}
      >
        <div className="relative mx-auto flex h-[4.25rem] max-w-shell items-center px-5 sm:px-6 lg:h-[5rem] lg:px-10">
          <Link prefetch={false}
            href="/"
            aria-label="Dew Theory, home"
            className="nav-logo relative flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
          >
            <Wordmark
              src="/logo-dewtheory-glass-wordmark-transparent.png"
              priority
              className="h-[2.2rem] w-[10rem] sm:h-[2.55rem] sm:w-[11.75rem] lg:h-[3rem] lg:w-[13.4rem]"
            />
          </Link>

          {/*
            Centred with flex rather than absolute positioning: an absolutely
            centerd rail overlaps the wordmark and squeezes its own items once
            the six labels plus the utility icons no longer fit, which wrapped
            "Skin Concerns" onto two lines at 1280px. A flex-1 track can only
            take the space actually available, and the labels never wrap.
          */}
          <nav
            aria-label="Primary"
            className="hidden min-w-0 flex-1 items-center justify-center gap-5 xl:flex xl:gap-8"
          >
            {PRIMARY_LINKS.map((l) => (
              <Link prefetch={false}
                key={l.href}
                href={l.href}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
                className="nav-link relative whitespace-nowrap font-label text-[0.62rem] font-medium uppercase tracking-lockup text-ink transition-opacity duration-200 hover:opacity-70 xl:text-[0.68rem]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5 lg:ml-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setOpen(false);
              }}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              aria-label="Search"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
            >
              <IconSearch className="h-[1.15rem] w-[1.15rem]" />
            </button>

            <Link prefetch={false}
              href="/account"
              aria-label="Account"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60 sm:inline-flex"
            >
              <IconAccount className="h-[1.15rem] w-[1.15rem]" />
            </Link>

            <Link prefetch={false}
              href="/cart"
              aria-label="Bag"
              className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
            >
              <IconBag className={`h-[1.15rem] w-[1.15rem] ${bagPop ? 'animate-bag-pop' : ''}`} />
              {hydrated && count > 0 ? (
                <span className="absolute right-0.5 top-1.5 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-green-300 px-1 py-[1px] text-[0.55rem] font-semibold leading-none text-ink">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => {
                setOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60 xl:hidden"
            >
              {open ? (
                <IconClose className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <IconMenu className="h-[1.2rem] w-[1.2rem]" />
              )}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div id="site-search" className="border-t border-border bg-void px-5 py-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-shell">
              <Suspense fallback={<div className="h-12 border-b border-border" />}>
                <GlobalSearch autoFocus onNavigate={() => setSearchOpen(false)} />
              </Suspense>
            </div>
          </div>
        ) : null}
      </div>

      {open && (
        <nav
          id="mobile-nav"
          ref={panelRef}
          aria-label="Primary, mobile"
          className="h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain border-b border-border bg-void xl:hidden"
        >
          <div className="flex flex-col px-5 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {PRIMARY_LINKS.map((l, i) => (
              <Link prefetch={false}
                key={l.href}
                href={l.href}
                ref={i === 0 ? firstLinkRef : undefined}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
                className="border-b border-border py-4 font-display text-[1.5rem] font-normal leading-none text-ink"
              >
                {l.label}
              </Link>
            ))}

            <p className="pt-7 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
              More
            </p>
            {MOBILE_SECONDARY.map((l) => (
              <Link prefetch={false}
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 font-body text-sm text-charcoal last:border-0"
              >
                {l.label}
              </Link>
            ))}

          </div>
        </nav>
      )}
    </header>
  );
}
