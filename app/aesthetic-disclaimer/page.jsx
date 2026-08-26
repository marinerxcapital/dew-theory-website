import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
  title: 'Aesthetic Services & Skincare Disclaimer',
  description:
    'Dew Theory aesthetic services and skincare disclaimer. View or download the full FIXED V2 PDF.',
  alternates: { canonical: '/aesthetic-disclaimer' },
  robots: { index: true, follow: true }
};

export default function AestheticDisclaimerPage() {
  return (
    <LegalPageShell
      documentId="aesthetic-disclaimer"
      eyebrowRight="Disclaimer"
      related={[
        { href: '/booking-policy', label: 'Booking policy →' },
        { href: '/virtual-consultation', label: 'Virtual consultation →' }
      ]}
    >
      <div data-reveal className="glass-1 p-8 md:p-10">
        <h2 className="font-display text-xl font-normal text-ink">Full disclaimer (PDF)</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          The complete Aesthetic Services &amp; Skincare Disclaimer is provided as a downloadable
          PDF. Use View PDF or Download PDF above for the authoritative printable document.
        </p>
      </div>
    </LegalPageShell>
  );
}
