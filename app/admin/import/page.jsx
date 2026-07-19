import { requireAdmin } from '@/lib/require-admin';
import CsvImport from '@/components/admin/CsvImport';

export default async function AdminImportPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Skin Script CSV import</h1>
      <p className="mt-2 max-w-xl font-body text-sm font-light text-charcoal/70">
        Primary catalog path (Addendum §16.1). No scraping. No assumed vendor API. Map columns,
        review retail (wholesale × 2), confirm.
      </p>
      <div className="mt-10">
        <CsvImport />
      </div>
    </div>
  );
}
