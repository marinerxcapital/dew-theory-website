import Link from 'next/link';

/**
 * Educational Dew Edit cards — no medical claims; PDRN is education-only if mentioned.
 */
const CARDS = [
  {
    id: 'layering',
    title: 'Layering order',
    body: 'Thin to thick keeps actives where they belong. Cleanser first, SPF last by day.',
    href: '/faq#products'
  },
  {
    id: 'exfoliation',
    title: 'Exfoliation, calmly',
    body: 'More is not better. Space acids so the barrier can keep up — especially if you are reactive.',
    href: '/faq#quiz'
  },
  {
    id: 'barrier',
    title: 'When the barrier breaks',
    body: 'Tight, stingy, unpredictable skin needs comfort before trends. Simplify, then rebuild.',
    href: '/about'
  },
  {
    id: 'serum-moisturizer',
    title: 'Serum vs moisturizer',
    body: 'Serums deliver targeted actives. Moisturizers seal and support. Most plans need both roles.',
    href: '/faq#products'
  },
  {
    id: 'morning',
    title: 'A morning routine',
    body: 'Cleanse, treat, hydrate, moisturize, protect. Keep it short enough to actually finish.',
    href: '/routine'
  },
  {
    id: 'pdrn',
    title: 'What is PDRN?',
    body: 'Education only — not a Dew Theory menu item or bookable treatment. Ask Emily if you are curious.',
    href: '/faq#products'
  }
];

export default function DewEdit() {
  return (
    <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="edit-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="editorial-label">Dew Theory / Myth busting</p>
            <h2
              id="edit-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest"
            >
              The Dew Edit
            </h2>
            <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-muted">
              Short reads for calmer shelves — no fake reviews, no medical claims.
            </p>
          </div>
          <Link
            href="/faq"
            className="font-label text-[0.65rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
          >
            Help center
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <li key={card.id}>
              <Link
                href={card.href}
                className="group flex h-full flex-col border border-border bg-white p-6 transition-colors hover:border-forest hover:bg-sage/15"
              >
                <h3 className="font-display text-xl text-forest group-hover:text-sage-deep">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-muted">{card.body}</p>
                <p className="mt-5 font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">
                  Read →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
