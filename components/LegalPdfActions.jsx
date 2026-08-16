import { getLegalDocument } from '@/lib/legal-documents';

/**
 * Consistent View / Download PDF actions for legal HTML pages.
 * Uses native browser PDF handling (Safari/iOS friendly).
 * @param {{ documentId: string, className?: string }} props
 */
export default function LegalPdfActions({ documentId, className = '' }) {
  const doc = getLegalDocument(documentId);
  if (!doc?.pdfPath) return null;

  return (
    <div
      className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`.trim()}
      data-legal-pdf-actions={documentId}
    >
      <a
        href={doc.pdfPath}
        target="_blank"
        rel="noopener noreferrer"
        className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew underline-offset-4 hover:text-dew-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
      >
        View PDF
        <span className="sr-only"> — {doc.title} (opens in a new tab)</span>
      </a>
      <a
        href={doc.pdfPath}
        download={doc.fileName}
        className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-ink/70 underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
      >
        Download PDF
        <span className="sr-only"> — {doc.title}</span>
      </a>
      <a
        href={doc.pdfPath}
        target="_blank"
        rel="noopener noreferrer"
        className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-ink/70 underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
      >
        Print / PDF
        <span className="sr-only"> — open {doc.title} to print</span>
      </a>
    </div>
  );
}
