import Link from 'next/link';
import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import MetricCard from '@/components/admin/MetricCard';
import ConnectionPanel from '@/components/admin/ConnectionPanel';
import SystemStatusBadge from '@/components/admin/SystemStatusBadge';
import { getCommandCenterData } from '@/lib/admin/dashboard';
import { formatMoney } from '@/lib/shipping';

export default async function AdminCommandCenterPage({ searchParams }) {
  await requireOwnerAdmin();
  const range = searchParams?.range || '30d';
  const data = await getCommandCenterData({ range });
  const kpis = data.kpis;
  const attention = data.attention.slice(0, 8);

  const stripeConn = {
    ...data.stripe,
    name: 'Stripe',
    rpaEnabled: undefined,
    dryRun: undefined
  };
  const rpaConn = {
    ...data.rpa,
    name: 'Skin Script RPA',
    reachable: data.rpa.health?.ok ?? Boolean(data.rpa.health && !data.rpa.health.error),
    ready: data.rpa.ready?.ready ?? false,
    sessionAuthenticated: data.rpa.ready?.session_authenticated ?? 'unknown',
    challengeDetected: data.rpa.ready?.challenge_detected ?? false,
    lastVerifiedAt: data.rpa.ready?.last_verified_at
  };

  return (
    <>
      <AdminPageHeader
        title="Command Center"
        subtitle="Operational overview — durable commerce, fulfillment automation, and integration health."
        overallStatus={data.overallStatus}
        refreshedAt={data.refreshedAt}
        automation={data.automation}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'today', label: 'Today' },
          { key: '7d', label: '7 days' },
          { key: '30d', label: '30 days' },
          { key: '90d', label: '90 days' },
          { key: 'all', label: 'All time' }
        ].map((r) => (
          <Link
            key={r.key}
            href={`/admin?range=${r.key}`}
            className={`rounded-sm px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-lockup ${
              range === r.key
                ? 'bg-forest text-ivory'
                : 'bg-stone/30 text-forest/70 hover:bg-stone/50'
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {attention.length > 0 && (
        <section className="mb-8" aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="font-display text-xl text-forest mb-3">
            Needs attention
          </h2>
          <ul className="space-y-2">
            {attention.map((item) => (
              <li
                key={item.id}
                className="glass-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SystemStatusBadge status={item.severity} />
                    <span className="text-sm font-medium text-forest">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted">{item.detail}</p>
                </div>
                {item.href && (
                  <Link href={item.href} className="text-sm font-medium text-sage-deep hover:underline shrink-0">
                    View →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="font-display text-xl text-forest mb-3">
          Commerce KPIs
          <span className="text-sm font-body text-muted ml-2">
            {data.range.range} · {data.commerceHealth.backend}
          </span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Gross revenue" value={formatMoney(kpis.grossRevenue)} />
          <MetricCard label="Paid orders" value={kpis.paidOrders} />
          <MetricCard label="Average order value" value={formatMoney(kpis.averageOrderValue)} />
          <MetricCard label="Units sold" value={kpis.unitsSold} />
          <MetricCard label="Awaiting fulfillment" value={kpis.ordersAwaitingFulfillment} href="/admin/fulfillment" />
          <MetricCard label="Supplier submitted" value={kpis.supplierOrdersSubmitted} />
          <MetricCard
            label="Fulfillment success"
            value={kpis.fulfillmentSuccessRate != null ? `${kpis.fulfillmentSuccessRate}%` : '—'}
            sub={`${kpis.fulfillmentFailedBlocked} failed/blocked`}
          />
          <MetricCard
            label="Checkout conversion"
            value={kpis.conversionRate != null ? `${kpis.conversionRate}%` : '—'}
            sub="Paid orders / checkout started (events)"
          />
        </div>
      </section>

      <section className="mb-8" aria-labelledby="connections-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="connections-heading" className="font-display text-xl text-forest">Connections</h2>
          <Link href="/admin/integrations" className="text-sm text-sage-deep hover:underline">
            All integrations →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ConnectionPanel connection={stripeConn} />
          <ConnectionPanel connection={data.commerceHealth} />
          <ConnectionPanel connection={rpaConn} />
          <ConnectionPanel connection={data.email} />
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-forest mb-3">Recent paid orders</h2>
          <div className="glass-1 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone/20 text-left font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPaidOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-muted">No paid orders in durable commerce yet.</td>
                  </tr>
                ) : (
                  data.recentPaidOrders.map((o) => (
                    <tr key={o.id} className="border-t border-chrome/15">
                      <td className="p-3">
                        <Link href={`/admin/orders/${o.id}`} className="text-sage-deep hover:underline font-mono text-xs">
                          {o.id}
                        </Link>
                        <div className="text-xs text-muted">{o.email}</div>
                      </td>
                      <td className="p-3">{formatMoney(o.total)}</td>
                      <td className="p-3 text-xs">{o.fulfillmentStatus || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl text-forest mb-3">Fulfillment jobs</h2>
          <div className="glass-1 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone/20 text-left font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                <tr>
                  <th className="p-3">Job</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Order</th>
                </tr>
              </thead>
              <tbody>
                {data.recentFulfillmentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-muted">No fulfillment jobs yet.</td>
                  </tr>
                ) : (
                  data.recentFulfillmentJobs.map((j) => (
                    <tr key={j.id} className="border-t border-chrome/15">
                      <td className="p-3 font-mono text-xs">{j.id}</td>
                      <td className="p-3 text-xs">{j.status}</td>
                      <td className="p-3">
                        <Link href={`/admin/orders/${j.order_id}`} className="text-sage-deep hover:underline text-xs">
                          {j.order_id}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Link href="/admin/fulfillment" className="mt-2 inline-block text-sm text-sage-deep hover:underline">
            Open fulfillment center →
          </Link>
        </div>
      </section>
    </>
  );
}
