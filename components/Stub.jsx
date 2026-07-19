import Link from 'next/link';
import Rule from './Rule';

/** Route exists and is styled; the page itself lands in a later pass. */
export default function Stub({ eyebrow, title, note }) {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10">
      <Rule left={eyebrow} right="In progress" />
      <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5rem)] font-normal leading-[1.02] text-graphite">
        {title}
      </h1>
      <p className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75">
        {note}
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="sweep inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
