import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary, ShellSecondary } from '@/components/PageShell';

export const metadata = withPageMetadata('/about', {
  title: 'About',
  description:
    'Dew Theory is a Skin Script professional skincare storefront with one-to-one guidance from a licensed aesthetician. Barrier first, product second.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Dew Theory',
    description:
      'Skin Script professional skincare with one-to-one guidance from a licensed aesthetician.',
    url: '/about',
    type: 'website'
  }
});

/**
 * About.
 *
 * Deliberately states only what the business and the codebase already assert:
 * Skin Script professional retail, guidance from a licensed aesthetician, a
 * consultation-led model, and honest pricing. No founder biography, awards,
 * credentials, addresses or treatment claims are invented here.
 */
export default function AboutPage() {
  return (
    <PageShell
      eyebrow="House"
      title="Skin, without the guesswork."
      intro="Dew Theory is a small, deliberate skincare shop. We retail Skin Script professional products — the same line used in treatment rooms — and pair every purchase with guidance from a licensed aesthetician, so the shelf you buy from is the routine you actually keep."
      actions={
        <>
          <ShellPrimary href="/shop">Shop the collection</ShellPrimary>
          <ShellSecondary href="/virtual-consultation">Book a consultation</ShellSecondary>
        </>
      }
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <section>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.05] text-ink">
            What this is
          </h2>
          <div className="mt-6 space-y-5 font-body text-[1.02rem] font-normal leading-[1.75] text-muted">
            <p>
              A professional skincare retail storefront, run alongside one-to-one virtual
              consultations. The catalog is Skin Script: cleansers, toners, serums,
              exfoliants, moisturizers, masks, eye and lip treatments, and SPF.
            </p>
            <p>
              Products are described with their real actives, real sizes and the concerns they
              are formulated to address. Where a price has not been confirmed, it is marked as
              unconfirmed rather than quietly rounded.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.05] text-ink">
            How we work
          </h2>
          <div className="mt-6 space-y-5 font-body text-[1.02rem] font-normal leading-[1.75] text-muted">
            <p>
              Barrier first. A routine that respects your skin barrier outperforms a routine that
              attacks it, so actives are introduced in order and at a pace your skin can hold.
            </p>
            <p>
              Guidance is cosmetic, not medical. We can tell you what a product is formulated for
              and how to layer it. We do not diagnose conditions, and we will point you back to a
              clinician when something needs one.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-normal leading-[1.1] text-ink">
          What we will not do
        </h2>
        <ul className="mt-7 grid gap-x-10 gap-y-5 sm:grid-cols-3">
          {[
            [
              'Sell you a shelf',
              'If three products solve it, you get three products. Quantity is not the goal.'
            ],
            [
              'Invent a claim',
              'No invented ratings, reviews, awards or before-and-after results anywhere on this site.'
            ],
            [
              'Guess at your skin',
              'Recommendations come from the catalog and from what you tell us — never from a template.'
            ]
          ].map(([head, body]) => (
            <li key={head} className="border-t border-hairline pt-5">
              <p className="font-body text-[0.7rem] font-medium uppercase tracking-lockup text-ink">
                {head}
              </p>
              <p className="mt-3 font-body text-[0.95rem] leading-[1.7] text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-border pt-10">
        <Link
          href="/ingredients"
          className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
        >
          Ingredient library
        </Link>
        <Link
          href="/journal"
          className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
        >
          Read the journal
        </Link>
      </div>
    </PageShell>
  );
}
