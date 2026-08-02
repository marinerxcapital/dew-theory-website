import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { emilyPairsWith } from '@/lib/skin-quiz';
import { formatMoney } from '@/lib/shipping';
import { isShopVisible } from '@/lib/shop';

/**
 * Server-friendly “Emily pairs with” block for PDP + shop context.
 */
export default function EmilyPairsWith({ product, catalog = [], limit = 4 }) {
  if (!product) return null;

  const { title, why, pairs } = emilyPairsWith(product, catalog, {
    isVisible: isShopVisible,
    limit
  });

  if (!pairs.length) return null;

  return (
    <section className="mt-16 border-t border-chrome/15 pt-14" aria-labelledby="emily-pairs-heading">
      <p className="eyebrow-line font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
        Sequence · Studio logic
      </p>
      <h2
        id="emily-pairs-heading"
        className="mt-3 font-display text-[clamp(1.7rem,3.5vw,2.3rem)] font-normal text-graphite"
      >
        {title}
      </h2>
      <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-charcoal/75 sm:text-base">
        {why}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {pairs.map(({ product: p, step, blurb }) => (
          <li key={p.id}>
            <Link
              href={`/shop/${p.id}`}
              className="group flex h-full gap-4 rounded-[2px] border border-chrome/15 bg-surface p-4 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
            >
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[2px] bg-pearl">
                <ProductImage
                  product={p}
                  sizes="80px"
                  quality={70}
                  className="!aspect-auto h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-chrome">
                  Next · {step}
                </p>
                <p className="mt-1 font-display text-lg font-normal text-graphite group-hover:text-charcoal">
                  {p.name}
                </p>
                <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal/65">
                  {blurb}
                </p>
                <p className="mt-3 font-label text-sm font-normal tracking-wide2 text-graphite">
                  {formatMoney(p.retail_price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/routine"
          className="btn-ghost min-h-[44px] px-6 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup"
        >
          Build full routine
        </Link>
        <Link
          href="/quiz"
          className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Take the skin quiz →
        </Link>
      </div>
    </section>
  );
}
