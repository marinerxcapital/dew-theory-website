import Link from 'next/link';
import RoutineBuilder from '@/components/RoutineBuilder';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = {
  title: 'Routine Builder — AM & PM Sequence',
  description:
    'Build a morning or evening Skin Script routine step by step. Thin to thick, SPF last by day — designed for every age from first routines to lifelong care.',
  alternates: { canonical: '/routine' },
  openGraph: {
    title: 'Routine Builder — Dew Theory',
    description: 'Compose your AM or PM sequence with real Skin Script products.',
    url: '/routine'
  }
};

export const revalidate = 60;

export default function RoutinePage() {
  const catalog = getProducts()
    .filter(isShopVisible)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      retail_price: p.retail_price,
      description_short: p.description_short,
      images: p.images,
      image_webp: p.image_webp,
      image_alt: p.image_alt,
      skin_types: p.skin_types,
      active: p.active,
      stock_status: p.stock_status
    }));

  return (
    <section className="relative mx-auto max-w-shell px-5 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/shop"
          className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome hover:text-charcoal"
        >
          ← Shop
        </Link>
        <span className="text-chrome/40" aria-hidden="true">
          /
        </span>
        <Link
          href="/quiz"
          className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome hover:text-charcoal"
        >
          Or take the quiz
        </Link>
      </div>

      <RoutineBuilder catalog={catalog} />

      {/* Age-inclusive trust band */}
      <div className="mt-20 grid gap-6 border-t border-chrome/12 pt-14 sm:grid-cols-3">
        {[
          ['Teens & first routines', 'Fewer steps, calmer actives, habits that last.'],
          ['Busy decades', 'Clear AM/PM order when time is short.'],
          ['Mature & sensitive', 'Barrier-first layering — comfort before polish.']
        ].map(([t, c]) => (
          <div key={t}>
            <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
              {t}
            </p>
            <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal/70">{c}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
