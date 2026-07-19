import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';

export default async function AdminHomePage() {
  await requireAdmin();
  const store = readStore();

  const paidOrders = store.orders.filter((o) => o.status === 'paid' || o.status === 'fulfilled');
  const revenue = paidOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const openAppts = store.appointments.filter((a) => a.status === 'confirmed').length;

  const cards = [
    { label: 'Revenue (seeded + live)', value: formatMoney(revenue), href: '/admin/analytics' },
    { label: 'Orders', value: String(store.orders.length), href: '/admin/orders' },
    { label: 'Upcoming appointments', value: String(openAppts), href: '/admin/appointments' },
    { label: 'Active products', value: String(store.products.filter((p) => p.active !== false).length), href: '/admin/products' }
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Overview</h1>
      <p className="mt-3 font-body text-sm font-light text-charcoal/70">
        Business data from the local store (Supabase-ready schema). Replace file store with Supabase
        when project keys are available.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="glass-1 p-6 transition-transform hover:-translate-y-0.5"
          >
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              {c.label}
            </p>
            <p className="mt-3 font-display text-2xl font-normal text-graphite">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Recent orders</h2>
          <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
            {store.orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex justify-between gap-4 py-3 font-body text-sm font-light">
                <span className="text-charcoal/80">{o.id}</span>
                <span className="text-chrome">{o.status}</span>
                <span className="text-graphite">{formatMoney(o.total)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Audit log</h2>
          <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
            {(store.audit_log || []).slice(0, 6).map((a) => (
              <li key={a.id} className="py-3 font-body text-xs font-light text-charcoal/70">
                <span className="text-graphite">{a.action}</span> · {a.entity} {a.entity_id}{' '}
                <span className="text-chrome">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {!(store.audit_log || []).length && (
              <li className="py-3 font-body text-xs font-light text-charcoal/50">
                No admin mutations yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
