/**
 * Commerce KPI metrics from durable backend + catalog cross-check.
 */
import {
  commerceGetBackendName,
  commerceListFulfillmentJobs,
  commerceListOrders,
  commerceListSupplierMappings
} from '../commerce/index.js';
import { readStore } from '../store.js';
import { inRange } from './date-range.js';
import { STATUS } from './status.js';

const PAID_STATUSES = new Set(['paid', 'fulfilled', 'submitted_to_skin_script']);

export async function getCommerceHealth() {
  const checkedAt = new Date().toISOString();
  try {
    const backend = await commerceGetBackendName();
    const orders = await commerceListOrders();
    const jobs = await commerceListFulfillmentJobs({ limit: 500 });
    const mappings = await commerceListSupplierMappings({ activeOnly: false });
    const verified = mappings.filter((m) => m.verified === 1 || m.verified === true).length;
    const catalog = readStore().products?.filter((p) => p.active !== false) || [];
    const activeProducts = catalog.length;
    const paidOrders = orders.filter((o) => PAID_STATUSES.has(o.status));

    let status = STATUS.HEALTHY;
    if (backend === 'file' && process.env.NODE_ENV === 'production') {
      status = STATUS.DEGRADED;
    }
    if (activeProducts > 0 && verified < activeProducts) {
      status = status === STATUS.HEALTHY ? STATUS.ATTENTION : status;
    }

    const lastOrder = paidOrders[0] || orders[0];
    const lastJob = jobs[0];
    return {
      id: 'commerce_d1',
      name: 'Durable commerce',
      status,
      backend,
      d1Available: backend === 'd1',
      orderCount: orders.length,
      paidOrderCount: paidOrders.length,
      fulfillmentJobCount: jobs.length,
      webhookEventCount: null,
      mappingCount: mappings.length,
      verifiedMappingCount: verified,
      catalogProductCount: activeProducts,
      lastOrderAt: lastOrder?.created_at || null,
      lastPaidOrderAt: paidOrders[0]?.created_at || null,
      lastFulfillmentJobAt: lastJob?.updated_at || lastJob?.created_at || null,
      checkedAt
    };
  } catch (e) {
    return {
      id: 'commerce_d1',
      name: 'Durable commerce',
      status: STATUS.CRITICAL,
      backend: 'unknown',
      d1Available: false,
      error: String(e.message || 'commerce read failed').slice(0, 120),
      checkedAt
    };
  }
}

/**
 * Revenue / orders KPIs from durable orders in date range.
 */
export async function computeCommerceKpis(from, to) {
  const orders = await commerceListOrders();
  const inWindow = orders.filter((o) => inRange(o.created_at, from, to));
  const paid = inWindow.filter((o) => PAID_STATUSES.has(o.status));
  const revenue = paid.reduce((s, o) => s + Number(o.total || 0), 0);
  const units = paid.reduce(
    (s, o) => s + (o.items || []).reduce((n, li) => n + Number(li.quantity || 0), 0),
    0
  );

  const jobs = await commerceListFulfillmentJobs({ limit: 500 });
  const jobsInWindow = jobs.filter((j) => inRange(j.updated_at || j.created_at, from, to));
  const submitted = jobs.filter((j) => j.status === 'submitted').length;
  const blocked = jobs.filter((j) => j.status === 'blocked').length;
  const failed = jobs.filter((j) => j.status === 'failed').length;
  const queued = jobs.filter((j) =>
    ['queued_for_supplier', 'queued', 'processing'].includes(j.status)
  ).length;
  const dryRunReady = jobs.filter((j) => j.status === 'dry_run_ready').length;

  const attempted = jobs.filter((j) =>
    !['queued_for_supplier', 'queued'].includes(j.status)
  ).length;
  const successSubmitted = jobs.filter((j) => j.status === 'submitted').length;
  const fulfillmentSuccessRate =
    attempted > 0 ? Math.round((successSubmitted / attempted) * 100) : null;

  return {
    revenueCents: Math.round(revenue * 100),
    revenue: revenue,
    paidOrderCount: paid.length,
    averageOrderValue: paid.length ? revenue / paid.length : 0,
    unitsSold: units,
    ordersInRange: inWindow.length,
    fulfillmentSubmitted: submitted,
    fulfillmentBlocked: blocked,
    fulfillmentFailed: failed,
    fulfillmentQueued: queued,
    fulfillmentDryRunReady: dryRunReady,
    fulfillmentSuccessRate
  };
}

export async function getMappingCoverage() {
  const mappings = await commerceListSupplierMappings({ activeOnly: true });
  const catalog = readStore().products?.filter((p) => p.active !== false) || [];
  const verified = mappings.filter((m) => m.verified === 1 || m.verified === true);
  const missing = catalog.filter(
    (p) => !mappings.find((m) => m.product_id === p.id)
  );

  let status = STATUS.HEALTHY;
  if (catalog.length && verified.length < catalog.length) status = STATUS.ATTENTION;
  if (catalog.length && mappings.length === 0) status = STATUS.DEGRADED;

  return {
    status,
    checkedAt: new Date().toISOString(),
    activeProducts: catalog.length,
    catalogCount: catalog.length,
    totalMappings: mappings.length,
    mappingCount: mappings.length,
    verified: verified.length,
    verifiedCount: verified.length,
    unverified: mappings.length - verified.length,
    missing: missing.length,
    missingProductIds: missing.map((p) => p.id),
    mappings: mappings.map((m) => ({
      product_id: m.product_id,
      skin_script_sku: m.skin_script_sku,
      supplier_product_name: m.supplier_product_name,
      expected_wholesale_price: m.expected_wholesale_price,
      verified: m.verified === 1 || m.verified === true,
      verified_at: m.verified_at,
      supplier_product_url: m.supplier_product_url
    }))
  };
}
