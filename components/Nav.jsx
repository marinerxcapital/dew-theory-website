'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark';
import { useCart } from '@/components/CartProvider';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'Emily' },
  { href: '/virtual-consultation', label: 'Virtual Consultation' },
  { href: '/contact', label: 'Contact' }
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, hydrated } = useCart();
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);
  const panelRef = useRef(null);

  // Close mobile menu on route change; return focus to menu button when closing
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [open]);

  // Prevent background scroll while mobile drawer is open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
        'a[href], button:not([disabled])'
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
      data-state="clear"
      className="fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color,box-shadow] duration-500"
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <div className="mx-auto flex max-w-shell items-center justify-between px-5 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6">
        <Link
          href="/"
          aria-label="Dew Theory, home"
          className="nav-logo relative flex shrink-0 items-center transition-opacity duration-300 hover:opacity-90"
        >
          <Wordmark
            src="/logo-mark.webp"
            priority
            className="h-10 w-auto max-w-[12rem] object-contain object-left sm:h-11 sm:max-w-[13.5rem] lg:h-12 lg:max-w-[15rem]"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 xl:gap-9 lg:flex">
          {links.map((l) => {
            const current =
              pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={current ? 'page' : undefined}
                className="nav-link font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/75 transition-colors hover:text-charcoal"
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/cart"
            aria-current={pathname === '/cart' ? 'page' : undefined}
            className="nav-link font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/75 transition-colors hover:text-charcoal"
          >
            Cart
            {hydrated && count > 0 ? (
              <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-graphite/90 px-1.5 py-0.5 text-[0.55rem] leading-none text-pearl">
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </Link>
          <Link
            href="/book"
            className="sweep btn-primary px-6 py-3 font-label text-[0.7rem] font-light uppercase tracking-lockup"
          >
            Book a facial
          </Link>
        </nav>

        <div className="flex items-center gap-4 sm:gap-5 lg:hidden">
          <Link
            href="/cart"
            className="inline-flex min-h-[44px] items-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
          >
            Cart
            {hydrated && count > 0 ? (
              <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-graphite/90 px-1.5 py-0.5 text-[0.55rem] leading-none text-pearl">
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </Link>
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex min-h-[44px] items-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          ref={panelRef}
          aria-label="Primary, mobile"
          className="glass-1 max-h-[min(100dvh-4.5rem,32rem)] overflow-y-auto overscroll-contain lg:hidden"
        >
          <div className="flex flex-col px-6 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                  className="border-b border-chrome/15 py-4 font-label text-[0.74rem] font-light uppercase tracking-lockup text-charcoal last:border-0"
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
