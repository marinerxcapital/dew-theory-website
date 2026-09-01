import { requireOwnerAdmin } from '@/lib/require-admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConnectionPanel from '@/components/admin/ConnectionPanel';
import { getStripeHealth } from '@/lib/admin/stripe-health';
import { getRpaHealth, getSkinScriptConfigHealth } from '@/lib/admin/rpa-health';
import { getCommerceHealth, getMappingCoverage } from '@/lib/admin/metrics';
import { getAutomationMode, getEmailHealth, getStorefrontHealth } from '@/lib/admin/dashboard';
import { commerceListWebhookEvents } from '@/lib/commerce';
import { parseAdminRange } from '@/lib/admin/date-range';
import { STATUS } from '@/lib/admin/status';

export default async function AdminIntegrationsPage() {
  await requireOwnerAdmin();
  const automation = getAutomationMode();
  const range = parseAdminRange({ range: '30d' });

  const [stripe, rpa, portalCreds, commerce, mapping, webhooks] = await Promise.all([
    getStripeHealth(process.env, range),
    getRpaHealth(),
    Promise.resolve(getSkinScriptConfigHealth()),
    getCommerceHealth(),
    getMappingCoverage(),
    commerceListWebhookEvents({ limit: 15 })
  ]);

  const email = getEmailHealth();
  const storefront = getStorefrontHealth();

  const webhookPanel = {
    id: 'stripe_webhooks',
    name: 'Stripe webhooks (D1)',
    status:
      stripe.webhookFailuresInRange > 0
        ? STATUS.DEGRADED
        : stripe.webhookSecretConfigured
          ? STATUS.HEALTHY
          : STATUS.NOT_CONFIGURED,
    webhookEventsInRange: stripe.webhookEventsInRange,
    lastWebhookAt: stripe.lastWebhookAt,
    lastWebhookType: stripe.lastWebhookType,
    checkedAt: commerce.checkedAt
  };

  const mappingPanel = {
    id: 'mapping_coverage',
    name: 'Supplier mapping coverage',
    status: mapping.status,
    verifiedMappingCount: mapping.verified,
    mappingCount: mapping.totalMappings,
    catalogProductCount: mapping.activeProducts,
    checkedAt: mapping.checkedAt
  };

  const calendarPanel = {
    id: 'google_calendar',
    name: 'Google Calendar',
    status: process.env.GOOGLE_CALENDAR_ID ? STATUS.HEALTHY : STATUS.NOT_CONFIGURED,
    configured: Boolean(process.env.GOOGLE_CALENDAR_ID),
    checkedAt: new Date().toISOString()
  };

  return (
    <>
      <AdminPageHeader
        title="Integrations"
        subtitle="Configuration presence and live probes — secret values are never shown."
        automation={automation}
      />

      <div className="grid gap-4 md:grid-cols-2" id="stripe">
        <ConnectionPanel connection={stripe} />
        <ConnectionPanel connection={webhookPanel} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8" id="skin-script">
        <ConnectionPanel connection={portalCreds} />
        <ConnectionPanel connection={{ ...rpa, supplierMode: automation.supplierMode }} />
        <ConnectionPanel connection={mappingPanel} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <ConnectionPanel connection={email} />
        <ConnectionPanel connection={storefront} />
        <ConnectionPanel connection={calendarPanel} />
        <ConnectionPanel connection={commerce} />
      </div>

      {webhooks.length > 0 && (
        <section className="mt-8" aria-labelledby="recent-webhooks">
          <h2 id="recent-webhooks" className="font-display text-lg text-forest mb-3">Recent webhook events</h2>
          <ul className="glass-1 divide-y divide-chrome/15 text-sm">
            {webhooks.slice(0, 10).map((w) => (
              <li key={w.id} className="flex justify-between gap-4 p-3">
                <span className="font-mono text-xs">{w.event_type || w.type || w.id}</span>
                <span className="text-muted text-xs">
                  {w.processed ? 'processed' : 'pending'} · {w.at || w.created_at}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
