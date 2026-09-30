import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import ContactForm from '@/components/ContactForm';

export const metadata = withPageMetadata('/contact', {
  title: 'Contact',
  description:
    'Send Dew Theory a message about an order, a product question, a consultation or a return.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Dew Theory',
    description: 'Order questions, product questions, consultations and returns.',
    url: '/contact',
    type: 'website'
  }
});

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Contact"
      intro="Tell us what you need and we will reply by email. If it relates to an order, include the order reference so we can pull it up straight away."
    >
      <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <ContactForm />
        </div>

        <aside className="space-y-9">
          <div>
            <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
              Before you write
            </p>
            <ul className="mt-4 space-y-3 font-body text-[0.95rem] leading-[1.7] text-muted">
              <li>
                Shipping windows and rates:{' '}
                <Link href="/shipping" className="underline decoration-border underline-offset-4 hover:decoration-ink">
                  shipping
                </Link>
              </li>
              <li>
                Return eligibility:{' '}
                <Link href="/returns" className="underline decoration-border underline-offset-4 hover:decoration-ink">
                  returns
                </Link>
              </li>
              <li>
                Consultation cancellations:{' '}
                <Link
                  href="/booking-policy"
                  className="underline decoration-border underline-offset-4 hover:decoration-ink"
                >
                  booking policy
                </Link>
              </li>
              <li>
                Common questions:{' '}
                <Link href="/help" className="underline decoration-border underline-offset-4 hover:decoration-ink">
                  help center
                </Link>
              </li>
            </ul>
          </div>

          <div className="border-t border-border pt-8">
            <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
              Skin guidance
            </p>
            <p className="mt-3 font-body text-[0.95rem] leading-[1.7] text-muted">
              For a routine recommendation, the{' '}
              <Link
                href="/virtual-consultation"
                className="underline decoration-border underline-offset-4 hover:decoration-ink"
              >
                virtual consultation
              </Link>{' '}
              is faster than email — it includes the questionnaire and a scheduled session.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
