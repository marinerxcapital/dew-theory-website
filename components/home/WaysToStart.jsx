import Link from 'next/link';

/**
 * Two complementary ways to begin — mirrored in the consultation-first architecture.
 * Path A is the reserved consultation; Path B is the self-serve quiz/shop path.
 */
export default function WaysToStart() {
  return (
    <section className="border-b border-border bg-ivory" aria-labelledby="ways-to-start">
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="max-w-2xl" data-reveal>
          <p className="editorial-label">two ways to start</p>
          <h2
            id="ways-to-start"
            className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal text-forest"
          >
            Guided by Emily, or guided by you.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2" data-reveal-group="ways">
          <Link
            href="/virtual-consultation"
            data-reveal
            className="group goal-tile flex min-h-[22rem] flex-col justify-between p-7 sm:p-9"
          >
            <div>
              <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
                Path A · Personalized guidance
              </p>
              <p className="mt-6 font-display text-[clamp(1.65rem,3vw,2.2rem)] font-normal leading-tight text-ink">
                Book a 1:1 virtual consultation
              </p>
              <p className="mt-4 max-w-md font-body text-sm font-normal leading-relaxed text-muted">
                A focused skin review with Emily by Zoom, then a personalized morning and evening
                routine with Skin Script recommendations built around your goals.
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 font-label text-[0.65rem] font-medium uppercase tracking-lockup text-ink transition-colors group-hover:text-pink-bright">
              Book a consultation
              <span aria-hidden="true" className="goal-arrow">
                →
              </span>
            </span>
          </Link>

          <div
            data-reveal
            className="flex min-h-[22rem] flex-col justify-between border border-border bg-white p-7 text-forest sm:p-9"
          >
            <div>
              <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
                Path B · Move at your own pace
              </p>
              <p className="mt-6 font-display text-[clamp(1.65rem,3vw,2.2rem)] font-normal leading-tight text-ink">
                Build or shop your routine
              </p>
              <p className="mt-4 max-w-md font-body text-sm font-normal leading-relaxed text-muted">
                Take the skin quiz for a guided starting sequence, or browse Skin Script directly by
                category and skin concern.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink"
              >
                Shop Skin Script
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/skin-quiz"
                className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
              >
                Take the skin quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
