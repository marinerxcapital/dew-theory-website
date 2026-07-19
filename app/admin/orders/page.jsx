import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { orders } = readStore();

  return (
    <div className="min-w-0">
      <h1 className="font-display text-2xl font-normal text-graphite sm:text-3xl">Orders</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        Manual fulfillment — mark submitted to Skin Script after you place the wholesale order.
      </p>

      <ul className="admin-card-list mt-8">
        {orders.map((o) => (
          <li key={o.id} className="glass-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                  {o.id}
                </p>
                <p className="mt-2 font-display text-lg font-normal text-graphite">
                  {o.customer?.name || 'Guest'}
                </p>
                <p className="mt-1 truncate font-body text-xs font-light text-chrome">
                  {o.customer?.email}
                </p>
              </div>
              <p className="shrink-0 font-label text-sm font-light tracking-wide2 text-charcoal">
                {formatMoney(o.total)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-chrome/15 pt-3">
              <span className="font-body text-xs font-light text-charcoal/70">
                Ship {formatMoney(o.shipping_fee || 0)} · {o.status}
              </span>
              <Link
                href={`/admin/orders/${o.id}`}
                className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
              >
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="admin-table-wrap table-scroll mt-10">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-chrome/25 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Ship</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3"> </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-chrome/15 font-body text-sm font-light">
                <td className="py-4 pr-4 text-graphite">{o.id}</td>
                <td className="py-4 pr-4 text-charcoal/70">
                  {o.customer?.name}
                  <br />
                  <span className="text-xs text-chrome">{o.customer?.email}</span>
                </td>
                <td className="py-4 pr-4">{formatMoney(o.total)}</td>
                <td className="py-4 pr-4 text-charcoal/70">{formatMoney(o.shipping_fee || 0)}</td>
                <td className="py-4 pr-4 text-chrome">{o.status}</td>
                <td className="py-4">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
