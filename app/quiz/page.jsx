import Link from 'next/link';
import SkinQuiz from '@/components/SkinQuiz';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { QUIZ_DISCLAIMER } from '@/lib/skin-quiz';

export const metadata = {
  title: 'Skin Quiz — Your Personalized Routine',
  description:
    'A two-minute Dew Theory skin quiz for every age — teens to 60 & beyond. Get a morning and evening Skin Script sequence tailored to how your skin feels.',
  alternates: { canonical: '/quiz' },
  openGraph: {
    title: 'Skin Quiz — Dew Theory',
    description:
      'Personalized AM/PM routine from real Skin Script products. Inclusive for every chapter of skin.',
    url: '/quiz'
  }
};

export const revalidate = 60;

export default function QuizPage() {
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
    <section className="relative mx-auto max-w-shell px-5 pb-24 pt-10 sm:px-6 sm:pb-28 sm:pt-12 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-dew">
          For every age · Teens to 60 & beyond
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-normal leading-[1.05] text-ink">
          What does your skin need next?
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-muted">
          Four gentle questions. One clear morning and evening sequence from our Skin Script
          collection — no overwhelm, no medical claims.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {['~2 minutes', 'Real products only', 'Inclusive ages'].map((t) => (
            <span
              key={t}
              className="dew-badge rounded-full px-4 py-2 font-label text-[0.58rem] font-normal uppercase tracking-lockup"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-[2px] border border-border bg-white p-6 sm:mt-14 sm:p-10 lg:p-12">
        <SkinQuiz catalog={catalog} />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center font-body text-xs font-normal leading-relaxed text-muted">
        {QUIZ_DISCLAIMER}{' '}
        <Link href="/book" className="text-dew underline underline-offset-2 hover:text-dew-dark">
          Book a facial
        </Link>{' '}
        or{' '}
        <Link
          href="/virtual-consultation"
          className="text-dew underline underline-offset-2 hover:text-dew-dark"
        >
          virtual consultation
        </Link>{' '}
        for a true barrier read.
      </p>
    </section>
  );
}
