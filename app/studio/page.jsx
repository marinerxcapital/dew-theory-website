import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Studio',
  description:
    'The Dew Theory treatment room — quiet, clinical-calm, set up for a proper skin read.'
};

export default function StudioPage() {
  return (
    <>
      <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
        <div data-reveal-group="studio-head">
          <Rule left="Studio" right="Visit" data-reveal />
          <h1
            data-reveal
            className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-graphite"
          >
            The room
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
          >
            Quiet and clinical-calm — built for a barrier read, not spa noise. Studio photography
            will replace the iridescent fields when it exists; until then they hold the light.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3" data-reveal-group="studio-photos">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              data-reveal
              className="iridescent aspect-[4/5] rounded-[2px]"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <section className="border-y border-chrome/15 bg-ivory">
        <div className="mx-auto grid max-w-shell gap-12 px-6 py-24 md:grid-cols-2 lg:px-10">
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-graphite">Location</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {/* OPEN_ITEMS: studio name and address unconfirmed — no invented city */}
              Street address and studio name are still open. When Emily confirms them, this block
              becomes the real location with a map link — not a placeholder suite number.
            </p>
            <p className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
              Address pending confirmation
            </p>
          </div>
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-graphite">Hours</h2>
            <ul className="mt-4 space-y-2 font-body text-sm font-light text-charcoal/75">
              {/* PLACEHOLDER hours — OPEN_ITEMS.md */}
              <li className="flex justify-between border-b border-chrome/15 py-2">
                <span>Monday – Friday</span>
                <span>10:00 – 6:00</span>
              </li>
              <li className="flex justify-between border-b border-chrome/15 py-2">
                <span>Saturday</span>
                <span>10:00 – 4:00</span>
              </li>
              <li className="flex justify-between border-b border-chrome/15 py-2">
                <span>Sunday</span>
                <span>Closed</span>
              </li>
            </ul>
            <p className="mt-4 font-body text-xs font-light text-charcoal/55">
              Hours are a working assumption until confirmed — not a published schedule yet.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-6 py-24 lg:px-10">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/book"
            className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
          >
            Book a visit
          </Link>
          <Link
            href="/contact"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Contact
          </Link>
        </div>
      </section>
    </>
  );
}
