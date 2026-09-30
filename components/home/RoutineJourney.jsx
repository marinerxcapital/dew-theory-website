import Link from 'next/link';

const STEPS = [
  { id: 'cleanse', label: 'Cleanse', hint: 'Remove the day' },
  { id: 'treat', label: 'Treat', hint: 'Targeted actives' },
  { id: 'hydrate', label: 'Hydrate', hint: 'Water-binding care' },
  { id: 'moisturize', label: 'Moisturize', hint: 'Seal the plan' },
  { id: 'protect', label: 'Protect', hint: 'SPF by day' }
];

/**
 * Interactive routine journey visual — links to /routine.
 */
export default function RoutineJourney() {
  return (
    <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="journey-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="editorial-label">AM · PM order</p>
            <h2
              id="journey-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest"
            >
              Your routine journey
            </h2>
            <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-muted">
              Thin to thick. Treat with intention. Protect last by day — build the sequence once,
              then refine.
            </p>
          </div>
          <Link
            href="/routine"
            className="btn-primary min-h-[44px] px-7 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
          >
            Build my routine
          </Link>
        </div>

        <ol
          className="mt-10 grid gap-3 sm:grid-cols-5"
          aria-label="Routine steps: cleanse, treat, hydrate, moisturize, protect"
        >
          {STEPS.map((step, index) => (
            <li key={step.id}>
              <Link
                href="/routine"
                className="group flex h-full flex-col border border-border bg-white p-5 transition-colors hover:border-forest hover:bg-stone/40 sm:p-6"
              >
                <span className="font-label text-[0.55rem] uppercase tracking-lockup text-muted">
                  Step {index + 1}
                </span>
                <span className="mt-3 font-display text-2xl text-forest group-hover:text-sage-deep">
                  {step.label}
                </span>
                <span className="mt-2 font-body text-sm text-muted">{step.hint}</span>
                {index < STEPS.length - 1 ? (
                  <span
                    className="mt-4 hidden font-label text-[0.55rem] uppercase tracking-lockup text-sage-deep sm:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-center font-label text-[0.58rem] uppercase tracking-lockup text-muted sm:hidden">
          Cleanse → Treat → Hydrate → Moisturize → Protect
        </p>
      </div>
    </section>
  );
}
