import Link from 'next/link';
import Rule from '@/components/Rule';
import LegalPdfActions from '@/components/LegalPdfActions';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';
import { getCustomerFulfillmentCopy } from '@/lib/admin/dashboard';

export const metadata = {
  title: 'Shipping',
  description:
    'Dew Theory shipping: $7 flat rate, free at $49+ order subtotal (before discounts). View or download the full Shipping & Delivery Policy PDF.',
  alternates: { canonical: '/shipping' },
  robots: { index: true, follow: true }
};

export default function ShippingPage() {
  const fulfillmentCopy = getCustomerFulfillmentCopy();
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
          Rates below match the bag and checkout. The Shipping &amp; Delivery Policy PDF is the
          authoritative printable document.
        </p>
        <LegalPdfActions documentId="shipping" />
      </div>

      <div className="mt-16 space-y-6" data-reveal-group="ship-body">
        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Rates</h2>
          <ul className="mt-4 max-w-2xl space-y-3 font-body text-sm font-normal leading-relaxed text-muted">
            <li>
              <span className="text-ink/90">Flat shipping:</span>{' '}
              {formatMoney(FLAT_SHIPPING_USD)} per order when the free threshold is not met.
            </li>
            <li>
              <span className="text-ink/90">Free shipping:</span> waived when the product
              subtotal is {formatMoney(FREE_SHIPPING_THRESHOLD_USD)} or more, before promo codes.
            </li>
          </ul>
          <p className="mt-5 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Shipping is its own line at checkout. The server re-prices the order before payment so
            the total is not only a browser estimate.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Address at checkout</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Checkout asks for a complete U.S. shipping address (street, city, state, postal code)
            before payment. Incomplete addresses are returned with a list of what is missing.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">How orders ship</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Catalog products are Skin Script actives sold through Dew Theory.{' '}
            {fulfillmentCopy.shippingBlurb} Carrier, tracking, and ship-from details are confirmed
            on each order after checkout — we do not publish a standard transit window yet.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Questions</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            For an order already placed, email{' '}
            <a
              href="mailto:hello@dewtheory.studio"
              className="text-ink underline-offset-4 hover:underline"
            >
              hello@dewtheory.studio
            </a>
            . International shipping, holds, and damaged-in-transit handling will be listed here
            once those operations are set.
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
