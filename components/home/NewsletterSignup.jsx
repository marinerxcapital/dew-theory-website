import Link from 'next/link';

/**
 * Honest stay-in-touch band — no newsletter API exists, so no fake subscribe success.
 * Points to /contact instead of inventing a list signup.
 */
export default function NewsletterSignup() {
  return (
    <section className="section-stone border-b border-border py-14 sm:py-16" aria-labelledby="touch-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <div>
            <p className="editorial-label">Stay in touch</p>
            <h2
              id="touch-heading"
              className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] text-forest"
            >
              Questions, updates, or a quieter plan
            </h2>
            <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-muted">
              There is no email list signup on the site yet. Reach the studio through contact — Emily
              replies to what you write in.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-dew-outline inline-flex min-h-[44px] shrink-0 items-center justify-center px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
          >
            Contact the studio
          </Link>
        </div>
      </div>
    </section>
  );
}
