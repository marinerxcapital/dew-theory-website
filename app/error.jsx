'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }) {
  return <section className="mx-auto max-w-measure px-6 py-section-sm"><p className="editorial-label">Dew Theory</p><h1 className="mt-4">A moment to reset.</h1><p className="mt-6">We could not load this page. Please try again.</p><div className="mt-8 flex flex-wrap gap-4"><button type="button" onClick={reset} className="btn-primary px-8 py-3">Try again</button><Link href="/shop" className="btn-ghost px-8 py-3">Return to the shop</Link></div></section>;
}
