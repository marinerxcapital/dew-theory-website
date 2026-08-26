'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const DESKTOP_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?type=Cleanser', label: 'Cleansers', match: 'Cleanser' },
  { href: '/shop?type=Serum', label: 'Treatments', matchTypes: ['Serum', 'Exfoliant', 'Toner', 'Mask'] },
  { href: '/shop?type=Moisturizer', label: 'Moisturizers', match: 'Moisturizer' },
  { href: '/shop?type=SPF', label: 'SPF', match: 'SPF' },
  { href: '/quiz', label: 'Skin Quiz' },
  { href: '/virtual-consultation', label: 'Virtual Consult' },
  { href: '/about', label: 'Emily' }
];

function isCurrent(pathname, searchParams, link) {
  if (link.href === '/shop' && pathname === '/shop' && !searchParams?.get('type')) {
    return true;
  }
  if (pathname === '/shop' && link.match) {
    return searchParams?.get('type') === link.match;
  }
  if (pathname === '/shop' && link.matchTypes) {
    return link.matchTypes.includes(searchParams?.get('type'));
  }
  if (link.href.startsWith('/shop')) return false;
  return pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
}

export default function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav
      className="category-nav hidden lg:block"
      aria-label="Shop categories"
    >
      <div className="mx-auto flex max-w-shell items-stretch gap-0 overflow-x-auto px-4 lg:px-10">
        {DESKTOP_LINKS.map((link) => {
          const current = isCurrent(pathname, searchParams, link);
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={`whitespace-nowrap px-3 py-3 font-label text-[0.62rem] font-normal uppercase tracking-lockup transition-colors xl:px-3.5 ${
                current ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
