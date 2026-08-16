import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
  title: 'Cookie & Tracking Technologies Notice',
  description:
    'Dew Theory cookie and tracking technologies notice. View or download the full FIXED V2 PDF.',
  alternates: { canonical: '/cookies' },
  robots: { index: true, follow: true }
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      documentId="cookies"
      eyebrowRight="Cookies"
      related={[
        { href: '/privacy', label: 'Privacy →' },
        { href: '/accessibility', label: 'Accessibility →' }
      ]}
    >
      <div data-reveal className="glass-1 p-8 md:p-10">
        <h2 className="font-display text-xl font-normal text-ink">Full notice (PDF)</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          The complete Cookie &amp; Tracking Technologies Notice is provided as a downloadable PDF.
          Use View PDF or Download PDF above for the authoritative printable document.
        </p>
      </div>
    </LegalPageShell>
  );
}
