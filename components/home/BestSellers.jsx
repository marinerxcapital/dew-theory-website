import Link from 'next/link';
import { Suspense } from 'react';
import ProductRail from '@/components/ProductRail';

/**
 * Emily's picks — a short, high-converting rail of real catalog products.
 *
 * The id list is resolved on the server against the live catalog, so a product
 * that is unpublished or discontinued simply drops out of the rail.
 *
 * @param {{ products?: object[] }} props
 */
export default function BestSellers({ products = [] }) {
  if (!products.length) return null;

  return (
    <section
      className="border-b border-border bg-ivory py-16 sm:py-20"
      aria-labelledby="emily-picks"
    >
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div className="max-w-2xl">
            <p className="editorial-label">where most people start</p>
            <h2
              id="emily-picks"
              className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal text-forest"
            >
              Emily&apos;s picks
            </h2>
            <p className="mt-3 max-w-lg font-body text-sm font-normal leading-relaxed text-muted">
              A short, sequenced set — chosen the way Emily chooses in the room, not by what sells
              fastest.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
          >
            Shop all
          </Link>
        </div>

        <Suspense fallback={null}>
          <ProductRail products={products} label="Emily's picks" />
        </Suspense>
      </div>
    </section>
  );
}
