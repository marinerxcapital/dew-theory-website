import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Membership — Dew Theory',
  description: 'Dew Theory membership — terms to be confirmed before launch.'
};

export default function MembershipPage() {
  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div data-reveal-group="mem-head">
        <Rule left="Membership" right="Coming into focus" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.05] text-graphite"
        >
          Stay in the plan
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          {/* OPEN_ITEMS: membership may not launch; terms unconfirmed — do not invent pricing */}
          Membership is on the table as a way to keep appointments and product refills in a steady
          rhythm. Exact tiers, pricing, and perks are not published yet — Emily will set terms before
          anyone can join.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3" data-reveal-group="mem-tiers">
        {[
          {
            name: 'What it might hold',
            points: [
              'Priority booking windows',
              'A calm cadence of facials',
              'Member access to restocks'
            ]
          },
          {
            name: 'What it will not be',
            points: [
              'A hard sell at the end of a facial',
              'A locked-in product subscription you don’t need',
              'Terms invented to look finished'
            ]
          },
          {
            name: 'Until then',
            points: [
              'Book facials as you need them',
              'Shop the full Skin Script line',
              'Join the list when terms go live'
            ]
          }
        ].map((card) => (
          <article key={card.name} data-reveal className="glass-1 flex flex-col p-8">
            <h2 className="font-display text-xl text-graphite">{card.name}</h2>
            <ul className="mt-6 flex-1 space-y-3">
              {card.points.map((p) => (
                <li
                  key={p}
                  className="border-t border-chrome/15 pt-3 font-body text-sm font-light leading-relaxed text-charcoal/70"
                >
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-16 max-w-lg">
        <h2 className="font-display text-2xl text-graphite">Interest list</h2>
        <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/70">
          Leave a note on the contact form if you want to hear when membership opens — no fake
          checkout, no invented monthly price.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
          >
            Get in touch
          </Link>
          <Link
            href="/book"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Book without membership
          </Link>
        </div>
      </div>
    </section>
  );
}
