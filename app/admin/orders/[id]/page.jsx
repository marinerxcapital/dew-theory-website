import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import OrderStatusForm from '@/components/admin/OrderStatusForm';

export default async function AdminOrderDetailPage({ params }) {
  await requireAdmin();
  const order = readStore().orders.find((o) => o.id === params.id);
  if (!order) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Order {order.id}</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        {new Date(order.created_at).toLocaleString()} · {order.status}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Line items</h2>
          <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
            {order.items.map((li, i) => (
              <li key={i} className="flex justify-between gap-4 py-3 font-body text-sm font-light">
                <span>
                  {li.name}
                  {li.variant ? ` (${li.variant})` : ''} × {li.quantity}
                </span>
                <span>{formatMoney(li.unit_price * li.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 font-body text-sm font-light text-charcoal/80">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-chrome">
                <dt>Discount ({order.discount_code})</dt>
                <dd>−{formatMoney(order.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.shipping_fee || 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-chrome/20 pt-2 font-label text-[0.7rem] font-light uppercase tracking-lockup text-graphite">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl font-normal text-graphite">Ship to</h2>
            <p className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {order.customer?.name}
              <br />
              {order.customer?.email}
              <br />
              {order.shipping_address?.line1}
              <br />
              {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
              {order.shipping_address?.postal_code}
            </p>
          </div>
          <OrderStatusForm orderId={order.id} current={order.status} />
        </div>
      </div>
    </div>
  );
}
