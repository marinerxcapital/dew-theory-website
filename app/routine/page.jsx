import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import RoutineBuilder from '@/components/RoutineBuilder';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = withPageMetadata('/routine', {
  title: 'Build My Routine — AM & PM',
  description:
    'Layer a complete morning and evening Skin Script routine step by step from real catalog products — thin to thick, SPF last.',
  alternates: { canonical: '/routine' },
  openGraph: {
    title: 'Build My Routine — Dew Theory',
    description:
      'Build a complete AM and PM Skin Script routine from the Dew Theory store, in professional layering order.',
    url: '/routine',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build My Routine — Dew Theory',
    description:
      'Build a complete AM and PM Skin Script routine from the Dew Theory store.'
  },
  robots: { index: true, follow: true }
});

export const revalidate = 60;

export default function RoutinePage() {
  const catalog = getProducts().filter(isShopVisible);

  return (
    <section className="mx-auto max-w-shell px-5 pb-20 pt-12 sm:px-6 sm:pt-14 lg:px-10">
      <div className="mb-12 max-w-3xl" data-reveal-group="routine-head">
        <p
          data-reveal
          className="dew-badge inline-flex px-3 py-1.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
        >
          Professional layering
        </p>
        <h1
          data-reveal
          className="mt-5 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-normal leading-[1.05] text-ink"
        >
          Build a routine that actually fits.
        </h1>
        <p
          data-reveal
          className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Step through cleanser to SPF and add the whole sequence to your bag, or choose just the
          steps you need.
        </p>
      </div>

      <RoutineBuilder catalog={catalog} />

      <div className="mt-16 border-t border-border pt-10" data-reveal>
        <Link
          href="/virtual-consultation"
          className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
        >
          Not sure what to layer? Book a virtual consultation →
        </Link>
      </div>
    </section>
  );
}
