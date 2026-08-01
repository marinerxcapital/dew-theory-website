import Rule from '@/components/Rule';
import ShopGrid from '@/components/ShopGrid';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

export const metadata = {
  title: 'Shop',
  description:
    'Skin Script professional skincare — the same actives Emily uses in the studio. Free shipping at $49+ pre-discount.',
  openGraph: {
    title: 'Shop — Dew Theory',
    description:
      'Skin Script professional skincare — the same actives Emily uses in the studio.',
    images: [{ url: '/logo.png', alt: 'Dew Theory' }]
  }
};

export const revalidate = 60;

export default function ShopPage() {
  const all = getProducts();
  const visible = all.filter(isShopVisible);
  const count = visible.length;

  return (
    <section className="relative mx-auto max-w-shell px-6 pb-24 pt-28 sm:pb-32 sm:pt-32 lg:px-10">
      <div data-reveal-group="shop-head">
        <Rule left="Shop" right="Skin Script" data-reveal />
        <h1
          data-reveal
          className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-graphite sm:mt-6"
        >
          The collection
        </h1>
        <p
          data-reveal
          className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-charcoal/75 sm:mt-6"
        >
          {count === 0
            ? 'Products will appear here once the catalog is ready.'
            : `${count} Skin Script formulation${count === 1 ? '' : 's'} — professional actives, clear pricing.`}
        </p>
        {count > 0 && (
          <p
            data-reveal
            className="mt-5 inline-flex max-w-xl border border-chrome/15 bg-surface px-4 py-3 font-body text-xs font-normal leading-relaxed text-charcoal/70"
          >
            Free shipping at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal
            (before discount). Below that, {formatMoney(FLAT_SHIPPING_USD)} flat.
          </p>
        )}
      </div>

      <div className="mt-10 sm:mt-12">
        <ShopGrid products={all} />
      </div>
    </section>
  );
}
