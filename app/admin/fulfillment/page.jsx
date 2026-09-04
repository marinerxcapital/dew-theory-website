import Link from 'next/link';
import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import SystemStatusBadge from '@/components/admin/SystemStatusBadge';
import { commerceListFulfillmentJobs } from '@/lib/commerce';
import { getAutomationMode } from '@/lib/admin/dashboard';
import { STATUS } from '@/lib/admin/status';

const FILTERS = ['all', 'attention', 'queued', 'processing', 'submitted', 'blocked', 'failed', 'ambiguous'];

function matchesFilter(job, filter) {
  if (filter === 'all') return true;
  const s = String(job.status || '').toLowerCase();
  if (filter === 'attention') {
    return ['blocked', 'failed', 'ambiguous', 'submission_ambiguous'].some((x) => s.includes(x));
  }
  if (filter === 'ambiguous') return s.includes('ambiguous');
  return s.includes(filter);
}

export default async function AdminFulfillmentPage({ searchParams }) {
  await requireOwnerAdmin();
  const filter = searchParams?.filter || 'all';
  const jobs = await commerceListFulfillmentJobs({ limit: 200 });
  const automation = getAutomationMode();
  const filtered = jobs.filter((j) => matchesFilter(j, filter));

  const subtitle = automation.automationLive
    ? 'Durable fulfillment jobs — Skin Script RPA automation pipeline from commerce backend.'
    : automation.supplierMode === 'mock'
      ? 'Durable fulfillment jobs — mock / manual owner queue (Skin Script RPA not live).'
      : 'Durable fulfillment jobs — owner queue / automation disabled.';

  const counts = {
    queued: jobs.filter((j) => String(j.status).includes('queued')).length,
    processing: jobs.filter((j) => String(j.status).includes('processing')).length,
    submitted: jobs.filter((j) => String(j.status).includes('submitted')).length,
    blocked: jobs.filter((j) => String(j.status).includes('blocked')).length,
    failed: jobs.filter((j) => String(j.status).includes('failed')).length
  };

  return (
    <>
      <AdminPageHeader
        title="Fulfillment"
        subtitle={subtitle}
        automation={automation}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/fulfillment?filter=${f}`}
            className={`rounded-sm px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-lockup capitalize ${
              filter === f ? 'bg-forest text-ivory' : 'bg-stone/30 text-forest/70 hover:bg-stone/50'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-5 mb-6">
        {Object.entries(counts).map(([k, n]) => (
          <div key={k} className="glass-1 p-3 text-center">
            <div className="text-2xl font-display text-forest">{n}</div>
            <div className="text-xs text-muted capitalize">{k}</div>
          </div>
        ))}
      </div>

      <div className="glass-1 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone/20 text-left font-label text-[0.58rem] uppercase tracking-lockup text-muted">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">Order</th>
              <th className="p-3">Status</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">No jobs match this filter.</td>
              </tr>
            ) : (
              filtered.map((job) => {
                const severity =
                  String(job.status).includes('failed')
                    ? STATUS.CRITICAL
                    : String(job.status).includes('blocked')
                      ? STATUS.ATTENTION
                      : STATUS.HEALTHY;
                return (
                  <tr key={job.id} className="border-t border-chrome/15">
                    <td className="p-3 font-mono text-xs">{job.id}</td>
                    <td className="p-3">
                      <Link href={`/admin/orders/${job.order_id}`} className="text-sage-deep hover:underline text-xs">
                        {job.order_id}
                      </Link>
                    </td>
                    <td className="p-3">
                      <SystemStatusBadge status={severity} label={job.status} />
                    </td>
                    <td className="p-3 text-xs">{job.supplier || 'skin_script'}</td>
                    <td className="p-3 text-xs text-muted">{job.updated_at || job.created_at || '—'}</td>
                    <td className="p-3 text-xs text-muted max-w-[200px] truncate">
                      {job.error_message || job.error_code || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Retry and cancel require owner API with audit. Mode: {automation.modeLabel} — purchasing{' '}
        {automation.purchasingAllowed ? 'allowed' : 'blocked'}.
      </p>
    </>
  );
}
