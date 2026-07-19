'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/import', label: 'CSV import' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/appointments', label: 'Appointments' },
  { href: '/admin/discounts', label: 'Discounts' },
  { href: '/admin/analytics', label: 'Analytics' }
];

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin || !admin) {
    return <div className="pt-24">{children}</div>;
  }

  return (
    <div className="pt-24">
      <div className="border-b border-chrome/20 bg-pearl/70">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div>
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              Admin
            </p>
            <p className="font-display text-lg text-graphite">Dew Theory</p>
          </div>
          <p className="font-body text-xs font-light text-charcoal/60">
            {admin.name} · {admin.role}
          </p>
        </div>
        <nav
          aria-label="Admin"
          className="mx-auto flex max-w-shell gap-1 overflow-x-auto px-6 pb-3 lg:px-10"
        >
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 font-label text-[0.64rem] font-light uppercase tracking-lockup ${
                  active ? 'border-b-2 border-graphite text-graphite' : 'text-chrome hover:text-charcoal'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <form action="/api/admin/logout" method="POST" className="ml-auto">
            <button
              type="submit"
              className="px-3 py-2 font-label text-[0.64rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
      <div className="mx-auto max-w-shell px-6 py-12 lg:px-10">{children}</div>
    </div>
  );
}
