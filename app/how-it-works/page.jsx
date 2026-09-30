import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import { IconArrowRight } from '@/components/Icons';
import { FREE_SHIPPING_THRESHOLD_USD, FLAT_SHIPPING_USD, formatMoney } from '@/lib/shipping';

export const metadata = withPageMetadata('/how-it-works', {
  title: 'How it works',
  description:
    'Three ways to start: the skin quiz for a fast read, a virtual consultation for a full routine, or browse the Skin Script collection directly.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How Dew Theory works',
    description:
      'Take the quiz, book a consultation, or shop the collection directly.',
    url: '/how-it-works',
    type: 'website'
  }
});

const STAGES = [
  {
    n: '01',
    head: 'Find where you are',
    body:
      'The skin quiz is a two-minute read on what your skin is doing right now — oil, dehydration, reactivity, tone. It returns a short starting point, not a shopping list.',
    href: '/skin-quiz',
    cta: 'Take the skin quiz'
  },
  {
    n: '02',
    head: 'Have it built properly',
    body:
      'A virtual consultation goes further: a questionnaire, optional photos, and a scheduled session with a licensed aesthetician who builds the routine and the order to introduce it in.',
    href: '/virtual-consultation',
    cta: 'Book a consultation'
  },
  {
    n: '03',
    head: 'Shop the routine',
    body:
      'Everything recommended is Skin Script professional retail. Buy the whole routine, or start with one step — the catalog is filterable by type, concern, skin type and routine step.',
    href: '/shop',
    cta: 'Shop the collection'
  }
];

export default function HowItWorksPage() {
  return (
    <PageShell
      eyebrow="How it works"
      title="Start where you are."
      intro="You do not need to know what a serum does, or which active to introduce first. Pick the level of help you want, and the rest follows."
      actions={<ShellPrimary href="/skin-quiz">Start the skin quiz</ShellPrimary>}
    >
      <ol className="grid gap-px border border-border bg-border lg:grid-cols-3">
        {STAGES.map((s) => (
          <li key={s.n} className="bg-void">
            <div className="flex h-full flex-col justify-between gap-10 p-7 lg:p-9">
              <div>
                <p className="font-display text-[2.4rem] font-normal leading-none text-ink">
                  {s.n}
                </p>
                <h2 className="mt-5 font-display text-[1.7rem] font-normal leading-[1.08] text-ink">
                  {s.head}
                </h2>
                <p className="mt-4 font-body text-[0.95rem] leading-[1.72] text-muted">{s.body}</p>
              </div>
              <Link
                href={s.href}
                className="group inline-flex items-center gap-2 font-body text-[0.66rem] font-medium uppercase tracking-lockup text-ink"
              >
                {s.cta}
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-3">
        <div>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Shipping
          </p>
          <p className="mt-3 font-body text-[0.98rem] leading-[1.72] text-muted">
            {formatMoney(FLAT_SHIPPING_USD)} flat, free over{' '}
            {formatMoney(FREE_SHIPPING_THRESHOLD_USD)} product subtotal. Full detail on the{' '}
            <Link href="/shipping" className="underline decoration-border underline-offset-4 hover:decoration-ink">
              shipping page
            </Link>
            .
          </p>
        </div>
        <div>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Not sure yet
          </p>
          <p className="mt-3 font-body text-[0.98rem] leading-[1.72] text-muted">
            Browse{' '}
            <Link
              href="/skin-concerns"
              className="underline decoration-border underline-offset-4 hover:decoration-ink"
            >
              shop by skin concern
            </Link>{' '}
            to see what the catalog actually addresses.
          </p>
        </div>
        <div>
          <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
            Questions
          </p>
          <p className="mt-3 font-body text-[0.98rem] leading-[1.72] text-muted">
            The{' '}
            <Link
              href="/help"
              className="underline decoration-border underline-offset-4 hover:decoration-ink"
            >
              help center
            </Link>{' '}
            covers orders, returns and how consultations run.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
