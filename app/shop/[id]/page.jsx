import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import ProductViewTracker from '@/components/ProductViewTracker';
import EmilyPairsWith from '@/components/EmilyPairsWith';
import { PRODUCTS } from '@/lib/products';
import { productImageAlt, productImageSrc } from '@/lib/product-image';
import { getProduct, getProducts } from '@/lib/products-server';
import { suggestRoutineComplements } from '@/lib/routine';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';
import { isShopVisible, stockLabel } from '@/lib/shop';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id) || PRODUCTS.find((p) => p.id === id);
  if (!product) return { title: 'Product' };
  const img = productImageSrc(product);
  const desc =
    product.description_short ||
    `${product.name} — Skin Script professional skincare at Dew Theory.`;
  return {
    title: `${product.name} | Skin Script`,
    description: desc,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — Dew Theory`,
      description: desc,
      url: `/shop/${product.id}`,
      images: [{ url: img, width: 832, height: 1232, alt: productImageAlt(product) }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — Dew Theory`,
      description: desc,
      images: [img]
    },
    robots: { index: true, follow: true }
  };
}

export const revalidate = 60;

function AccordionSection({ title, children, defaultOpen = false }) {
  return (
    <details
      className="group border-b border-border py-4"
      open={defaultOpen || undefined}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-label text-[0.68rem] font-normal uppercase tracking-lockup text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
        {children}
      </div>
    </details>
  );
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const actives = product.key_actives || product.active_ingredients || [];
  const badge = stockLabel(product);

  const all = getProducts();
  const related = suggestRoutineComplements(all, product.id, {
    isVisible: isShopVisible,
    limit: 3
  });

  if (related.length < 3) {
    for (const p of all) {
      if (related.length >= 3) break;
      if (p.id === product.id || !isShopVisible(p)) continue;
      if (related.some((r) => r.id === p.id)) continue;
      const sameCat = p.category === product.category;
      const sharedSkin = (product.skin_types || []).some((t) =>
        (p.skin_types || []).includes(t)
      );
      if (sameCat || sharedSkin) related.push(p);
    }
  }
  if (related.length < 3) {
    for (const p of all) {
      if (related.length >= 3) break;
      if (p.id === product.id || !isShopVisible(p)) continue;
      if (related.some((r) => r.id === p.id)) continue;
      related.push(p);
    }
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(
    /\/$/,
    ''
  );
  const imgUrl = `${site}${productImageSrc(product)}`;
  const productUrl = `${site}/shop/${product.id}`;
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description_short,
    image: [imgUrl],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Skin Script' },
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: Number(product.retail_price).toFixed(2),
      availability:
        product.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: productUrl,
      seller: { '@type': 'Organization', name: 'Dew Theory' }
    }
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${site}/shop` },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl
      }
    ]
  };

  return (
    <article className="mx-auto max-w-shell px-5 pb-24 pt-10 sm:px-6 sm:pt-12 lg:px-10">
      <JsonLd data={[productLd, breadcrumbLd]} />
      <ProductViewTracker productId={product.id} />

      <nav aria-label="Breadcrumb" className="mb-8" data-reveal>
        <ol className="flex flex-wrap items-center gap-2 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-ink">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/shop?type=${encodeURIComponent(product.category)}`}
              className="hover:text-ink"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-ink/70">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div
        className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14"
        data-reveal-group="pdp"
      >
        <div data-reveal className="relative bg-surface-light lg:sticky lg:top-28">
          <ProductImage
            product={product}
            priority
            framed
            quality={75}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 560px"
          />
          {badge ? (
            <span className="absolute left-4 top-4 z-[2] border border-border bg-white/95 px-3 py-1.5 font-label text-[0.58rem] font-normal uppercase tracking-lockup text-ink">
              {badge}
            </span>
          ) : null}
        </div>

        <div data-reveal className="lg:sticky lg:top-28">
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
            Skin Script
            {product.size ? ` · ${product.size}` : ''}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.2vw,3rem)] font-normal leading-[1.08] text-ink">
            {product.name}
          </h1>
          <p className="mt-2 font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            {product.category}
          </p>
          <p className="mt-5 font-label text-xl font-normal tracking-wide2 text-ink">
            {formatMoney(product.retail_price)}
          </p>
          <p className="mt-5 max-w-lg font-body text-base font-normal leading-relaxed text-charcoal">
            {product.description_short}
          </p>

          <AddToCart product={product} className="mt-8" />

          <div className="mt-5 border border-border bg-surface-light px-4 py-3">
            <p className="font-body text-xs leading-relaxed text-charcoal">
              Free shipping on {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal. Flat{' '}
              {formatMoney(FLAT_SHIPPING_USD)} below threshold.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="btn-dew-outline min-h-[44px] px-5 py-2.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
            >
              Find my routine
            </Link>
            <Link
              href="/virtual-consultation"
              className="inline-flex min-h-[44px] items-center font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
            >
              Ask Emily
            </Link>
          </div>

          <div className="mt-10">
            <AccordionSection title="What it is" defaultOpen>
              {product.description_short}
            </AccordionSection>
            {product.skin_types?.length > 0 ? (
              <AccordionSection title="Best for / skin types">
                {product.skin_types.join(' · ')}
                {product.not_recommended_for?.length ? (
                  <span className="mt-2 block text-muted">
                    Not typically recommended for: {product.not_recommended_for.join(', ')}.
                  </span>
                ) : null}
              </AccordionSection>
            ) : null}
            {product.conditions_addressed?.length > 0 ? (
              <AccordionSection title="What it addresses">
                {product.conditions_addressed.join(' · ')}
              </AccordionSection>
            ) : null}
            {actives.length > 0 ? (
              <AccordionSection title="Key actives">
                <ul className="space-y-3">
                  {actives.map((a) => (
                    <li key={a.name}>
                      <p className="font-body text-sm text-ink">{a.name}</p>
                      <p className="mt-1 text-muted">{a.function}</p>
                    </li>
                  ))}
                </ul>
              </AccordionSection>
            ) : null}
            {product.how_to_use ? (
              <AccordionSection title="How to use">{product.how_to_use}</AccordionSection>
            ) : null}
            <AccordionSection title="Shipping & returns">
              Free shipping at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal before
              discount. Flat {formatMoney(FLAT_SHIPPING_USD)} below. See{' '}
              <Link href="/shipping" className="text-ink underline underline-offset-2">
                Shipping
              </Link>
              ,{' '}
              <Link href="/returns" className="text-ink underline underline-offset-2">
                Returns
              </Link>
              ,{' '}
              <Link href="/terms" className="text-ink underline underline-offset-2">
                Terms
              </Link>
              , and{' '}
              <Link href="/privacy" className="text-ink underline underline-offset-2">
                Privacy
              </Link>{' '}
              for full details.
            </AccordionSection>
            <AccordionSection title="Professional guidance">
              Unsure how this fits your barrier this week?{' '}
              <Link href="/quiz" className="text-dew underline underline-offset-2">
                Take the Skin Quiz
              </Link>
              , or{' '}
              <Link
                href="/virtual-consultation"
                className="text-dew underline underline-offset-2"
              >
                book a virtual consultation
              </Link>{' '}
              with Emily.
            </AccordionSection>
          </div>
        </div>
      </div>

      <EmilyPairsWith product={product} catalog={all} limit={4} />

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-12" data-reveal-group="related">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
                Complete the routine
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.7rem,3.2vw,2.2rem)] font-normal text-ink">
                Next steps
              </h2>
            </div>
          </div>
          <p className="mt-3 max-w-xl font-body text-sm font-normal leading-relaxed text-muted">
            Suggested by typical layering order (cleanser → actives → moisturizer → SPF).
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-14">
        <Link
          href="/shop"
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
        >
          ← Back to shop
        </Link>
      </div>
    </article>
  );
}
