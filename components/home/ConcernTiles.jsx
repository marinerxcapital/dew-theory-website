import Link from 'next/link';

/**
 * Shop-by-concern tiles — query values match CONCERN_ALIASES labels in lib/shop-filters.js.
 */
const CONCERNS = [
  {
    label: 'Dry + Dehydrated',
    concern: 'Dryness',
    note: 'Barrier comfort and water-binding care'
  },
  {
    label: 'Breakouts + Congestion',
    concern: 'Congestion',
    note: 'Clearer pores without stripping'
  },
  {
    label: 'Uneven Tone',
    concern: 'Uneven tone',
    note: 'Brightening with a steady hand'
  },
  {
    label: 'Sensitive + Reactive',
    concern: 'Sensitivity',
    note: 'Calm first, actives second'
  },
  {
    label: 'Fine Lines + Texture',
    concern: 'Texture',
    note: 'Smoother feel, resilient finish'
  }
];

export default function ConcernTiles() {
  return (
    <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="concern-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div data-reveal>
          <p className="editorial-label">Shop by concern</p>
          <h2
            id="concern-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest"
          >
            What does your skin need?
          </h2>
          <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-muted">
            Start with how your skin feels today — then browse Skin Script actives matched to that
            concern.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CONCERNS.map((item) => (
            <li key={item.concern}>
              <Link
                href={`/shop?concern=${encodeURIComponent(item.concern)}`}
                className="group flex h-full flex-col border border-border bg-white p-5 transition-colors hover:border-forest hover:bg-sage/20 sm:p-6"
              >
                <p className="font-display text-xl leading-snug text-forest group-hover:text-sage-deep">
                  {item.label}
                </p>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-muted">{item.note}</p>
                <p className="mt-5 font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">
                  Shop →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
