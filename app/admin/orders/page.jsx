import Link from 'next/link';
import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { commerceListOrders } from '@/lib/commerce';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import { ORDER_FILTER_STATUSES, filterOrdersByStatus } from '@/lib/order-status';
import { getAutomationMode } from '@/lib/admin/dashboard';

const PAIDISH = new Set(['paid', 'fulfilled', 'submitted_to_skin_script']);

export default async function AdminOrdersPage({ searchParams }) {
  await requireOwnerAdmin();
  const status = searchParams?.status || 'all';
  const automation = getAutomationMode();

  const commerceOrders = await commerceListOrders();
  const fileOrders = readStore().orders || [];
  const merged = new Map();
  for (const o of fileOrders) merged.set(o.id, { ...o, source: 'legacy_file' });
  for (const o of commerceOrders) merged.set(o.id, { ...o, source: 'commerce' });
  const orders = Array.from(merged.values()).sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at))
  );

  const filtered = filterOrdersByStatus(orders, status);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        subtitle="Durable commerce orders (authoritative) merged with legacy file-store orders. Skin Script fulfillment runs via RPA when enabled."
        automation={automation}
      />

      <p className="mb-4 text-sm text-muted">
        Automation mode: <strong className="text-forest">{automation.modeLabel}</strong>. Paid orders queue
        fulfillment jobs; supplier submission requires verified mappings and RPA purchasing allowed.
      </p>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {ORDER_FILTER_STATUSES.map((s) => {
          const active = status === s;
          const href = s === 'all' ? '/admin/orders' : `/admin/orders?status=${encodeURIComponent(s)}`;
          return (
            <Link
              key={s}
              href={href}
              className={`border px-3 py-2 font-label text-[0.58rem] uppercase tracking-lockup ${
                active
                  ? 'border-forest bg-forest text-ivory'
                  : 'border-chrome/30 text-muted hover:border-forest/40'
              }`}
            >
              {s === 'submitted_to_skin_script' ? '→ Skin Script' : s}
            </Link>
          );
        })}
      </nav>

      <ul className="admin-card-list mt-8 space-y-3">
        {filtered.map((o) => (
          <li key={o.id} className="glass-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
                  {o.id} · {o.source}
                </p>
                <p className="mt-2 font-display text-lg text-forest">{o.customer?.name || 'Guest'}</p>
                <p className="mt-1 truncate text-xs text-muted">{o.customer?.email}</p>
              </div>
              <p className="shrink-0 font-label text-sm text-forest">{formatMoney(o.total)}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-chrome/15 pt-3">
              <span className="text-xs text-muted">
                Ship {formatMoney(o.shipping_fee || 0)} · {o.status}
              </span>
              <Link href={`/admin/orders/${o.id}`} className="font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep hover:underline">
                Open
              </Link>
            </div>
          </li>
        ))}
        {!filtered.length && (
          <li className="py-8 text-sm text-muted">
            No orders{status !== 'all' ? ` with status “${status}”` : ' yet'}.
          </li>
        )}
      </ul>
    </>
  );
}
