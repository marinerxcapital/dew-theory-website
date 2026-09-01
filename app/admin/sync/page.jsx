import Rule from '@/components/Rule';
import CatalogSyncPanel from '@/components/admin/CatalogSyncPanel';
import { requireOwnerAdmin } from '@/lib/require-admin';

export const metadata = {
  title: 'Catalog sync'
};

export default async function AdminSyncPage() {
  await requireOwnerAdmin();

  return (
    <section className="mx-auto max-w-shell px-6 py-12 lg:px-10">
      <Rule left="Admin" right="Skin Script" />
      <h1 className="mt-6 font-display text-[clamp(2rem,4vw,2.8rem)] font-normal text-graphite">
        Catalog sync
      </h1>
      <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/75">
        Pull authorized supplier catalog into the store. Mock works offline. Real Skin Script HTTP
        requires partner credentials — see docs/SKIN_SCRIPT_SYNC.md. Does not scrape public websites.
      </p>
      <div className="mt-10">
        <CatalogSyncPanel />
      </div>
    </section>
  );
}
