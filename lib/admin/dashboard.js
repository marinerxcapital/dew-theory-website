/**
 * Admin command center dashboard assembly.
 */
import { readStore } from '../store.js';
import { parseAdminRange } from './date-range.js';
import { worstStatus, STATUS } from './status.js';
import { computeCommerceKpis, getCommerceHealth, getMappingCoverage } from './metrics.js';
import { getStripeHealth } from './stripe-health.js';
import { getRpaHealth, getSkinScriptConfigHealth } from './rpa-health.js';
import { buildAttentionQueue } from './attention.js';
import {
  commerceListAuditLog,
  commerceListOrders,
  commerceListFulfillmentJobs
} from '../commerce/index.js';

export function getEmailHealth(env = process.env) {
  const resend = Boolean(env.RESEND_API_KEY);
  const from = Boolean(env.EMAIL_FROM);
  const store = readStore();
  const emails = store.outbound_emails || [];
  const last = emails[0];
  let status = STATUS.NOT_CONFIGURED;
  if (resend && from) status = STATUS.HEALTHY;
  else if (resend) status = STATUS.ATTENTION;
  return {
    id: 'resend',
    name: 'Email (Resend)',
    status,
    configured: resend,
    fromConfigured: from,
    lastOutboundAt: last?.created_at || null,
    checkedAt: new Date().toISOString()
  };
}

export function getStorefrontHealth(env = process.env) {
  const site = env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com';
  const catalog = readStore().products?.filter((p) => p.active !== false) || [];
  return {
    id: 'storefront',
    name: 'Storefront',
    status: catalog.length ? STATUS.HEALTHY : STATUS.ATTENTION,
    siteUrl: site,
    activeProductCount: catalog.length,
    catalogProductCount: catalog.length,
    checkedAt: new Date().toISOString()
  };
}

/**
 * Same rules as shouldAutoFulfill() in lib/dropship/fulfill-order.js.
 * @param {NodeJS.ProcessEnv | Record<string, string|undefined>} [env]
 */
export function computeAutoFulfillEnabled(env = process.env) {
  const v = env.AUTO_FULFILL;
  if (v === '0' || v === 'false' || v === 'FALSE') return false;
  if (env.SKIN_SCRIPT_MODE === 'rpa' && env.SKIN_SCRIPT_RPA_ENABLED !== 'true') {
    return false;
  }
  return true;
}

export function getAutomationMode(env = process.env) {
  const rpaEnabled = env.SKIN_SCRIPT_RPA_ENABLED === 'true' || env.SKIN_SCRIPT_RPA_ENABLED === '1';
  const dryRun = env.SKIN_SCRIPT_DRY_RUN === 'true' || env.SKIN_SCRIPT_DRY_RUN === '1';
  const mode = env.SKIN_SCRIPT_MODE || 'mock';
  const autoFulfill = computeAutoFulfillEnabled(env);
  const modeLabel = dryRun
    ? 'Dry run'
    : mode === 'rpa'
      ? 'Production RPA'
      : mode === 'mock'
        ? 'Mock'
        : mode;
  return {
    rpaEnabled,
    dryRun,
    supplierMode: mode,
    modeLabel,
    autoFulfill,
    purchasingAllowed: rpaEnabled && !dryRun && mode === 'rpa',
    killSwitch: !rpaEnabled,
    automationLive: mode === 'rpa' && rpaEnabled && !dryRun
  };
}

/**
 * @param {Record<string, string>} searchParams
 */
export async function getCommandCenterData(searchParams = {}, env = process.env) {
  const range = parseAdminRange({
    range: searchParams.range,
    from: searchParams.from,
    to: searchParams.to
  });
  const refreshedAt = new Date().toISOString();

  const [
    kpis,
    commerceHealth,
    stripe,
    rpa,
    portalCreds,
    email,
    storefront,
    attention,
    mapping,
    recentOrders,
    recentJobs,
    auditCommerce
  ] = await Promise.all([
    computeCommerceKpis(range.from, range.to),
    getCommerceHealth(),
    getStripeHealth(env, range),
    getRpaHealth(env),
    getSkinScriptConfigHealth(env),
    Promise.resolve(getEmailHealth(env)),
    Promise.resolve(getStorefrontHealth(env)),
    buildAttentionQueue(env),
    getMappingCoverage(),
    commerceListOrders(),
    commerceListFulfillmentJobs({ limit: 15 }),
    commerceListAuditLog({ limit: 12 })
  ]);

  const connections = [commerceHealth, stripe, rpa, portalCreds, email, storefront];
  let overall = worstStatus(...connections.map((c) => c.status));
  if (attention.some((a) => a.severity === 'critical')) {
    overall = worstStatus(overall, STATUS.CRITICAL);
  } else if (attention.length) {
    overall = worstStatus(overall, STATUS.ATTENTION);
  }

  const storeAudit = readStore().audit_log || [];
  const audit = auditCommerce.length ? auditCommerce : storeAudit.slice(0, 12);

  const paidRecent = recentOrders
    .filter((o) => ['paid', 'fulfilled', 'submitted_to_skin_script'].includes(o.status))
    .slice(0, 8)
    .map((o) => ({
      id: o.id,
      email: o.customer?.email || o.email || '—',
      total: Number(o.total || 0),
      fulfillmentStatus: recentJobs.find((j) => j.order_id === o.id)?.status || null
    }));

  const store = readStore();
  const checkoutStarted = (store.events || []).filter((e) => e.type === 'checkout_started').length;
  const conversionRate =
    checkoutStarted > 0 && kpis.paidOrderCount
      ? Math.round((kpis.paidOrderCount / checkoutStarted) * 100)
      : null;

  return {
    overallStatus: overall,
    refreshedAt,
    generatedAt: refreshedAt,
    range,
    kpis: {
      ...kpis,
      grossRevenue: kpis.revenue,
      paidOrders: kpis.paidOrderCount,
      ordersAwaitingFulfillment: kpis.fulfillmentQueued + kpis.fulfillmentDryRunReady,
      supplierOrdersSubmitted: kpis.fulfillmentSubmitted,
      fulfillmentFailedBlocked: kpis.fulfillmentFailed + kpis.fulfillmentBlocked,
      conversionRate
    },
    commerceHealth,
    stripe,
    rpa,
    portalCreds,
    email,
    storefront,
    connections,
    attention,
    mapping,
    automation: getAutomationMode(env),
    recentOrders: recentOrders.slice(0, 8),
    recentPaidOrders: paidRecent,
    recentJobs: recentJobs.slice(0, 8),
    recentFulfillmentJobs: recentJobs.slice(0, 8),
    audit
  };
}
