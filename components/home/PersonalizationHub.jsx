import Link from 'next/link';

/**
 * One personalization ecosystem rather than three disconnected tools.
 *
 * All three destinations are real, published routes in this project. Copy is
 * deliberately free of outcome promises: the quiz maps to catalog products, the
 * routine builder sequences real catalog products, and the consultation is a
 * live Zoom appointment with Emily.
 */
const STEPS = [
  {
    n: '01',
    eyebrow: 'Two minutes',
    title: 'Take the skin quiz',
    body: 'A short set of questions maps your answers to Skin Script products that actually exist in this store.',
    href: '/skin-quiz',
    cta: 'Start the quiz'
  },
  {
    n: '02',
    eyebrow: 'AM + PM',
    title: 'Build your routine',
    body: 'Layer cleanser to SPF in professional order, then add the whole sequence to your bag.',
    href: '/routine',
    cta: 'Build my routine'
  },
  {
    n: '03',
    eyebrow: '1:1 · Zoom',
    title: 'Refine it with Emily',
    body: 'Bring your questions to a focused one-on-one review and get a morning and evening plan written for your skin.',
    href: '/virtual-consultation',
    cta: 'Book with Emily'
  }
];

export default function PersonalizationHub() {
  return (
    <section
      id="personalized"
      className="border-b border-border bg-ivory"
      aria-labelledby="personalization-hub"
    >
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div className="max-w-2xl">
            <p className="editorial-label">personalized skincare</p>
            <h2
              id="personalization-hub"
              className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal text-forest"
            >
              Start where you are. Go as deep as you want.
            </h2>
            <p className="mt-4 max-w-xl font-body text-sm font-normal leading-relaxed text-muted">
              The quiz, the routine builder, and a consultation with Emily are three depths of the
              same conversation about your skin — not three separate products.
            </p>
          </div>
          <div className="spectral-line hidden h-px w-40 lg:block" aria-hidden="true" />
        </div>

        <ol
          className="mt-10 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3"
          data-reveal-group="personalization"
        >
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col bg-white" data-reveal>
              <div className="flex flex-1 flex-col p-7 sm:p-9">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-dew">
                    Step {step.n}
                  </p>
                  <p className="font-label text-[0.55rem] font-normal uppercase tracking-lockup text-muted">
                    {step.eyebrow}
                  </p>
                </div>
                <h3 className="mt-5 font-display text-[clamp(1.35rem,2.4vw,1.7rem)] font-normal leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 font-body text-sm font-normal leading-relaxed text-muted">
                  {step.body}
                </p>
                <Link
                  href={step.href}
                  className="group mt-7 inline-flex min-h-[44px] items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink"
                >
                  {step.cta}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
