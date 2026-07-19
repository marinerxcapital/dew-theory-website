import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'About Emily',
  description:
    'Emily Mitchener — licensed aesthetician. Barrier-first facials and Skin Script actives, sequenced for your skin that week.'
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
        <div
          className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
          data-reveal-group="about-hero"
        >
          <div
            data-reveal
            className="iridescent aspect-[4/5] w-full max-w-md rounded-[2px]"
            aria-hidden="true"
          />
          <div>
            <Rule left="Aesthetician" right="Licensed" data-reveal />
            <h1
              data-reveal
              className="mt-8 font-display text-[clamp(2.4rem,5.5vw,4rem)] font-normal leading-[1.05] text-graphite"
            >
              Emily Mitchener
            </h1>
            <p
              data-reveal
              className="mt-8 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
            >
              {/* PLACEHOLDER bio — OPEN_ITEMS.md: not Emily-approved copy */}
              Emily approaches skin the way a careful technician approaches a system: look first,
              change one variable at a time, and never sell a part you do not need. Each appointment
              begins with a read of the barrier as it is that week — not last season, not a product
              claim.
            </p>
            <p
              data-reveal
              className="mt-5 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
            >
              She works with Skin Script in the treatment room and on the shelf. The actives she
              recommends are the ones she uses on your face. No mystery back-bar. No kit built for
              the ticket average.
            </p>
            <Link
              data-reveal
              href="/book"
              className="sweep mt-10 inline-block border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
            >
              Book with Emily
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-chrome/15 bg-ivory">
        <div className="mx-auto max-w-shell px-6 py-24 lg:px-10" data-reveal-group="philosophy">
          <h2
            data-reveal
            className="font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-normal text-graphite"
          >
            How she works
          </h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                t: 'Read first',
                d: 'Barrier, congestion, sensitivity, and what is already on the shelf at home. The plan follows the facts.'
              },
              {
                t: 'One variable',
                d: 'Change too much at once and you never know what worked. Actives are sequenced so progress stays legible.'
              },
              {
                t: 'Honest shelf',
                d: 'If you do not need it, she will not sell it. The shop continues the plan — it does not empty the cart.'
              }
            ].map((item) => (
              <li key={item.t} data-reveal className="glass-1 p-8">
                <h3 className="font-display text-xl font-normal text-graphite">{item.t}</h3>
                <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/70">
                  {item.d}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-6 py-24 lg:px-10">
        <Rule left="Credentials" right="Practice" data-reveal />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-graphite">Licensed aesthetician</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {/* OPEN_ITEMS: license board / number not provided */}
              State-licensed aesthetician working in medical-adjacent skincare — peels, extractions,
              and barrier-first protocols. Exact board and license number will be listed here once
              confirmed for launch.
            </p>
          </div>
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-graphite">The same actives, explained</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              You leave knowing what each product does and when to use it — not only a bag and a
              receipt. Order of operations is the work.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap gap-4">
          <Link
            href="/services"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Treatment menu
          </Link>
          <Link
            href="/studio"
            className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
          >
            Visit the studio →
          </Link>
        </div>
      </section>
    </>
  );
}
