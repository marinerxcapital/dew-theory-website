import Image from 'next/image';
import Link from 'next/link';
import { spectralFamilyForProduct, spectralStyle } from '@/lib/spectral';
import { productImageAlt, productImageSrc } from '@/lib/product-image';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock } from '@/lib/shop';

/**
 * Featured product story — one real product, one benefit line, one CTA.
 *
 * All copy comes from the catalog record passed in by the server page, so the
 * section can never drift from the product it points at.
 *
 * @param {{ product?: object }} props
 */
export default function FeaturedProductStory({ product }) {
  if (!product) return null;

  const family = spectralFamilyForProduct(product);
  const oos = isOutOfStock(product);
  const src = productImageSrc(product);
  const concerns = Array.isArray(product.conditions_addressed)
    ? product.conditions_addressed.slice(0, 3)
    : [];

  return (
    <section
      id="featured"
      className="spectral-field border-b border-border"
      style={spectralStyle(family)}
      aria-labelledby="featured-product-story"
    >
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {src ? (
            <div className="spectral-glow relative mx-auto w-full max-w-md" data-reveal>
              <div className="relative aspect-[52/77] w-full">
                <Image
                  src={src}
                  alt={product.image_alt || `Skin Script ${product.name}`}
                  fill
                  sizes="(max-width: 1023px) 88vw, 40vw"
                  quality={85}
                  className="object-contain drop-shadow-[0_30px_48px_rgba(30,43,34,0.20)]"
                />
              </div>
            </div>
          ) : null}

          <div className="min-w-0" data-reveal>
            <p
              className="family-chip font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted"
              style={spectralStyle(family)}
            >
              {family.label} · {product.category}
            </p>
            <h2
              id="featured-product-story"
              className="mt-4 max-w-xl font-display text-[clamp(1.9rem,4vw,2.9rem)] font-normal leading-[1.08] text-ink"
            >
              {product.name}
            </h2>
            <p className="mt-5 max-w-lg font-body text-base font-normal leading-relaxed text-charcoal">
              {product.description_short}
            </p>

            {concerns.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {concerns.map((c) => (
                  <li
                    key={c}
                    className="border border-border bg-white/70 px-3 py-1.5 font-label text-[0.55rem] font-normal uppercase tracking-lockup text-muted"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href={`/shop/${product.id}`}
                className="btn-primary inline-flex min-h-[50px] items-center px-9 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                {oos ? 'View product' : 'Shop this'}
              </Link>
              <p className="font-label text-lg font-normal tracking-wide2 text-ink">
                {formatMoney(product.retail_price)}
                {product.size ? (
                  <span className="ml-2 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                    {product.size}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
