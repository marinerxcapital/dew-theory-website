import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import { IconArrowRight } from '@/components/Icons';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { concernFamiliesWithCounts } from '@/lib/concerns';

export const metadata = withPageMetadata('/skin-concerns', {
  title: 'Shop by skin concern',
  description:
    'Start from what your skin is actually doing — congestion, uneven tone, dehydration, reactivity, lines or lips — and see the Skin Script products that address it.',
  alternates: { canonical: '/skin-concerns' },
  openGraph: {
    title: 'Shop by skin concern — Dew Theory',
    description:
      'Start from what your skin is actually doing, and see the Skin Script products that address it.',
    url: '/skin-concerns',
    type: 'website'
  }
});

export const revalidate = 60;

/**
 * Concern index.
 *
 * Every family here maps only to `conditions_addressed` values that exist in
 * the catalog (see lib/concerns.js), and each tile shows the live product count,
 * so the shelf and the products behind it can never disagree.
 */
export default function SkinConcernsPage() {
  const visible = getProducts().filter(isShopVisible);
  const families = concernFamiliesWithCounts(visible).filter((f) => f.count > 0);

  return (
    <PageShell
      eyebrow="Guidance"
      title="Shop by skin concern"
      intro={`${visible.length} products is a wall. Three to five is a routine. Pick what your skin is doing right now and start there — every shelf below shows only the products that declare that concern.`}
      actions={
        <>
          <ShellPrimary href="/virtual-consultation">Start a consultation</ShellPrimary>
          <Link
            href="/shop"
            className="btn-tertiary inline-flex min-h-[52px] items-center font-body text-[0.68rem] font-medium uppercase tracking-lockup"
          >
            Browse everything
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </>
      }
    >
      <ul className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {families.map((family) => (
          <li key={family.slug} className="bg-void">
            <Link
              href={`/skin-concerns/${family.slug}`}
              className="group flex h-full min-h-[16rem] flex-col justify-between p-7 transition-colors duration-300 hover:bg-surface lg:min-h-[19rem] lg:p-9"
            >
              <span className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                {family.count} {family.count === 1 ? 'product' : 'products'}
              </span>
              <span>
                <span className="block font-display text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.02] tracking-headline text-ink">
                  {family.label}
                </span>
                <span className="mt-4 block max-w-sm font-body text-[0.92rem] font-normal leading-[1.65] text-muted">
                  {family.blurb}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 font-body text-[0.66rem] font-medium uppercase tracking-lockup text-ink">
                  Shop the shelf
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
