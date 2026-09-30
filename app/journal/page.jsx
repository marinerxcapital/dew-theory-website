import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import { IconArrowRight } from '@/components/Icons';
import { getAllJournalEntries, getJournalTopics } from '@/lib/journal';

export const metadata = withPageMetadata('/journal', {
  title: 'Journal',
  description:
    'Notes on building a routine that holds up — order of application, introducing actives, barrier care and daily protection.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'The Dew Theory Journal',
    description: 'Notes on routines, actives and barrier care.',
    url: '/journal',
    type: 'website'
  }
});

export default function JournalPage() {
  const [lead, ...rest] = getAllJournalEntries();
  const topics = getJournalTopics();

  return (
    <PageShell
      eyebrow="Journal"
      title="Notes on skin"
      intro="Short, practical writing about how routines actually behave — the order, the pace, the parts that quietly matter."
      actions={<ShellPrimary href="/skin-concerns">Shop by concern</ShellPrimary>}
    >
      {lead ? (
        <article className="border-b border-border pb-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="refraction-field aspect-[4/3] w-full border border-border lg:aspect-auto lg:min-h-[22rem]" aria-hidden="true" />
            <div className="flex flex-col justify-center">
              <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                {lead.topic} · {lead.edition}
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.02] tracking-headline text-ink">
                {lead.title}
              </h2>
              <p className="mt-5 max-w-measure font-body text-[1.02rem] leading-[1.72] text-muted">
                {lead.dek}
              </p>
              <Link
                href={`/journal/${lead.slug}`}
                className="group mt-8 inline-flex items-center gap-2 font-body text-[0.68rem] font-medium uppercase tracking-lockup text-ink"
              >
                Read the story
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {topics.map((t) => (
          <span
            key={t}
            className="border border-hairline px-3 py-1.5 font-body text-[0.7rem] uppercase tracking-eyebrow text-muted"
          >
            {t}
          </span>
        ))}
      </div>

      <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((entry) => (
          <li key={entry.slug} className="bg-void">
            <Link
              href={`/journal/${entry.slug}`}
              className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-300 hover:bg-surface lg:p-8"
            >
              <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                {entry.topic} · {entry.edition}
              </p>
              <div>
                <h3 className="font-display text-[1.55rem] font-normal leading-[1.08] text-ink">
                  {entry.title}
                </h3>
                <p className="mt-4 font-body text-[0.93rem] leading-[1.68] text-muted">
                  {entry.dek}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-body text-[0.66rem] font-medium uppercase tracking-lockup text-ink">
                  Read
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
