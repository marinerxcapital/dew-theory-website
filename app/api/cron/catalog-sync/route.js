import { NextResponse } from 'next/server';
import { runCatalogSync } from '@/lib/catalog-sync';

/**
 * POST /api/cron/catalog-sync
 * Header: Authorization: Bearer $CRON_SECRET  OR  x-cron-secret: $CRON_SECRET
 */
export async function POST(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured', code: 'cron_unconfigured' },
      { status: 503 }
    );
  }

  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const headerSecret = request.headers.get('x-cron-secret') || '';
  if (bearer !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized', code: 'cron_unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCatalogSync({
      dry_run: false,
      adminId: 'cron',
      revalidate: true
    });
    return NextResponse.json({
      ok: true,
      totals: result.totals,
      touchedIds: result.touchedIds || []
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Cron sync failed', code: err?.code || 'cron_failed' },
      { status: 500 }
    );
  }
}
