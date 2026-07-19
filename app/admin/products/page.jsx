import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';

export default async function AdminProductsPage() {
  await requireAdmin();
  const { products } = readStore();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-normal text-graphite">Products</h1>
          <p className="mt-2 font-body text-sm font-light text-charcoal/70">
            Full CRUD. Retail auto-computes at wholesale × 2 on create/import.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/import"
            className="border border-graphite/25 px-5 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            CSV import
          </Link>
          <Link
            href="/admin/products/new"
            className="border border-graphite bg-graphite px-5 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-chrome/25 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Retail</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Source</th>
              <th className="py-3"> </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-chrome/15 font-body text-sm font-light">
                <td className="py-4 pr-4 text-graphite">{p.name}</td>
                <td className="py-4 pr-4 text-charcoal/70">{p.category}</td>
                <td className="py-4 pr-4">{formatMoney(p.retail_price)}</td>
                <td className="py-4 pr-4 text-charcoal/70">{p.stock_status || 'in_stock'}</td>
                <td className="py-4 pr-4 text-chrome">{p.source || 'manual'}</td>
                <td className="py-4">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
