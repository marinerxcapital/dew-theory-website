import Link from 'next/link';

/**
 * Closing conversion band — repeated consultation CTA with a soft FAQ fallback.
 */
export default function FinalConsultationCta() {
  return (
    <section className="bg-ivory" aria-labelledby="final-consultation-cta">
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div
          className="flex flex-col items-start justify-between gap-8 border border-border bg-white p-8 sm:p-10 lg:flex-row lg:items-center"
          data-reveal-group="final-cta"
        >
          <div className="max-w-2xl" data-reveal>
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-dew">
              Personalized skincare, from home
            </p>
            <h2
              id="final-consultation-cta"
              className="mt-3 font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-normal leading-tight text-ink"
            >
              Your skin deserves a routine built for it.
            </h2>
            <p className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted">
              Meet one-on-one with Emily, then shop a routine selected around your goals.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center" data-reveal>
            <Link
              href="/virtual-consultation"
              className="btn-primary inline-flex min-h-[48px] items-center justify-center px-9 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Book a virtual consultation
            </Link>
            <Link
              href="/virtual-consultation#faq"
              className="inline-flex min-h-[44px] items-center justify-center px-4 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink hover:text-ink"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
