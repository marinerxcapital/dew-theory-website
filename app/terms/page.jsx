import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
  title: 'Terms of Use & Sale',
  description:
    'Dew Theory terms of use and sale. View or download the full FIXED V2 PDF policy.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true }
};

export default function TermsPage() {
  return (
    <LegalPageShell
      documentId="terms"
      eyebrowRight="Terms"
      related={[
        { href: '/privacy', label: 'Privacy →' },
        { href: '/shipping', label: 'Shipping →' },
        { href: '/returns', label: 'Returns →' }
      ]}
    >
      <div data-reveal className="glass-1 p-8 md:p-10">
        <h2 className="font-display text-xl font-normal text-ink">Full policy (PDF)</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          The complete Terms of Use &amp; Sale are provided as a downloadable PDF. Use View PDF or
          Download PDF above for the authoritative printable document. This page does not replace or
          paraphrase that document.
        </p>
      </div>
    </LegalPageShell>
  );
}
