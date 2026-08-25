'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark';
import AnnouncementBar from './AnnouncementBar';
import CategoryNav from './CategoryNav';
import GlobalSearch from './GlobalSearch';
import { useCart } from '@/components/CartProvider';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/quiz', label: 'Skin Quiz' },
  { href: '/routine', label: 'Routine' },
  { href: '/services', label: 'Services' },
  { href: '/virtual-consultation', label: 'Virtual Consult' },
  { href: '/about', label: 'Emily' },
  { href: '/membership', label: 'Membership' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' }
];

const categoryLinks = [
  { href: '/shop?type=Cleanser', label: 'Cleansers' },
  { href: '/shop?type=Toner', label: 'Toners' },
  { href: '/shop?type=Serum', label: 'Serums' },
  { href: '/shop?type=Exfoliant', label: 'Exfoliants' },
  { href: '/shop?type=Moisturizer', label: 'Moisturizers' },
  { href: '/shop?type=Mask', label: 'Masks' },
  { href: '/shop?type=SPF', label: 'SPF' },
  { href: '/shop?type=Lip Treatment', label: 'Lip Care' }
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, hydrated } = useCart();
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);
  const panelRef = useRef(null);

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
    if (!open) return;
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

  if (pathname?.startsWith('/admin')) return null;

  const mobileLinks = [...links, { href: '/book', label: 'Book a facial' }];

  return (
    <header
      data-nav
      data-state="frosted"
      className="sticky top-0 z-50 transition-[background,border-color] duration-300"
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <AnnouncementBar />

      <div className="border-b border-border bg-ivory/95">
        <div className="mx-auto flex max-w-shell items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            aria-label="Dew Theory, home"
            className="nav-logo relative flex shrink-0 items-center transition-opacity duration-300 hover:opacity-85"
          >
            <Wordmark
              src="/logo-mark.webp"
              priority
              className="h-8 w-auto max-w-[10rem] object-contain object-left sm:h-9 sm:max-w-[12rem] lg:h-10 lg:max-w-[13rem]"
            />
          </Link>

          <div className="mx-4 hidden min-w-0 flex-1 lg:block">
            <Suspense fallback={<div className="h-10 rounded-[2px] bg-surface-light" />}>
              <GlobalSearch />
            </Suspense>
          </div>

          <nav aria-label="Primary utilities" className="ml-auto hidden items-center gap-5 lg:flex xl:gap-6">
            <Link
              href="/book"
              className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-forest transition-colors hover:text-sage-deep"
            >
              Book
            </Link>
            <Link
              href="/virtual-consultation"
              className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-forest transition-colors hover:text-sage-deep"
            >
              Virtual Consult
            </Link>
            <Link
              href="/cart"
              aria-current={pathname === '/cart' ? 'page' : undefined}
              className="inline-flex items-center font-label text-[0.68rem] font-normal uppercase tracking-lockup text-forest"
            >
              Bag
              {hydrated && count > 0 ? (
                <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-[0.55rem] font-normal leading-none text-ivory">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setOpen(false);
              }}
              aria-expanded={searchOpen}
              aria-controls="mobile-search"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest"
            >
              Search
            </button>
            <Link
              href="/cart"
              className="inline-flex min-h-[44px] items-center px-1 font-label text-[0.65rem] uppercase tracking-lockup text-forest"
            >
              Bag
              {hydrated && count > 0 ? (
                <span className="ml-1.5 inline-flex min-w-[1.2rem] items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-[0.55rem] font-normal leading-none text-ivory">
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
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest"
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div id="mobile-search" className="border-t border-border px-4 py-3 lg:hidden">
            <Suspense fallback={null}>
              <GlobalSearch
                autoFocus
                onNavigate={() => setSearchOpen(false)}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>

      {open && (
        <nav
          id="mobile-nav"
          ref={panelRef}
          aria-label="Primary, mobile"
          className="max-h-[min(100dvh-5rem,40rem)] overflow-y-auto overscroll-contain border-t border-border bg-ivory lg:hidden"
        >
          <div className="flex flex-col px-5 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="pt-3 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
              Explore
            </p>
            {mobileLinks.map((l, i) => {
              const current =
                pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  onClick={() => setOpen(false)}
                  aria-current={current ? 'page' : undefined}
                  className="border-b border-border py-3.5 font-label text-[0.72rem] font-normal uppercase tracking-lockup text-ink"
                >
                  {l.label}
                </Link>
              );
            })}
            <p className="pt-5 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
              Shop by type
            </p>
            {categoryLinks.map((l) => (
              <Link
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
