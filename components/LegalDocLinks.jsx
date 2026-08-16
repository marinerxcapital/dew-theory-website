import Link from 'next/link';

/**
 * Inline legal document list (HTML route and/or PDF).
 * @param {{
 *   documents: Array<{ id: string, title: string, route?: string|null, pdfPath?: string|null }>,
 *   className?: string,
 *   dense?: boolean
 * }} props
 */
export default function LegalDocLinks({ documents = [], className = '', dense = false }) {
  if (!documents.length) return null;

  return (
    <ul
      className={`${dense ? 'space-y-1.5' : 'space-y-2'} ${className}`.trim()}
      data-legal-doc-links
    >
      {documents.map((doc) => (
        <li key={doc.id} className="font-body text-sm font-normal leading-relaxed text-muted">
          {doc.route ? (
            <Link
              href={doc.route}
              className="text-ink underline underline-offset-2 hover:text-dew focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
            >
              {doc.title}
            </Link>
          ) : (
            <span className="text-ink">{doc.title}</span>
          )}
          {doc.pdfPath ? (
            <>
              {' '}
              <span className="text-muted/80" aria-hidden="true">
                ·
              </span>{' '}
              <a
                href={doc.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dew underline underline-offset-2 hover:text-dew-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
              >
                PDF
                <span className="sr-only"> — {doc.title}</span>
              </a>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
