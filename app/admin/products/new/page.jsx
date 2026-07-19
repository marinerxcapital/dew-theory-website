import { requireAdmin } from '@/lib/require-admin';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-3xl text-graphite">Add product</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        Retail defaults to wholesale × 2; adjust before save if needed.
      </p>
      <div className="mt-10">
        <ProductForm />
      </div>
    </div>
  );
}
