import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import { FREE_SHIPPING_THRESHOLD_USD, FLAT_SHIPPING_USD, formatMoney } from '@/lib/shipping';

export const metadata = withPageMetadata('/help', {
  title: 'Help center',
  description:
    'Orders, shipping, returns, consultation bookings and product questions — with links to the full published policies.',
  alternates: { canonical: '/help' },
  openGraph: {
    title: 'Help center — Dew Theory',
    description: 'Orders, shipping, returns and consultation questions.',
    url: '/help',
    type: 'website'
  }
});

/**
 * Help center.
 *
 * Every answer either describes how the site actually behaves or links to a
 * published policy page. Nothing here restates or paraphrases policy terms in
 * the site's own words, so the policies remain the single source of truth.
 */
const FAQS = [
  {
    q: 'How much is shipping, and when is it free?',
    a: (
      <>
        {formatMoney(FLAT_SHIPPING_USD)} flat, waived once the product subtotal reaches{' '}
        {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}. The meter in your bag shows exactly how far
        you are from it. Full detail is on the{' '}
        <Link href="/shipping" className="underline decoration-border underline-offset-4">
          shipping page
        </Link>
        .
      </>
    )
  },
  {
    q: 'What can I return?',
    a: (
      <>
        Return eligibility, timeframes and condition requirements are set out in the published{' '}
        <Link href="/returns" className="underline decoration-border underline-offset-4">
          returns policy
        </Link>
        . If something is wrong with an order, send it through the{' '}
        <Link href="/contact" className="underline decoration-border underline-offset-4">
          contact form
        </Link>{' '}
        with your order details.
      </>
    )
  },
  {
    q: 'What happens in a virtual consultation?',
    a: (
      <>
        A questionnaire first, then an optional photo upload, then a scheduled session where the
        routine is built and the order to introduce it in. The stages are described on the{' '}
        <Link href="/virtual-consultation" className="underline decoration-border underline-offset-4">
          consultation page
        </Link>
        . Rescheduling and cancellation terms are in the{' '}
        <Link href="/booking-policy" className="underline decoration-border underline-offset-4">
          booking policy
        </Link>
        .
      </>
    )
  },
  {
    q: 'Do I need a consultation to buy?',
    a: 'No. The full catalog is open and every product page lists its actives, size and the concerns it addresses. The consultation exists if you would rather not choose by yourself.'
  },
  {
    q: 'Can you tell me if I have a skin condition?',
    a: (
      <>
        No. Guidance here is cosmetic — what a product is formulated for and how to layer it. It is
        not diagnosis or treatment. See the{' '}
        <Link
          href="/aesthetic-disclaimer"
          className="underline decoration-border underline-offset-4"
        >
          aesthetic disclaimer
        </Link>
        .
      </>
    )
  },
  {
    q: 'How do I track an order?',
    a: 'Order and fulfilment updates are sent by email to the address used at checkout. If you need an update sooner, contact us with the order reference and we will look it up.'
  },
  {
    q: 'Where can I read the ingredient information?',
    a: (
      <>
        Every product page lists its key actives with their function, and the{' '}
        <Link href="/ingredients" className="underline decoration-border underline-offset-4">
          ingredient library
        </Link>{' '}
        collects them across the catalog.
      </>
    )
  }
];

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Help center"
      intro="The short answers are below. Where a policy governs the answer, the policy itself is the reference — this page points you to it rather than paraphrasing it."
      actions={<ShellPrimary href="/contact">Contact us</ShellPrimary>}
    >
      <ul className="border-t border-border">
        {FAQS.map((f) => (
          <li key={f.q} className="border-b border-border">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 font-display text-[1.25rem] font-normal leading-snug text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 font-body text-[1.1rem] leading-none text-muted transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="max-w-measure pb-7 font-body text-[0.98rem] leading-[1.75] text-muted">
                {f.a}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
