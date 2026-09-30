import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import FavoriteActions from '@/components/customer/FavoriteActions';
import { requireCustomer } from '@/lib/customers/guards';
import { listFavorites } from '@/lib/customers/store';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = withPageMetadata('/favorites', {
  title: 'Favorites',
  description: 'The products you have saved at Dew Theory.',
  alternates: { canonical: '/favorites' },
  robots: { index: false, follow: false }
});

export const dynamic = 'force-dynamic';

// Favorites.
//
// Protected server-side (`requireCustomer`) and read by the session's own
// customer id, so one account cannot request another's list. Saved ids that are
// no longer shop-visible are dropped rather than rendered as broken tiles.
export default async function FavoritesPage() {
  const customer = await requireCustomer();
  const rows = await listFavorites(customer.id);

  const visible = getProducts().filter(isShopVisible);
  const byId = new Map(visible.map((p) => [p.id, p]));
  const products = rows.map((r) => byId.get(r.product_id)).filter(Boolean);
  const savedIds = products.map((p) => p.id);

  return (
    <PageShell
      eyebrow="Account"
      title="Favorites"
      intro={
        products.length
          ? 'Everything you have saved, in one place.'
          : 'Nothing saved yet — the heart on any product page adds it here.'
      }
      actions={
        products.length ? (
          <>
            <FavoriteActions productIds={savedIds} />
            <ShellPrimary href="/shop">Keep shopping</ShellPrimary>
          </>
        ) : (
          <ShellPrimary href="/shop">Shop the collection</ShellPrimary>
        )
      }
    >
      {products.length ? (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <li key={product.id} className="h-full">
              <ProductCard product={product} revealIndex={i} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-border px-8 py-16 text-center">
          <p className="font-display text-[1.5rem] text-ink">No favorites yet.</p>
          <p className="mx-auto mt-4 max-w-md font-body text-[0.95rem] leading-[1.7] text-muted">
            Browse the collection and save anything you want to come back to. Favorites are held
            against your account, so they follow you between devices.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="btn-primary inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Shop all products
            </Link>
            <Link
              href="/skin-concerns"
              className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Shop by concern
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
