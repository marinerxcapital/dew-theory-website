import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'About Emily Mitchener',
  description:
    'Meet Emily Mitchener — licensed aesthetician at Dew Theory. Barrier-first facials and Skin Script professional actives, sequenced for your skin.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Emily Mitchener — Dew Theory',
    description: 'Licensed aesthetician offering barrier-first facials and clinical skincare.',
    url: '/about'
  }
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-shell px-6 pb-16 pt-12 sm:pb-20 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="max-w-2xl" data-reveal-group="about-hero">
          <p
            data-reveal
            className="dew-badge inline-flex px-3 py-1.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
          >
            Licensed aesthetician
          </p>
          <h1
            data-reveal
            className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4rem)] font-normal leading-[1.05] text-ink"
          >
            Emily Mitchener
          </h1>
          <p
            data-reveal
            className="mt-7 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
          >
            Emily takes an evidence-informed, barrier-first approach to skin. Every recommendation
            begins with careful observation of your skin&apos;s current condition, product
            history, sensitivity, lifestyle, and goals — not a trend, a sales target, or a
            one-size-fits-all routine.
          </p>
          <p
            data-reveal
            className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
          >
            She explains the reasoning behind each step in clear, approachable language so you
            understand what to use, how to use it, and why it belongs in your routine. The goal is
            to remove guesswork, build trust, and create a plan that feels realistic enough to
            follow consistently.
          </p>
          <p
            data-reveal
            className="mt-5 max-w-xl font-display text-xl italic leading-snug text-forest sm:text-2xl"
          >
            I&apos;d rather be exhausted building my dream than comfortable watching it pass me by
          </p>
          <p
            data-reveal
            className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
          >
            Emily works with Skin Script in the treatment room and at home, selecting products
            because they fit your skin — not because they raise the ticket average. Expect
            practical recommendations, clear expectations, and thoughtful adjustments as your skin
            changes.
          </p>
          <div
            data-reveal
            className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <Link
              href="/book"
              className="btn-primary inline-flex min-h-[44px] items-center justify-center px-8 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Book with Emily
            </Link>
            <Link
              href="/virtual-consultation"
              className="btn-dew-outline inline-flex min-h-[44px] items-center justify-center px-8 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Book a virtual consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="section-sage border-y border-border">
        <div
          className="mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10"
          data-reveal-group="philosophy"
        >
          <Rule left="Approach" right="How she works" data-reveal />
          <p data-reveal className="editorial-label mt-6">
            by emily | hydration specialist
          </p>
          <h2
            data-reveal
            className="mt-4 font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-normal text-forest"
          >
            Look first, sell second
          </h2>
          <p data-reveal className="mt-4 max-w-xl font-display text-2xl italic text-forest">
            relax. i&apos;ve got you covered
          </p>
          <ul className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 md:grid-cols-3">
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
              <li
                key={item.t}
                data-reveal
                className="rounded-[3px] border border-forest/15 bg-ivory/70 p-8"
              >
                <h3 className="font-display text-xl font-normal text-forest">{item.t}</h3>
                <p className="mt-4 font-body text-sm font-normal leading-relaxed text-forest/80">
                  {item.d}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10">
        <Rule left="Credentials" right="Practice" data-reveal />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-ink">Licensed aesthetician</h2>
            <p className="mt-4 font-body text-sm font-normal leading-relaxed text-muted">
              State-licensed aesthetician working in medical-adjacent skincare — peels,
              extractions, and barrier-first protocols. Her license number will be published here
              once confirmed for launch.
            </p>
          </div>
          <div data-reveal>
            <h2 className="font-display text-2xl font-normal text-ink">
              The same actives, explained
            </h2>
            <p className="mt-4 font-body text-sm font-normal leading-relaxed text-muted">
              You leave knowing what each product does and when to use it — not only a bag and a
              receipt. Order of operations is the work.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-6 sm:mt-14">
          <Link
            href="/services"
            className="btn-ghost px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Treatment menu
          </Link>
          <Link
            href="/virtual-consultation"
            className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
          >
            Virtual consultation →
          </Link>
        </div>
      </section>
    </>
  );
}
