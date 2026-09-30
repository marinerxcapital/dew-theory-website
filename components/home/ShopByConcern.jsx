import Link from 'next/link';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { concernFamiliesWithCounts } from '@/lib/concerns';

/**
 * Shop by skin goal.
 *
 * Tiles come from the family system, and each tile is only rendered when at
 * least one product in the live catalog actually carries the concern. The link
 * uses that real `conditions_addressed` value, so the tile and the PLP filter
 * can never disagree.
 *
 * Presentation: full-bleed black tiles with a fine grain overlay so the surface
 * has depth instead of reading as flat black, a soft pink wash that rises from
 * the bottom on hover, and an arrow that slides. The grid arrives as one
 * horizontal clip-path wipe — a different transition from the hero's blur.
 */

/** First real catalog concern that belongs to this family. */
function leadConcernFor(family, products) {
  for (const concern of family.concerns) {
    const hit = products.some((p) =>
      (p.conditions_addressed || []).some((raw) =>
        String(raw).toLowerCase().includes(concern)
      )
    );
    if (hit) return concern;
  }
  return null;
}

export default function ShopByConcern() {
  const visible = getProducts().filter(isShopVisible);

  const tiles = concernFamiliesWithCounts(visible).filter(f => f.count > 0 && f.slug !== 'lips').map(family => ({family, concern: family.label}));

  if (!tiles.length) return null;

  return (
    <section className="border-b border-border bg-void" aria-labelledby="shop-by-goal">
      <div className="mx-auto max-w-shell px-6 pb-section-sm pt-section-sm sm:pt-section-md lg:px-10 lg:pt-section-lg">
        <div className="max-w-3xl" data-reveal>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            shop by skin goal
          </p>
          <h2
            id="shop-by-goal"
            className="mt-4 font-display text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.06] tracking-headline text-ink"
          >
            Start from what your skin is telling you.
          </h2>
        </div>

        <ul className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ family, concern }) => (
            <li key={family.slug} data-reveal className="wipe-in">
              <Link
                href={`/skin-concerns/${family.slug}`}
                className="goal-tile grain flex h-full min-h-[15rem] flex-col justify-between p-7 lg:min-h-[17rem] lg:p-8"
              >
                <span className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                  {family.label}
                </span>
                <span className="mt-5 block font-display text-[clamp(1.4rem,2.6vw,1.75rem)] font-normal leading-[1.15] tracking-headline text-ink">
                  {family.blurb}
                </span>
                <span className="mt-8 inline-flex items-center gap-2 font-body text-[0.65rem] font-medium uppercase tracking-eyebrow text-muted transition-colors duration-300">
                  <span className="goal-tile-label">Shop {concern}</span>
                  <span className="goal-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/shop"
            className="btn-tertiary inline-flex min-h-[44px] items-center font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted"
          >
            Browse the full collection
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
