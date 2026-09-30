import Link from 'next/link';

/**
 * Virtual consultation promo — Zoom with Emily; no in-studio booking CTAs.
 */
export default function ConsultPromo() {
  return (
    <section
      className="border-b border-border bg-green-300 text-ivory py-14 sm:py-16"
      aria-labelledby="consult-heading"
    >
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center" data-reveal>
          <div>
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-ivory/55">
              From anywhere
            </p>
            <h2
              id="consult-heading"
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1] text-ivory"
            >
              Let&apos;s look at your skin together.
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ivory/75">
              Secure intake, private photos, and a personalized AM/PM plan — without leaving home.
              Professional guidance, not a one-size script.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Link
              href="/virtual-consultation"
              className="inline-flex min-h-[48px] items-center justify-center border border-ivory/40 bg-transparent px-9 py-4 font-label text-[0.72rem] uppercase tracking-lockup text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
            >
              Book a virtual consult
            </Link>
            <p className="max-w-xs font-body text-sm leading-relaxed text-ivory/60 lg:text-right">
              Prefer to browse first? Shop Skin Script actives anytime — free shipping at $49+.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
