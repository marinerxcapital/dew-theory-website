import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'About Emily — Dew Theory',
  description: 'Licensed aesthetician Emily Mitchener — the read, the plan, the actives.'
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
              {/* PLACEHOLDER bio — OPEN_ITEMS.md */}
              Emily treats skin the way a good technician treats an engine: look first, change one
              variable at a time, and don&apos;t sell you a part you don&apos;t need. Every appointment
              starts with a read of where your barrier actually is that week — not last month, not
              what a product ad promised.
            </p>
            <p
              data-reveal
              className="mt-5 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
            >
              She works exclusively with Skin Script formulations in the room and on the shelf, so
              the actives she recommends are the same ones she uses on your face. No mystery
              back-bar. No “trust me” kits.
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
                d: 'Barrier status, congestion, sensitivity, and what you’ve already been putting on. The plan comes after the facts.'
              },
              {
                t: 'One variable',
                d: 'Change too much at once and you never know what worked. Emily sequences actives so progress is legible.'
              },
              {
                t: 'Honest shelf',
                d: 'If you don’t need it, she won’t sell it. The shop exists to continue the plan — not to empty the cart.'
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
        <Rule left="Credentials" right="Practice" />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-normal text-graphite">Licensed aesthetician</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {/* OPEN: exact license board / number not provided */}
              State-licensed aesthetician practicing medical-adjacent skincare with professional-grade
              peels, extractions, and barrier-first protocols. Specific license details to be confirmed
              before launch.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-normal text-graphite">Skin Script educator energy</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              You leave knowing what each product does and when to use it — not just a bag and a
              receipt. The sequencing is the product.
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
