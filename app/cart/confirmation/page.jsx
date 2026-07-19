import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = { title: 'Order confirmed — Dew Theory' };

export default function ConfirmationPage({ searchParams }) {
  const orderId = searchParams?.order || null;

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10">
      <Rule left="Checkout" right="Confirmed" />
      <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite">
        Thank you
      </h1>
      <p className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75">
        Your order is in. Emily will fulfill it manually through Skin Script — you&apos;ll get a
        confirmation email with details. No live tracking link; we&apos;ll update you when it ships.
      </p>
      {orderId && (
        <p className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
          Order {orderId}
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/shop"
          className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
        >
          Continue shopping
        </Link>
        <Link
          href="/book"
          className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Book a facial
        </Link>
      </div>
    </section>
  );
}
