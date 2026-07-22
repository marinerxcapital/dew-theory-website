import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { runCatalogSync } from '@/lib/catalog-sync';
import { isSupplierMode } from '@/lib/suppliers/types.js';

/**
 * POST /api/admin/sync/catalog
 * body: { dry_run?: boolean, source?: 'mock'|'csv_feed'|'http' }
 * Default dry_run=true for safety.
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

    const result = await runCatalogSync({
      dry_run: dryRun,
      source,
      adminId: dryRun ? null : admin.id,
      revalidate: !dryRun
    });

    // Slim plan for response (avoid huge payloads)
    return NextResponse.json({
      dry_run: result.dry_run,
      adapter: result.adapter,
      source: result.source,
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
      skip: (result.plan.skip || []).slice(0, 50).map((r) => ({
        reason: r.reason,
        id: r.id,
        sku: r.sku
      })),
      error: (result.plan.error || []).map((r) => ({
        reason: r.reason,
        error: r.error,
        sku: r.draft?.skin_script_sku
      }))
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
