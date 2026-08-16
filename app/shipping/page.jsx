import Link from 'next/link';
import Rule from '@/components/Rule';
import LegalPdfActions from '@/components/LegalPdfActions';

export const metadata = {
  title: 'Shipping',
  description:
    'Dew Theory shipping: $7 flat rate, free at $49+ order subtotal (before discounts). View or download the full Shipping & Delivery Policy PDF.',
  alternates: { canonical: '/shipping' },
  robots: { index: true, follow: true }
};

export default function ShippingPage() {
  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group="ship-head">
        <Rule left="Policies" right="Shipping" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.3rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-ink"
        >
          Shipping
        </h1>
        <p
          data-reveal
          className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Rates below match what the bag and checkout already calculate. The full Shipping &amp;
          Delivery Policy PDF is the authoritative printable document.
        </p>
        <LegalPdfActions documentId="shipping" />
      </div>

      <div className="mt-16 space-y-6" data-reveal-group="ship-body">
        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Rates (live in cart)</h2>
          <ul className="mt-4 max-w-2xl space-y-3 font-body text-sm font-normal leading-relaxed text-muted">
            <li>
              <span className="text-ink/90">Flat shipping:</span> $7 per order when the free
              threshold is not met.
            </li>
            <li>
              <span className="text-ink/90">Free shipping:</span> waived when order subtotal is
              $49 or more.
            </li>
            <li>
              The free-shipping threshold is compared against the{' '}
              <span className="text-ink/90">pre-discount</span> subtotal (before promo codes).
              That basis is the current implementation; it can be flipped if Emily prefers
              post-discount.
            </li>
          </ul>
          <p className="mt-5 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Shipping appears as its own line at checkout. Server-side re-pricing confirms the fee
            before payment so the total you see is not only a client estimate.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Address at checkout</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Product checkout collects a complete shipping address (street, city, state, postal
            code) so the order can be fulfilled. Incomplete addresses are rejected before payment
            proceeds.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Skin Script fulfillment</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Catalog products are Skin Script actives sold through Dew Theory. Live ship-from
            location, carrier, tracking format, and partial-ship rules depend on the Skin Script
            partner process and are not invented on this page.
          </p>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Until those operational details are confirmed, treat published transit estimates as
            forthcoming — not a promise of a specific number of business days.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Questions</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            For an order in progress, use the contact form and choose order / shipping so Emily
            can look up what you need. Final policy language on international shipping, holds,
            and damaged-in-transit handling will be added when operations are set.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-6 sm:mt-14" data-reveal>
        <Link
          href="/shop"
          className="btn-ghost px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
        >
          Shop
        </Link>
        <Link
          href="/returns"
          className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
        >
          Returns →
        </Link>
      </div>
    </section>
  );
}
