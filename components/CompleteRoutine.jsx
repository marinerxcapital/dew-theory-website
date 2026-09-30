import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import { suggestRoutineComplements } from '@/lib/routine';
import { emilyPairsWith } from '@/lib/skin-quiz';
import { formatMoney } from '@/lib/shipping';
import { isShopVisible } from '@/lib/shop';

/**
 * Single “Complete the routine” module for PDP.
 * Consolidates EmilyPairsWith sequence blurbs + routine complements into one block.
 */
export default function CompleteRoutine({
  product,
  catalog = [],
  pairLimit = 3,
  gridLimit = 3
}) {
  if (!product) return null;

  const { why, pairs } = emilyPairsWith(product, catalog, {
    isVisible: isShopVisible,
    limit: pairLimit
  });

  const complements = suggestRoutineComplements(catalog, product.id, {
    isVisible: isShopVisible,
    limit: gridLimit
  });

  // Prefer sequence blurbs when available; otherwise fall back to complement cards.
  const showPairs = pairs.length > 0;
  const grid = showPairs ? [] : complements;

  if (!showPairs && !grid.length) return null;

  return (
    <section
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="complete-routine-heading"
      data-reveal-group="complete-routine"
    >
      <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-sage-deep">
        Complete the routine
      </p>
      <h2
        id="complete-routine-heading"
        className="mt-2 font-display text-[clamp(1.7rem,3.2vw,2.2rem)] font-normal text-ink"
      >
        Next steps in order
      </h2>
      <p className="mt-3 max-w-xl font-body text-sm font-normal leading-relaxed text-muted">
        {why ||
          'Suggested by typical layering order (cleanser → tone → treat → moisturize → SPF). Not a medical protocol.'}
      </p>

      {pairs.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map(({ product: p, step, blurb }) => (
            <li key={p.id}>
              <Link
                href={`/shop/${p.id}`}
                className="group flex h-full gap-4 rounded-card border border-border bg-white p-4 transition-[border-color,box-shadow] hover:border-ink/30 hover:shadow-card"
              >
                <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-card bg-surface-light">
                  <ProductImage
                    product={p}
                    sizes="72px"
                    quality={70}
                    className="!aspect-auto h-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-label text-[0.55rem] uppercase tracking-lockup text-muted">
                    {step}
                  </p>
                  <p className="mt-1 font-display text-lg font-normal text-ink group-hover:text-charcoal">
                    {p.name}
                  </p>
                  <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-muted">
                    {blurb}
                  </p>
                  <p className="mt-3 font-label text-sm tracking-wide2 text-ink">
                    {formatMoney(p.retail_price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {grid.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {grid.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <Link
          href="/virtual-consultation"
          className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
        >
          Book a consultation →
        </Link>
      </div>
    </section>
  );
}
