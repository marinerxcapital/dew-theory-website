import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Shipping',
  description:
    'Dew Theory shipping: $7 flat rate, free at $49+ order subtotal (before discounts). Fulfillment notes for Skin Script products.'
};

export default function ShippingPage() {
  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group="ship-head">
        <p
          data-reveal
          className="font-label text-[0.62rem] uppercase tracking-lockup text-muted"
        >
          Policies · Shipping
        </p>
        <h1
          data-reveal
          className="mt-3 max-w-2xl font-display text-[clamp(2.3rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-ink"
        >
          Shipping
        </h1>
        <p
          data-reveal
          className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Rates below match what the bag and checkout already calculate. Transit windows, carriers,
          and ship-from details will be published when fulfillment is confirmed.
        </p>
      </div>

      <div className="mt-16 space-y-6" data-reveal-group="ship-body">
        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-graphite">Rates (live in cart)</h2>
          <ul className="mt-4 max-w-2xl space-y-3 font-body text-sm font-light leading-relaxed text-charcoal/70">
            <li>
              <span className="text-charcoal/90">Flat shipping:</span> $7 per order when the free
              threshold is not met.
            </li>
            <li>
              <span className="text-charcoal/90">Free shipping:</span> waived when order subtotal is
              $49 or more.
            </li>
            <li>
              The free-shipping threshold is compared against the{' '}
              <span className="text-charcoal/90">pre-discount</span> subtotal (before promo codes).
              That basis is the current implementation; it can be flipped if Emily prefers
              post-discount.
            </li>
          </ul>
          <p className="mt-5 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Shipping appears as its own line at checkout. Server-side re-pricing confirms the fee
            before payment so the total you see is not only a client estimate.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-graphite">Address at checkout</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Product checkout collects a complete shipping address (street, city, state, postal code)
            so the order can be fulfilled. Incomplete addresses are rejected before payment proceeds.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-graphite">
            Skin Script fulfillment
          </h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Catalog products are Skin Script actives sold through Dew Theory. Wholesale / dropship
            fulfillment may place supplier purchase orders after a paid order, depending on how the
            account is configured. Live ship-from location, carrier, tracking format, and partial-ship
            rules depend on the Skin Script partner process and are not invented on this page.
          </p>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Until those operational details are confirmed, treat published transit estimates as
            forthcoming — not a promise of a specific number of business days.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-graphite">Questions</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            For an order in progress, use the contact form and choose order / shipping so Emily can
            look up what you need. Final policy language on international shipping, holds, and
            damaged-in-transit handling will be added when operations are set.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 sm:mt-14" data-reveal>
        <Link
          href="/shop"
          className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Shop
        </Link>
        <Link
          href="/returns"
          className="inline-flex min-h-[44px] items-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Returns →
        </Link>
      </div>
    </section>
  );
}
