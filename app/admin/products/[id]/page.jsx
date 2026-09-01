import { notFound } from 'next/navigation';
import { requireOwnerAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }) {
  await requireOwnerAdmin();
  const product = readStore().products.find((p) => p.id === params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Edit product</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">{product.name}</p>
      <div className="mt-10">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
