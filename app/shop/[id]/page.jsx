import Link from 'next/link';
import { notFound } from 'next/navigation';
import Rule from '@/components/Rule';
import AddToCart from '@/components/AddToCart';
import ProductCard from '@/components/ProductCard';
import ProductViewTracker from '@/components/ProductViewTracker';
import { PRODUCTS } from '@/lib/products';
import { getProduct, getProducts } from '@/lib/products-server';
import { formatMoney } from '@/lib/shipping';
import { isShopVisible, stockLabel } from '@/lib/shop';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const product = getProduct(params.id) || PRODUCTS.find((p) => p.id === params.id);
  if (!product) return { title: 'Product' };
  return {
    title: product.name,
    description: product.description_short,
    openGraph: {
      title: `${product.name} — Dew Theory`,
      description: product.description_short,
      images: [{ url: '/logo.png', alt: product.name }]
    }
  };
}

export const dynamic = 'force-dynamic';

export default function ProductDetailPage({ params }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  const actives = product.key_actives || product.active_ingredients || [];
  const badge = stockLabel(product);

  const related = getProducts()
    .filter(
      (p) =>
        p.id !== product.id &&
        isShopVisible(p) &&
        (p.category === product.category ||
          (product.skin_types || []).some((t) => (p.skin_types || []).includes(t)))
    )
    .slice(0, 3);

  // If same-category is sparse, fill with other visible products
  if (related.length < 3) {
    for (const p of getProducts()) {
      if (related.length >= 3) break;
      if (p.id === product.id || !isShopVisible(p)) continue;
      if (related.some((r) => r.id === p.id)) continue;
      related.push(p);
    }
  }

  return (
    <article className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <ProductViewTracker productId={product.id} />

      <nav aria-label="Breadcrumb" className="mb-10" data-reveal>
        <ol className="flex flex-wrap items-center gap-2 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          <li>
            <Link href="/shop" className="hover:text-charcoal">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/shop"
              className="hover:text-charcoal"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-charcoal/70">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-14 lg:grid-cols-2 lg:items-start" data-reveal-group="pdp">
        <div data-reveal className="relative">
          <div className="iridescent aspect-[4/5] w-full rounded-[2px]" aria-hidden="true" />
          {badge && (
            <span className="absolute left-4 top-4 border border-chrome/40 bg-pearl/90 px-3 py-1.5 font-label text-[0.58rem] font-light uppercase tracking-lockup text-charcoal">
              {badge}
            </span>
          )}
        </div>

        <div data-reveal>
          <Rule left={product.category} right={product.size || 'Size TBD'} />
          <h1 className="mt-8 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-tight text-graphite">
            {product.name}
          </h1>
          <p className="mt-4 font-label text-lg font-light tracking-wide2 text-charcoal">
            {formatMoney(product.retail_price)}
          </p>
          {!product.retail_price_confirmed && (
            <p className="mt-2 font-body text-xs font-light text-charcoal/55">
              Retail price pending confirmation (wholesale × 2 applied).
            </p>
          )}
          <p className="mt-8 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75">
            {product.description_short}
          </p>

          <AddToCart product={product} className="mt-10" />

          {product.skin_types?.length > 0 && (
            <div className="mt-12 border-t border-chrome/20 pt-8">
              <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                Skin types
              </p>
              <p className="mt-3 font-body text-sm font-light text-charcoal/75">
                {product.skin_types.join(' · ')}
              </p>
            </div>
          )}

          {product.how_to_use && (
            <div className="mt-8 border-t border-chrome/20 pt-8">
              <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                How to use
              </p>
              <p className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/75">
                {product.how_to_use}
              </p>
            </div>
          )}
        </div>
      </div>

      {actives.length > 0 && (
        <section className="mt-24 border-t border-chrome/20 pt-16" data-reveal-group="actives">
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-normal text-graphite">
            Key actives
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {actives.map((a) => (
              <li key={a.name} data-reveal className="glass-1 p-6">
                <p className="font-display text-lg font-normal text-graphite">{a.name}</p>
                <p className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/70">
                  {a.function}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.conditions_addressed?.length > 0 && (
        <section className="mt-16" data-reveal>
          <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
            Addresses
          </p>
          <p className="mt-3 font-body text-sm font-light text-charcoal/75">
            {product.conditions_addressed.join(' · ')}
          </p>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24 border-t border-chrome/20 pt-16" data-reveal-group="related">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-normal text-graphite">
              Related
            </h2>
            <Link
              href="/shop"
              className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
            >
              Shop all
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-20">
        <Link
          href="/shop"
          className="font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          ← Back to shop
        </Link>
      </div>
    </article>
  );
}
