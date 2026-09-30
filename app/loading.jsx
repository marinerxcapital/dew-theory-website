export default function LoadingPage() {
  return <section className="mx-auto max-w-shell px-6 py-section-sm" aria-busy="true" aria-label="Loading page"><p role="status" className="sr-only">Loading Dew Theory</p><div className="h-14 w-2/3 rounded-card bg-green-200 animate-skeleton-breathe"/><div className="mt-8 grid gap-6 sm:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-80 rounded-card bg-green-50 animate-skeleton-breathe"/>)}</div></section>;
}
