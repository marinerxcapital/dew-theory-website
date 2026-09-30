import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { IconArrowRight } from '@/components/Icons';
import {
  getAllJournalEntries,
  getJournalEntry
} from '@/lib/journal';

export function generateStaticParams() {
  return getAllJournalEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) return { title: 'Journal' };
  return withPageMetadata(`/journal/${entry.slug}`, {
    title: entry.title,
    description: entry.dek,
    alternates: { canonical: `/journal/${entry.slug}` },
    openGraph: {
      type: 'article',
      title: `${entry.title} — Dew Theory Journal`,
      description: entry.dek,
      url: `/journal/${entry.slug}`
    }
  });
}

export default async function JournalArticlePage({ params }) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) notFound();

  const others = getAllJournalEntries().filter((e) => e.slug !== entry.slug);
  const headings = entry.body.filter((b) => b.h).map((b) => b.h);

  return (
    <PageShell
      eyebrow={`${entry.topic} · ${entry.edition}`}
      title={entry.title}
      intro={entry.dek}
      bare
    >
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-section-sm sm:px-6 lg:grid-cols-[0.28fr_0.72fr] lg:px-10 lg:py-section-md">
          {headings.length ? (
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                On this page
              </p>
              <ul className="mt-5 space-y-3">
                {headings.map((h) => (
                  <li key={h}>
                    <a
                      href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="font-body text-[0.9rem] text-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                    >
                      {h}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div />
          )}

          <article className="journal-prose max-w-measure">
            {entry.body.map((block, i) => {
              if (block.h) {
                return (
                  <h2
                    key={`${block.h}-${i}`}
                    id={block.h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    className="mt-12 scroll-mt-32 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-normal leading-[1.1] text-ink first:mt-0"
                  >
                    {block.h}
                  </h2>
                );
              }
              if (block.list) {
                return (
                  <ul key={`list-${i}`} className="mt-6 space-y-3 border-l border-border pl-6">
                    {block.list.map((li) => (
                      <li
                        key={li}
                        className="font-body text-[1.02rem] leading-[1.75] text-muted"
                      >
                        {li}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={`p-${i}`}
                  className="mt-6 text-[1.05rem] leading-[1.8] text-muted first:mt-0"
                >
                  {block.p}
                </p>
              );
            })}
          </article>
        </div>
      </div>

      <section className="mx-auto max-w-shell px-5 py-section-sm sm:px-6 lg:px-10">
        <h2 className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
          Keep reading
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {others.slice(0, 3).map((e) => (
            <li key={e.slug}>
              <Link
                href={`/journal/${e.slug}`}
                className="group flex h-full flex-col justify-between gap-8 border border-border p-6 transition-colors hover:bg-surface"
              >
                <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
                  {e.edition}
                </p>
                <span>
                  <span className="block font-display text-[1.25rem] font-normal leading-snug text-ink">
                    {e.title}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 font-body text-[0.64rem] font-medium uppercase tracking-lockup text-ink">
                    Read
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
