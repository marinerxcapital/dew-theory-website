'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Rule from './Rule';
import {
  FREE_SHIPPING_THRESHOLD_USD,
  formatMoney
} from '@/lib/shipping';

const columns = [
  {
    head: 'Shop',
    items: [
      ['Shop all', '/shop'],
      ['Cleansers', '/shop?type=Cleanser'],
      ['Serums & treatments', '/shop?type=Serum'],
      ['Moisturizers', '/shop?type=Moisturizer'],
      ['SPF', '/shop?type=SPF'],
      ['Skin quiz', '/quiz'],
      ['Routine builder', '/routine'],
      ['Bag', '/cart']
    ]
  },
  {
    head: 'Services',
    items: [
      ['Services', '/services'],
      ['Book a facial', '/book'],
      ['Virtual consultation', '/virtual-consultation']
    ]
  },
  {
    head: 'Dew Theory',
    items: [
      ['About Emily', '/about'],
      ['Membership', '/membership'],
      ['Contact', '/contact'],
      ['FAQ', '/faq']
    ]
  },
  {
    head: 'Help',
    items: [
      ['Shipping', '/shipping'],
      ['Returns', '/returns'],
      ['Order support', '/contact'],
      ['Privacy', '/privacy']
    ]
  }
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="site-footer relative mt-16">
      <div className="relative z-[1] mx-auto max-w-shell px-5 py-14 sm:px-6 lg:px-10 lg:py-18">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl italic lowercase text-white sm:text-4xl">
              dew theory
            </p>
            <Rule left="Skin" right="Care" className="footer-rule mt-5" />
            <p className="mt-6 max-w-xs font-body text-sm font-normal leading-relaxed text-white/70">
              Clinical Skin Script actives and in-studio facials — aesthetician-led, barrier-first,
              precise.
            </p>
            <p className="mt-4 font-label text-[0.58rem] uppercase tracking-lockup text-white/45">
              Free shipping {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="btn-ghost border-white/25 bg-transparent px-6 py-3 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-white hover:border-white/50 hover:bg-white/10"
              >
                Book a facial
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center px-2 font-label text-[0.65rem] uppercase tracking-lockup text-dew-soft hover:text-white"
              >
                Skin Quiz
              </Link>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-white/55">
                {col.head}
              </p>
              <ul className="mt-5 space-y-2.5">
                {col.items.map(([label, href]) => (
                  <li key={`${col.head}-${href}-${label}`}>
                    <Link
                      href={href}
                      className="font-body text-sm font-normal text-white/70 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-white/45">
            © {new Date().getFullYear()} Dew Theory
          </p>
          <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-white/40">
            Clinical · Quiet · Precise
          </p>
        </div>
      </div>
    </footer>
  );
}
