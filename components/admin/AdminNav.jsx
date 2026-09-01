'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Command center', exact: true },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/fulfillment', label: 'Fulfillment' },
  { href: '/admin/integrations', label: 'Integrations' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/consultations', label: 'Consultations' },
  { href: '/admin/emails', label: 'Emails' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/system', label: 'System' }
];

export default function AdminNav({ admin }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!admin) return null;

  const linkClass = (item) => {
    const active = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/');
    return active
      ? 'bg-forest text-ivory'
      : 'text-forest/80 hover:bg-sage/20 hover:text-forest';
  };

  return (
    <>
      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-sage-deep/25 font-label text-[0.62rem] uppercase tracking-lockup text-forest lg:hidden"
        aria-expanded={open}
        aria-controls="admin-nav-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <nav
        id="admin-nav-drawer"
        aria-label="Admin"
        className={`${open ? 'block' : 'hidden'} mt-3 space-y-1 lg:mt-0 lg:block`}
      >
        <ul className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-sm px-3 py-2.5 font-label text-[0.64rem] font-light uppercase tracking-lockup ${linkClass(item)}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="lg:ml-auto">
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="w-full rounded-sm px-3 py-2.5 text-left font-label text-[0.64rem] font-light uppercase tracking-lockup text-muted hover:text-forest lg:w-auto"
              >
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </>
  );
}
