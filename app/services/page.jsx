import Link from 'next/link';
import Rule from '@/components/Rule';
import {
  SERVICES,
  formatDuration,
  formatServicePrice
} from '@/lib/services';

export const metadata = {
  title: 'Services',
  description:
    'In-studio facial treatments with Emily Mitchener. Barrier read first, then the right protocol for that week.'
};

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div data-reveal-group="svc-head">
        <Rule left="Services" right="In studio" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-graphite"
        >
          The treatment menu
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          {/* PLACEHOLDER menu — OPEN_ITEMS.md: names, durations, prices need Emily’s confirmation */}
          Every visit starts with a barrier read. Names, times, and prices below are a working draft
          until Emily publishes the live menu — polished prose, not confirmed business facts.
        </p>
      </div>

      <ul className="mt-16 border-t border-chrome/25" data-reveal-group="svc-list">
        {SERVICES.map((s) => (
          <li key={s.id} data-reveal className="border-b border-chrome/20">
            <div className="grid gap-4 py-8 sm:gap-6 sm:py-10 md:grid-cols-[1fr_1.2fr_auto] md:items-start md:px-2">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-normal text-graphite sm:text-2xl">
                  {s.name}
                </h2>
                <Rule
                  left={formatDuration(s.duration_minutes)}
                  right={formatServicePrice(s.price)}
                  className="mt-4"
                />
              </div>
              <p className="font-body text-sm font-light leading-relaxed text-charcoal/75">
                {s.description}
              </p>
              <Link
                href={`/book?service=${s.id}`}
                className="sweep h-fit w-full border border-graphite/25 px-6 py-3 text-center font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60 sm:w-auto md:justify-self-end"
              >
                Book
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-16 glass-1 p-8 md:p-10" data-reveal>
        <h2 className="font-display text-xl font-normal text-graphite">Deposits &amp; cancellations</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
          {/* OPEN_ITEMS: deposit % and cancellation cutoff unconfirmed */}
          Deposit amount and cancellation window are not set yet. The booking flow is built to hold a
          policy without inventing numbers — Emily will publish terms before live deposits open.
        </p>
      </div>
    </section>
  );
}
