import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell, { ShellSecondary } from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import { IconArrowRight } from '@/components/Icons';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import {
  CONCERN_FAMILIES,
  getConcernFamily,
  productsForFamily
} from '@/lib/concerns';

export function generateStaticParams() {
  return CONCERN_FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const family = getConcernFamily(slug);
  if (!family) return { title: 'Skin concern' };
  return withPageMetadata(`/skin-concerns/${family.slug}`, {
    title: `${family.label} — Skin Script`,
    description: family.blurb,
    alternates: { canonical: `/skin-concerns/${family.slug}` },
    openGraph: {
      title: `${family.label} — Dew Theory`,
      description: family.blurb,
      url: `/skin-concerns/${family.slug}`,
      type: 'website'
    }
  });
}

export const revalidate = 60;

export default async function ConcernPage({ params }) {
  const { slug } = await params;
  const family = getConcernFamily(slug);
  if (!family) notFound();

  const visible = getProducts().filter(isShopVisible);
  const products = productsForFamily(family, visible);

  return (
    <PageShell
      eyebrow="Skin concern"
      title={family.label}
      intro={family.blurb}
      actions={
        <>
          <ShellSecondary href="/virtual-consultation">Get this prescribed</ShellSecondary>
          <Link
            href="/skin-concerns"
            className="btn-tertiary inline-flex min-h-[52px] items-center font-body text-[0.68rem] font-medium uppercase tracking-lockup"
          >
            All concerns
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </>
      }
    >
      {products.length ? (
        <>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            {products.length} {products.length === 1 ? 'product addresses' : 'products address'}{' '}
            this
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <li key={product.id} className="h-full">
                <ProductCard product={product} revealIndex={i} />
              </li>
            ))}
          </ul>

          {/* The verified condition strings behind this shelf, so the grouping is
              transparent rather than a black box. */}
          <div className="mt-16 border-t border-border pt-8">
            <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
              Concerns in this shelf
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {family.conditions.map((c) => (
                <li
                  key={c}
                  className="border border-hairline px-3 py-1.5 font-body text-[0.72rem] text-muted"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="border border-border px-8 py-16 text-center">
          <p className="font-display text-[1.6rem] text-ink">Nothing on this shelf yet.</p>
          <p className="mx-auto mt-4 max-w-md font-body text-[0.95rem] leading-[1.7] text-muted">
            No product in the current catalog declares this concern. Browse everything, or start a
            consultation and have a routine built for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="btn-primary inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Shop all products
            </Link>
            <Link
              href="/virtual-consultation"
              className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
            >
              Start a consultation
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
