import Link from 'next/link';

/**
 * Provider trust block. Only verified identity already present in the project:
 * Emily Mitchener, licensed aesthetician. No invented credentials, years, or claims.
 */
export default function MeetEmily() {
  return (
    <section id="about" className="border-b border-border bg-surface-light" aria-labelledby="meet-emily">
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div data-reveal>
            <p className="editorial-label">meet emily</p>
            <h2
              id="meet-emily"
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-normal leading-[1.1] text-forest"
            >
              A real read, not a guess.
            </h2>
            <p className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-charcoal">
              Emily Mitchener is a licensed aesthetician. She works with Skin Script professional
              actives — the same line she uses in treatment — and helps clients build calm,
              botanical, barrier-first routines at home.
            </p>
            <p className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-charcoal">
              In a virtual consultation, she reads your skin, your current products, and your goals,
              then sequences a morning and evening routine you can actually follow.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/virtual-consultation"
                className="btn-primary inline-flex min-h-[48px] items-center px-8 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Meet with Emily
              </Link>
              <Link
                href="/skin-quiz"
                className="inline-flex min-h-[44px] items-center font-label text-[0.65rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
              >
                Not ready to book? Take the quiz
              </Link>
            </div>
          </div>

          <div
            data-reveal
            aria-hidden="true"
            className="relative hidden aspect-[4/5] max-w-sm overflow-hidden bg-gradient-to-br from-ivory via-sage-soft to-sage-surface lg:block"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rotate-[-6deg] font-display text-[clamp(2rem,5vw,3.4rem)] font-normal leading-none text-sage-deep">
                calm
                <br />
                botanical
                <br />
                precise
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
