import Link from 'next/link';

const CARDS = [
  {
    eyebrow: 'Layering',
    title: 'The order that makes actives work',
    body: 'Thin to thick, morning ends in SPF. Build a full AM and PM sequence step by step.',
    href: '/routine',
    cta: 'Build a routine'
  },
  {
    eyebrow: 'Preparation',
    title: 'How to get the most from your consultation',
    body: 'Natural light, clean skin, and your current products nearby — a short prep checklist.',
    href: '/virtual-consultation',
    cta: 'See the steps'
  },
  {
    eyebrow: 'Policies',
    title: 'Shipping, returns & booking',
    body: 'Free shipping at $49+, a clear returns path, and consultation cancellation terms.',
    href: '/shipping',
    cta: 'Read policies'
  }
];

/**
 * The Dew Edit — a short editorial row that surfaces only real, live pages.
 * No fabricated guides, no invented article archive.
 */
export default function Education() {
  return (
    <section className="border-b border-border bg-ivory" aria-labelledby="education">
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="max-w-2xl" data-reveal>
          <p className="editorial-label">the dew edit</p>
          <h2
            id="education"
            className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal text-forest"
          >
            Read a little. Shop a lot less blindly.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3" data-reveal-group="education">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              data-reveal
              className="group flex flex-col justify-between border border-border bg-white p-7 transition-colors hover:border-sage-deep"
            >
              <div>
                <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-dew">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-xl font-normal text-ink">
                  {card.title}
                </h3>
                <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
                  {card.body}
                </p>
              </div>
              <span className="mt-6 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-ink">
                {card.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
