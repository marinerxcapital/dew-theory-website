import Link from 'next/link';

/**
 * Skin quiz promo — educational starting point, not a diagnosis.
 */
export default function QuizPromo() {
  return (
    <section className="border-b border-border bg-stone/50 py-14 sm:py-16" aria-labelledby="quiz-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <p className="editorial-label">Skin quiz</p>
            <h2
              id="quiz-heading"
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1] text-forest"
            >
              Four questions. Two minutes. One clear routine.
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-muted">
              A gentle read of how your skin feels today — then a morning and evening Skin Script
              sequence from real products. An educational start, not a diagnosis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="btn-dew min-h-[44px] px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Take the quiz
              </Link>
              <Link
                href="/routine"
                className="btn-ghost min-h-[44px] px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Build AM / PM
              </Link>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border" data-reveal>
            {[
              ['01', 'How your skin feels'],
              ['02', 'What you are working on'],
              ['03', 'Sensitivity check'],
              ['04', 'A sequenced plan']
            ].map(([n, copy]) => (
              <li key={n} className="bg-ivory px-5 py-6 sm:px-6 sm:py-8">
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">{n}</p>
                <p className="mt-2 font-display text-lg text-forest sm:text-xl">{copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
