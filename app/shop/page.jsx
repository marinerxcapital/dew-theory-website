import Rule from '@/components/Rule';
import ShopGrid from '@/components/ShopGrid';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = {
  title: 'Shop',
  description:
    'Skin Script professional skincare — the same actives Emily uses in the studio. Retail at wholesale × 2.',
  openGraph: {
    title: 'Shop — Dew Theory',
    description:
      'Skin Script professional skincare — the same actives Emily uses in the studio.',
    images: [{ url: '/logo.png', alt: 'Dew Theory' }]
  }
};

// Admin edits land in the runtime store; revalidate so shop stays current.
export const dynamic = 'force-dynamic';

export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div data-reveal-group="shop-head">
        <Rule left="Shop" right="Skin Script" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-graphite"
        >
          The collection
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          {count === 0
            ? 'Products will appear here once the catalog is ready.'
            : `${count} Skin Script formulation${count === 1 ? '' : 's'}, priced at wholesale × 2. No inflated sticker prices — discounts land at checkout via promo code, not on the shelf.`}
        </p>
      </div>

      <div className="mt-16">
        <ShopGrid products={all} />
      </div>
    </section>
  );
}
