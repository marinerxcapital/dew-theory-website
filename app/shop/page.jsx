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

// Admin edits revalidate via revalidateProductSurfaces; ISR keeps shop warm.
export const revalidate = 60;

export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;

  return (
    <section className="relative mx-auto max-w-shell px-6 pb-24 pt-32 sm:pb-32 sm:pt-36 lg:px-10">
      <div
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-64 w-[min(90vw,42rem)] -translate-x-1/2 rounded-full bg-ice/25 blur-3xl"
        aria-hidden="true"
      />
      <div data-reveal-group="shop-head">
        <Rule left="Shop" right="Skin Script" data-reveal />
        <h1
          data-reveal
          className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,6.5vw,4.6rem)] font-normal leading-[1.02] text-graphite sm:mt-8"
        >
          The collection
        </h1>
        <p
          data-reveal
          className="mt-5 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75 sm:mt-7 sm:text-[1.05rem]"
        >
          {count === 0
            ? 'Products will appear here once the catalog is ready.'
            : `${count} Skin Script formulation${count === 1 ? '' : 's'}, priced at wholesale × 2. No inflated sticker prices — discounts land at checkout via promo code, not on the shelf.`}
        </p>
      </div>

      <div className="mt-8 sm:mt-12">
        <ShopGrid products={all} />
      </div>
    </section>
  );
}
