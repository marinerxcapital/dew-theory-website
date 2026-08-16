import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
  title: 'Booking, Cancellation & No-Show Policy',
  description:
    'Dew Theory booking, cancellation, and no-show policy. View or download the full FIXED V2 PDF.',
  alternates: { canonical: '/booking-policy' },
  robots: { index: true, follow: true }
};

export default function BookingPolicyPage() {
  return (
    <LegalPageShell
      documentId="booking-policy"
      eyebrowRight="Booking"
      related={[
        { href: '/book', label: 'Book a facial →' },
        { href: '/aesthetic-disclaimer', label: 'Aesthetic disclaimer →' },
        { href: '/services', label: 'Services →' }
      ]}
    >
      <div data-reveal className="glass-1 p-8 md:p-10">
        <h2 className="font-display text-xl font-normal text-ink">Full policy (PDF)</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          The complete Booking, Cancellation &amp; No-Show Policy is provided as a downloadable PDF.
          Use View PDF or Download PDF above for the authoritative printable document. Deposit
          amounts and cutoffs, when charged, are governed by that policy — this page does not invent
          fees.
        </p>
      </div>
    </LegalPageShell>
  );
}
