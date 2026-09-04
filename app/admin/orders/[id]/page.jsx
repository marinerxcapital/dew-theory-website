import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import SystemStatusBadge from '@/components/admin/SystemStatusBadge';
import {
  commerceGetOrder,
  commerceGetFulfillmentJobByOrder,
  commerceListFulfillmentAttempts,
  commerceGetSupplierMapping
} from '@/lib/commerce';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import { getAutomationMode } from '@/lib/admin/dashboard';
import OrderStatusForm from '@/components/admin/OrderStatusForm';
import ManualFulfillmentPanel from '@/components/admin/ManualFulfillmentPanel';

export default async function AdminOrderDetailPage({ params }) {
  await requireOwnerAdmin();
  const automation = getAutomationMode();

  let order = await commerceGetOrder(params.id);
  let source = 'commerce';
  if (!order) {
    order = readStore().orders.find((o) => o.id === params.id);
    source = order ? 'legacy_file' : null;
  }
  if (!order) notFound();

  const job = await commerceGetFulfillmentJobByOrder(params.id);
  const attempts = job ? await commerceListFulfillmentAttempts(job.id) : [];

  let panelOrder = order;
  if (source === 'commerce' && Array.isArray(order.items)) {
    const enriched = await Promise.all(
      order.items.map(async (li) => {
        if (li.skin_script_sku || li.portal_sku || !li.product_id) return li;
        const mapping = await commerceGetSupplierMapping(li.product_id).catch(() => null);
        if (!mapping?.skin_script_sku) return li;
        return { ...li, mapping_sku: mapping.skin_script_sku, skin_script_sku: mapping.skin_script_sku };
      })
    );
    panelOrder = { ...order, items: enriched };
  }

  const timeline = [];
  if (order.created_at) timeline.push({ at: order.created_at, label: 'Order created' });
  if (['paid', 'fulfilled', 'submitted_to_skin_script'].includes(order.status)) {
    timeline.push({ at: order.updated_at || order.created_at, label: 'Payment completed' });
  }
  if (job?.created_at) timeline.push({ at: job.created_at, label: 'Fulfillment job queued' });
  if (job?.started_at) timeline.push({ at: job.started_at, label: 'Worker started' });
  if (job?.status === 'dry_run_ready') timeline.push({ at: job.updated_at, label: 'Dry-run ready' });
  if (job?.status === 'submitted') timeline.push({ at: job.completed_at || job.updated_at, label: 'Supplier submitted' });
  if (job?.supplier_order_id) timeline.push({ at: job.completed_at, label: `Supplier order ${job.supplier_order_id}` });

  return (
    <>
      <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
        <Link href="/admin/orders" className="hover:text-forest">← Orders</Link>
      </p>

      <AdminPageHeader
        title={`Order ${order.id}`}
        subtitle={`${new Date(order.created_at).toLocaleString()} · ${order.status} · source: ${source}`}
        automation={automation}
      />

      {job && (
        <div className="mb-8 glass-1 p-4">
          <h2 className="font-display text-lg text-forest mb-2">Fulfillment</h2>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <SystemStatusBadge status={job.status} label={job.status} />
            {job.supplier_order_id && (
              <span className="text-xs text-muted">Supplier order: {job.supplier_order_id}</span>
            )}
          </div>
          {(job.error_message || job.error_code) && (
            <p className="text-sm text-muted">{job.error_code}: {job.error_message}</p>
          )}
          {attempts.length > 0 && (
            <ul className="mt-3 space-y-2 text-xs text-muted">
              {attempts.map((a) => (
                <li key={a.id}>
                  Attempt {a.attempt_number}: {a.stage} → {a.result}
                  {a.error_summary ? ` (${a.error_summary})` : ''}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/fulfillment" className="mt-2 inline-block text-sm text-sage-deep hover:underline">
            Fulfillment center →
          </Link>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-forest">Line items</h2>
          <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
            {(order.items || []).map((li, i) => (
              <li key={i} className="py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-forest">
                    {li.name}
                    {li.variant ? ` (${li.variant})` : ''}
                  </span>
                  <span className="shrink-0">{formatMoney((li.unit_price || 0) * (li.quantity || 0))}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {li.product_id || li.sku || '—'}
                  {li.skin_script_sku ? ` · SS ${li.skin_script_sku}` : ''}
                  {' · '}
                  {li.quantity} × {formatMoney(li.unit_price || 0)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 text-sm text-forest/80">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-muted">
                <dt>Discount ({order.discount_code})</dt>
                <dd>−{formatMoney(order.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.shipping_fee || 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-chrome/20 pt-2 font-label text-[0.7rem] uppercase tracking-lockup text-forest">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl text-forest">Ship to</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
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

          {timeline.length > 0 && (
            <div>
              <h2 className="font-display text-xl text-forest">Timeline</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {timeline.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-muted shrink-0">{new Date(e.at).toLocaleString()}</span>
                    <span>{e.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {order.customer_notes && (
            <div>
              <h2 className="font-display text-xl text-forest">Customer note</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{order.customer_notes}</p>
            </div>
          )}

          {source === 'legacy_file' && (
            <OrderStatusForm orderId={order.id} current={order.status} order={order} />
          )}
        </div>
      </div>

      {source === 'commerce' && (
        <div className="mt-10">
          <ManualFulfillmentPanel
            order={panelOrder}
            automationLive={Boolean(automation.automationLive)}
            modeLabel={automation.modeLabel || automation.supplierMode || 'Mock'}
          />
        </div>
      )}
    </>
  );
}
