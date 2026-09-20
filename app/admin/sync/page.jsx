import Rule from '@/components/Rule';
import CatalogSyncPanel from '@/components/admin/CatalogSyncPanel';
import { requireOwnerAdmin } from '@/lib/require-admin';
import { getEnabledAllowlistEntries, loadCatalogAllowlist } from '@/lib/catalog-allowlist.js';
import { evaluateCatalogSyncReadiness } from '@/lib/catalog-sync-readiness.js';
import { readStore } from '@/lib/store.js';

export const metadata = {
  title: 'Catalog sync'
};

export default async function AdminSyncPage() {
  await requireOwnerAdmin();

  const allowlist = loadCatalogAllowlist();
  const lastSync = readStore().catalog_sync || null;
  const readiness = evaluateCatalogSyncReadiness();

  return (
    <section className="mx-auto max-w-shell px-6 py-12 lg:px-10">
      <Rule left="Admin" right="Skin Script" />
      <h1 className="mt-6 font-display text-[clamp(2rem,4vw,2.8rem)] font-normal text-graphite">
        Catalog sync
      </h1>
      <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/75">
        Autonomous refresh is allowlist-only — the current eight shop SKUs, not the full wholesale
        catalog. Live sources are RPA (wholesale portal) or an authorized CSV/JSON feed. Mock is
        local/dev only and is never treated as live. See docs/SKIN_SCRIPT_SYNC.md.
      </p>
      <div className="mt-10">
        <CatalogSyncPanel
          allowlist={allowlist.products}
          allowlistEnabled={getEnabledAllowlistEntries(allowlist).length}
          lastSync={lastSync}
          readiness={readiness}
          defaultSource={readiness.mode || 'mock'}
        />
      </div>
    </section>
  );
}
