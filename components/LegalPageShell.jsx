import Link from 'next/link';
import Rule from '@/components/Rule';
import LegalPdfActions from '@/components/LegalPdfActions';
import { getLegalDocument } from '@/lib/legal-documents';

/**
 * Shared shell for public legal HTML pages. Does not invent policy language —
 * points to the FIXED V2 PDF as the full printable document.
 * @param {{
 *   documentId: string,
 *   eyebrowRight?: string,
 *   children?: import('react').ReactNode,
 *   related?: { href: string, label: string }[]
 * }} props
 */
export default function LegalPageShell({
  documentId,
  eyebrowRight = 'Policy',
  children,
  related = []
}) {
  const doc = getLegalDocument(documentId);
  const title = doc?.title || 'Legal';

  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group={`${documentId}-head`}>
        <Rule left="Policies" right={eyebrowRight} data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4rem)] font-normal leading-[1.05] text-ink"
        >
          {title}
        </h1>
        <LegalPdfActions documentId={documentId} />
      </div>

      {children ? (
        <div className="mt-12 space-y-6" data-reveal-group={`${documentId}-body`}>
          {children}
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-12 flex flex-wrap items-center gap-6 sm:mt-14" data-reveal>
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
