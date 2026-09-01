import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConnectionPanel from '@/components/admin/ConnectionPanel';
import { getCommerceHealth } from '@/lib/admin/metrics';
import { getAutomationMode } from '@/lib/admin/dashboard';
import { commerceListAuditLog, commerceGetBackendName } from '@/lib/commerce';

export default async function AdminSystemPage() {
  await requireOwnerAdmin();
  const automation = getAutomationMode();
  const commerce = await getCommerceHealth();
  const audit = await commerceListAuditLog({ limit: 30 });
  const backend = await commerceGetBackendName();

  const deploySha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    '—';
  const nodeEnv = process.env.NODE_ENV || 'development';

  const runtimePanel = {
    id: 'runtime',
    name: 'Deployment / runtime',
    status: nodeEnv === 'production' ? 'healthy' : 'attention',
    mode: nodeEnv,
    backend,
    commitSha: deploySha.slice(0, 12),
    skinScriptMode: process.env.SKIN_SCRIPT_MODE || '—',
    rpaEnabledFlag: process.env.SKIN_SCRIPT_RPA_ENABLED || '—',
    ownerEmailConfigured: Boolean(process.env.ADMIN_OWNER_EMAIL || process.env.ADMIN_EMAIL),
    totpPolicy: process.env.ADMIN_REQUIRE_TOTP || 'default',
    checkedAt: new Date().toISOString()
  };

  return (
    <>
      <AdminPageHeader
        title="System health"
        subtitle="Live commerce telemetry and audit trail. Deployment SHA from runtime when exposed."
        automation={automation}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-8" id="commerce">
        <ConnectionPanel connection={commerce} />
        <ConnectionPanel connection={runtimePanel} />
      </div>

      <section aria-labelledby="audit-heading">
        <h2 id="audit-heading" className="font-display text-xl text-forest mb-3">Audit log</h2>
        <div className="glass-1 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-stone/20 text-left font-label text-[0.58rem] uppercase tracking-lockup text-muted">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Actor</th>
              </tr>
            </thead>
            <tbody>
              {audit.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted">
                    No audit entries in commerce backend yet.
                  </td>
                </tr>
              ) : (
                audit.map((row) => (
                  <tr key={row.id || `${row.created_at}-${row.action}`} className="border-t border-chrome/15">
                    <td className="p-3 text-xs text-muted">{row.created_at || row.timestamp || '—'}</td>
                    <td className="p-3 text-xs">{row.action || row.event_type || '—'}</td>
                    <td className="p-3 text-xs font-mono">{row.entity_id || row.order_id || row.resource || '—'}</td>
                    <td className="p-3 text-xs">{row.actor || row.admin_email || row.user_id || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
