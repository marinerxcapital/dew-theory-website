import Rule from '@/components/Rule';
import ShopGrid from '@/components/ShopGrid';
import { PRODUCTS } from '@/lib/products';

export const metadata = {
  title: 'Shop — Dew Theory',
  description: 'Skin Script professional skincare — the same actives Emily uses in the studio.'
};

export default function ShopPage() {
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
          Eight Skin Script formulations, priced at wholesale × 2. No inflated sticker prices —
          discounts land at checkout via promo code, not on the shelf.
        </p>
      </div>

      <div className="mt-16">
        <ShopGrid products={PRODUCTS} />
      </div>
    </section>
  );
}
