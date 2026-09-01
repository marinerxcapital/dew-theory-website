import Link from 'next/link';
import { requireOwnerAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import ProductStockToggle from '@/components/admin/ProductStockToggle';

export default async function AdminProductsPage() {
  await requireOwnerAdmin();
  const { products } = readStore();

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-normal text-graphite sm:text-3xl">Products</h1>
          <p className="mt-2 font-body text-sm font-light text-charcoal/70">
            Full CRUD. Retail auto ×2 on wholesale change. Inactive / discontinued stay off the shop.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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

      {/* Mobile cards */}
      <ul className="admin-card-list mt-8">
        {products.map((p) => (
          <li key={p.id} className="glass-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-normal text-graphite">{p.name}</p>
                <p className="mt-1 font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome">
                  {p.category} · {p.stock_status || 'in_stock'}
                </p>
              </div>
              <p className="shrink-0 font-label text-sm font-light tracking-wide2 text-charcoal">
                {formatMoney(p.retail_price)}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-chrome/15 pt-3">
              <ProductStockToggle
                productId={p.id}
                stockStatus={p.stock_status}
                active={p.active}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="font-body text-xs font-light text-chrome">{p.source || 'manual'}</span>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="admin-table-wrap table-scroll mt-10">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-chrome/25 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Retail</th>
              <th className="py-3 pr-4">Stock / Active</th>
              <th className="py-3 pr-4">Source</th>
              <th className="py-3"> </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-chrome/15 font-body text-sm font-light">
                <td className="py-4 pr-4 text-graphite">
                  {p.name}
                  {p.active === false && (
                    <span className="ml-2 font-label text-[0.55rem] uppercase tracking-lockup text-chrome">
                      hidden
                    </span>
                  )}
                </td>
                <td className="py-4 pr-4 text-charcoal/70">{p.category}</td>
                <td className="py-4 pr-4">{formatMoney(p.retail_price)}</td>
                <td className="py-4 pr-4">
                  <ProductStockToggle
                    productId={p.id}
                    stockStatus={p.stock_status}
                    active={p.active}
                  />
                </td>
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
