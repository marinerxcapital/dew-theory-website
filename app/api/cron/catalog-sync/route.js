import { NextResponse } from 'next/server';
import { authorizeCronRequest, runCatalogSyncCron } from '@/lib/catalog-sync-cron';

/**
 * POST /api/cron/catalog-sync
 * Header: Authorization: Bearer $CRON_SECRET  OR  x-cron-secret: $CRON_SECRET
 *
 * Applies only when a live source + secrets are ready. Otherwise returns 200
 * with skipped=true and a clear code (never silently applies mock as live).
 */
export async function POST(request) {
  const gate = authorizeCronRequest(request.headers, process.env);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error, code: gate.code }, { status: gate.status });
  }

  try {
    const result = await runCatalogSyncCron();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Cron sync failed', code: err?.code || 'cron_failed' },
      { status: 500 }
    );
  }
}
