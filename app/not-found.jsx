import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Page not found'
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-shell flex-col justify-center px-6 py-24 lg:px-10">
      <Rule left="404" right="Missing" />
      <h1 className="mt-10 font-display text-4xl font-normal text-graphite sm:text-5xl">
        This page is not on the shelf
      </h1>
      <p className="mt-6 max-w-md font-body text-sm font-light leading-relaxed text-charcoal/70">
        The link may be old, or the product may have been pulled. Nothing here was invented — just
        gone.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
        >
          Shop
        </Link>
        <Link
          href="/"
          className="border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
        >
          Home
        </Link>
        <Link
          href="/book"
          className="border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
        >
          Book
        </Link>
      </div>
    </section>
  );
}
