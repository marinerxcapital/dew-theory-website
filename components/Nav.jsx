'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header
      data-nav
      data-state="clear"
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-pearl focus:px-3 focus:py-2 focus:font-label focus:text-xs focus:font-light focus:uppercase focus:tracking-lockup"
      >
        Skip to content
      </a>

      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" aria-label="Dew Theory, home" className="shrink-0">
          <Wordmark src="/logo-mark.webp" className="h-6 text-[1.55rem] leading-none sm:h-7 sm:text-[1.8rem]" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/75 transition-colors hover:text-charcoal"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/75 transition-colors hover:text-charcoal"
          >
            Cart{hydrated && count > 0 ? ` (${count})` : ''}
          </Link>
          <Link
            href="/book"
            className="sweep border border-graphite/25 px-6 py-3 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal transition-colors hover:border-graphite/60"
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
            {[...links, { href: '/book', label: 'Book a facial' }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
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
