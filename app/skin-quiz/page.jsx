import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import SkinQuiz from '@/components/SkinQuiz';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = withPageMetadata('/skin-quiz', {
  title: 'Build My Routine — Skin Quiz',
  description:
    'Answer a few questions and build a personalized Skin Script routine from real catalog products. No invented kits, no medical claims.',
  alternates: { canonical: '/skin-quiz' },
  openGraph: {
    title: 'Build My Routine — Dew Theory Skin Quiz',
    description:
      'A guided skin quiz that builds a real morning and evening routine from Skin Script products in the Dew Theory store.',
    url: '/skin-quiz',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build My Routine — Dew Theory Skin Quiz',
    description:
      'A guided skin quiz that builds a real morning and evening routine from Skin Script products.'
  },
  robots: { index: true, follow: true }
});

export const revalidate = 60;

export default function SkinQuizPage() {
  const catalog = getProducts().filter(isShopVisible);

  return (
    <section className="mx-auto max-w-shell px-5 pb-20 pt-12 sm:px-6 sm:pt-14 lg:px-10">
      <div className="mb-12 max-w-3xl" data-reveal-group="quiz-head">
        <p
          data-reveal
          className="dew-badge inline-flex px-3 py-1.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
        >
          Build my routine
        </p>
        <h1
          data-reveal
          className="mt-5 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-normal leading-[1.05] text-ink"
        >
          Not ready to book? Start with the skin quiz.
        </h1>
        <p
          data-reveal
          className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Four questions, a real routine. The quiz maps your answers to the Skin Script products
          in this store — nothing invented, no medical claims.
        </p>
      </div>

      <SkinQuiz catalog={catalog} />

      <div className="mt-16 border-t border-border pt-10" data-reveal>
        <Link
          href="/virtual-consultation"
          className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
        >
          Prefer one-on-one guidance? Book a virtual consultation →
        </Link>
      </div>
    </section>
  );
}
