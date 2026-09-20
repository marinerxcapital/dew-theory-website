import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { runCatalogSync } from '@/lib/catalog-sync';
import { evaluateApplyForSource, evaluateCatalogSyncReadiness } from '@/lib/catalog-sync-readiness.js';
import { getEnabledAllowlistEntries, loadCatalogAllowlist } from '@/lib/catalog-allowlist.js';
import { isSupplierMode } from '@/lib/suppliers/types.js';
import { readStore } from '@/lib/store.js';

function syncStatusPayload() {
  const allowlist = loadCatalogAllowlist();
  return {
    allowlist: {
      total: allowlist.products.length,
      enabled: getEnabledAllowlistEntries(allowlist).length,
      products: allowlist.products
    },
    last_sync: readStore().catalog_sync || null,
    readiness: evaluateCatalogSyncReadiness()
  };
}

function slimSyncResult(result) {
  return {
    dry_run: result.dry_run,
    adapter: result.adapter,
    source: result.source,
    allowlist: result.allowlist,
    totals: result.totals,
    applied: result.applied || false,
    touchedIds: result.touchedIds || [],
    create: (result.plan.create || []).map((r) => ({
      id: r.product?.id,
      name: r.product?.name,
      sku: r.sku
    })),
    update: (result.plan.update || []).map((r) => ({
      id: r.id,
      name: r.product?.name,
      sku: r.sku
    })),
    skip: (result.plan.skip || []).slice(0, 80).map((r) => ({
      reason: r.reason,
      id: r.id,
      sku: r.sku
    })),
    error: (result.plan.error || []).map((r) => ({
      reason: r.reason,
      error: r.error,
      sku: r.draft?.skin_script_sku || r.sku,
      id: r.id
    }))
  };
}

/**
 * GET /api/admin/sync/catalog — allowlist, last sync, readiness (no secrets).
 */
export async function GET(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  return NextResponse.json(syncStatusPayload());
}

/**
 * POST /api/admin/sync/catalog
 * body: { dry_run?: boolean, source?: 'mock'|'csv_feed'|'http'|'rpa' }
 * Default dry_run=true for safety. Apply is refused when the chosen source is not ready.
 */
export async function POST(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dry_run !== false;
    const source = body.source ? String(body.source).toLowerCase() : undefined;

    if (source && !isSupplierMode(source)) {
      return NextResponse.json(
        { error: `Invalid source "${source}"`, code: 'source_invalid' },
        { status: 400 }
      );
    }

    if (!dryRun) {
      const readiness = evaluateApplyForSource(source);
      if (!readiness.applyAllowed) {
        return NextResponse.json(
          {
            error: readiness.reason,
            code: readiness.code,
            readiness
          },
          { status: 409 }
        );
      }
    }

    const result = await runCatalogSync({
      dry_run: dryRun,
      source,
      adminId: dryRun ? null : admin.id,
      revalidate: !dryRun
    });

    return NextResponse.json({
      ...slimSyncResult(result),
      ...syncStatusPayload()
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err?.message || 'Sync failed',
        code: err?.code || 'sync_failed'
      },
      { status: 500 }
    );
  }
}
