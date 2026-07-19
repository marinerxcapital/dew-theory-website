import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { orders } = readStore();

  return (
    <div>
      <h1 className="font-display text-3xl text-graphite">Orders</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        Manual fulfillment — mark submitted to Skin Script after you place the wholesale order.
      </p>

      <div className="mt-10 overflow-x-auto">
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
                    className="font-label text-[0.62rem] uppercase tracking-lockup text-charcoal hover:underline"
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
