import Link from 'next/link';
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
      <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
        <Link href="/admin/orders" className="hover:text-charcoal">
          ← Orders
        </Link>
      </p>
      <h1 className="mt-3 font-display text-3xl font-normal text-graphite">Order {order.id}</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        {new Date(order.created_at).toLocaleString()} · {order.status}
        {order.submitted_to_skin_script_at && (
          <> · Skin Script marked {new Date(order.submitted_to_skin_script_at).toLocaleString()}</>
        )}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-normal text-graphite">Line items</h2>
          <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
            {(order.items || []).map((li, i) => (
              <li key={i} className="py-3 font-body text-sm font-light">
                <div className="flex justify-between gap-4">
                  <span className="text-graphite">
                    {li.name}
                    {li.variant ? ` (${li.variant})` : ''}
                  </span>
                  <span className="shrink-0">{formatMoney((li.unit_price || 0) * (li.quantity || 0))}</span>
                </div>
                <p className="mt-1 font-body text-xs font-light text-chrome">
                  {li.product_id || li.sku || '—'}
                  {li.skin_script_sku ? ` · SS ${li.skin_script_sku}` : ''}
                  {' · '}
                  {li.quantity} × {formatMoney(li.unit_price || 0)}
                </p>
              </li>
            ))}
            {!(order.items || []).length && (
              <li className="py-4 font-body text-sm font-light text-charcoal/50">No line items.</li>
            )}
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
              {order.customer?.phone && (
                <>
                  <br />
                  {order.customer.phone}
                </>
              )}
              <br />
              {order.shipping_address?.line1}
              {order.shipping_address?.line2 && (
                <>
                  <br />
                  {order.shipping_address.line2}
                </>
              )}
              <br />
              {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
              {order.shipping_address?.postal_code}
            </p>
          </div>
          {order.customer_notes && (
            <div>
              <h2 className="font-display text-xl font-normal text-graphite">Customer note</h2>
              <p className="mt-3 whitespace-pre-wrap font-body text-sm font-light leading-relaxed text-charcoal/75">
                {order.customer_notes}
              </p>
            </div>
          )}
          <OrderStatusForm orderId={order.id} current={order.status} order={order} />
        </div>
      </div>
    </div>
  );
}
