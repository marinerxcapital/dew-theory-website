import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
  title: 'Accessibility Statement',
  description:
    'Dew Theory accessibility statement. View or download the full FIXED V2 PDF.',
  alternates: { canonical: '/accessibility' },
  robots: { index: true, follow: true }
};

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      documentId="accessibility"
      eyebrowRight="Access"
      related={[
        { href: '/privacy', label: 'Privacy →' }
      ]}
    >
      <div data-reveal className="glass-1 p-8 md:p-10">
        <h2 className="font-display text-xl font-normal text-ink">Full statement (PDF)</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          The complete Accessibility Statement is provided as a downloadable PDF. Use View PDF or
          Download PDF above for the authoritative printable document. For accessibility feedback,
          email{' '}
          <a href="mailto:hello@dewtheory.studio" className="text-ink underline underline-offset-2">
            hello@dewtheory.studio
          </a>
          .
        </p>
      </div>
    </LegalPageShell>
  );
}
