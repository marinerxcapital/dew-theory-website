'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Rule from './Rule';

const columns = [
  { head: 'Shop', items: [['Shop all', '/shop'], ['Cart', '/cart']] },
  {
    head: 'Services',
    items: [
      ['Services', '/services'],
      ['Book a facial', '/book'],
      ['Virtual consultation', '/virtual-consultation']
    ]
  },
  { head: 'Dew Theory', items: [['About Emily', '/about'], ['Contact', '/contact']] }
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="site-footer relative mt-8">
      <div className="relative z-[1] mx-auto max-w-shell px-6 py-20 lg:px-10">
        <div className="grid gap-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl italic lowercase text-pearl sm:text-4xl">dew theory</p>
            <Rule left="Skin" right="Care" className="mt-5 !text-ice/60" />
            <p className="mt-7 max-w-xs font-body text-sm font-light leading-relaxed text-pearl/65">
              {/* OPEN_ITEMS: brand descriptor still placeholder */}
              Skin Script actives and in-studio facials — the plan and the products, together.
            </p>
            <Link
              href="/book"
              className="sweep btn-ghost mt-8 border-pearl/25 px-7 py-3.5 font-label text-[0.68rem] font-light uppercase tracking-lockup text-pearl hover:border-pearl/50 hover:bg-pearl/10"
            >
              Book a facial
            </Link>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-ice/70">
                {col.head}
              </p>
              <ul className="mt-5 space-y-3.5">
                {col.items.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="font-body text-sm font-light text-pearl/70 transition-colors hover:text-pearl"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-pearl/10 pt-7">
          <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            © {new Date().getFullYear()} Dew Theory
          </p>
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome/70">
            Clinical · Quiet · Precise
          </p>
        </div>
      </div>
    </footer>
  );
}
