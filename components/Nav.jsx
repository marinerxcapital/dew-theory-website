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
  { href: '/studio', label: 'Studio' },
  { href: '/membership', label: 'Membership' },
  { href: '/contact', label: 'Contact' }
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, hydrated } = useCart();
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);

  // Close mobile menu on route change; return focus to menu button when closing
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
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

      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" aria-label="Dew Theory, home" className="shrink-0">
          <Wordmark
            src="/logo-mark.webp"
            priority
            className="h-6 text-[1.55rem] leading-none sm:h-7 sm:text-[1.8rem]"
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
            Cart{hydrated && count > 0 ? ` (${count})` : ''}
          </Link>
          <Link
            href="/book"
            className="sweep btn-primary px-6 py-3 font-label text-[0.7rem] font-light uppercase tracking-lockup"
          >
            Book a facial
          </Link>
        </nav>

        <div className="flex items-center gap-5 lg:hidden">
          <Link
            href="/cart"
            className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
          >
            Cart{hydrated && count > 0 ? ` (${count})` : ''}
          </Link>
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary, mobile" className="glass-1 lg:hidden">
          <div className="flex flex-col px-6 py-4">
            {mobileLinks.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                ref={i === 0 ? firstLinkRef : undefined}
                onClick={() => setOpen(false)}
                className="border-b border-chrome/15 py-4 font-label text-[0.74rem] font-light uppercase tracking-lockup text-charcoal last:border-0"
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
