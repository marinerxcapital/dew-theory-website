'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Rule from './Rule';

const columns = [
  { head: 'Shop', items: [['Shop all', '/shop'], ['Cart', '/cart'], ['Membership', '/membership']] },
  { head: 'Studio', items: [['Services', '/services'], ['Book a facial', '/book'], ['Visit the studio', '/studio']] },
  { head: 'Dew Theory', items: [['About Emily', '/about'], ['Contact', '/contact']] }
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-chrome/20 bg-pearl">
      <div className="mx-auto max-w-shell px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl italic lowercase text-graphite">dew theory</p>
            <Rule left="Skin" right="Care" className="mt-4" />
            <p className="mt-6 max-w-xs font-body text-sm font-light leading-relaxed text-charcoal/70">
              Skin Script formulations and in-studio facials, in one place.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                {col.head}
              </p>
              <ul className="mt-5 space-y-3">
                {col.items.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="font-body text-sm font-light text-charcoal/80 transition-colors hover:text-charcoal"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 border-t border-chrome/15 pt-6 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          © {new Date().getFullYear()} Dew Theory
        </p>
      </div>
    </footer>
  );
}
