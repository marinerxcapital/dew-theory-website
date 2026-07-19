import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Studio — Dew Theory',
  description: 'Visit the Dew Theory studio for Skin Script facials with Emily Mitchener.'
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
            Quiet, clinical-calm, and set up for a proper skin read — not a spa day of noise. Studio
            photography lands here once we have it; the iridescent fields hold the space for now.
          </p>
        </div>

        <div
          className="mt-16 grid gap-6 md:grid-cols-3"
          data-reveal-group="studio-photos"
        >
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
          <div>
            <h2 className="font-display text-2xl font-normal text-graphite">Location</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {/* OPEN_ITEMS: studio name and address unconfirmed */}
              Studio name and street address are still open items. Once Emily confirms, this block
              becomes the real address with a map link — no invented city or suite number.
            </p>
            <p className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
              Address pending confirmation
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-normal text-graphite">Hours</h2>
            <ul className="mt-4 space-y-2 font-body text-sm font-light text-charcoal/75">
              {/* Placeholder hours — flag as invented */}
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
              Hours are a working assumption until Emily confirms — see OPEN_ITEMS.md.
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
