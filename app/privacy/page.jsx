import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Privacy',
  description:
    'How Dew Theory handles cart data, payments, admin sessions, and consultation photos. Final legal terms publish before full launch.'
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group="privacy-head">
        <Rule left="Policies" right="Privacy" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-ink"
        >
          Privacy
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          This page describes how the site works today with data you provide. Full legal terms,
          retention schedules, and a published contact for privacy requests will be confirmed before
          full launch — nothing below invents those details.
        </p>
      </div>

      <div className="mt-16 space-y-6" data-reveal-group="privacy-body">
        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Cart on your device</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Your shopping cart and any promo code you apply are stored in your browser&apos;s{' '}
            <span className="text-ink/90">localStorage</span> so the bag persists between
            visits. That data stays on your device until you clear site data or empty the cart. At
            checkout, line items are re-priced on the server so totals match current catalog prices.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Orders &amp; payments</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            When payment processing is configured, checkout runs through{' '}
            <span className="text-ink/90">Stripe</span>. Card numbers and payment credentials
            are handled by Stripe — Dew Theory does not store full card data on this site. Order
            records keep what is needed to fulfill and support the purchase (items, totals, shipping
            address you provide, and status). Without Stripe keys, checkout can still run in a local
            mock mode for development; that is not a live payment path.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">
            Booking &amp; virtual consultation
          </h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Appointment requests and virtual-consultation intake collect the information you submit
            so Emily can prepare and follow up. Consultation photos are stored privately — there are
            no public image URLs. Access is limited to authorized admin views and the secure intake
            session tied to your consultation. Intake and plan links use private tokens; treat them
            as personal and do not share them publicly.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Admin sessions</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Studio staff sign in through a separate admin area. Sessions use an httpOnly cookie so
            credentials are not exposed to page scripts. That gate is for operators only — it is not
            part of the customer account experience.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Email</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            Transactional messages related to orders or consultations may be sent by email when
            delivery is enabled for the studio. Contact form submissions reach Emily through the
            site&apos;s contact flow so she can reply directly.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">
            What this page does not claim yet
          </h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
            We do not invent third-party analytics vendors, ad networks, or a privacy-officer name.
            Cookie banners, formal retention periods, and GDPR/CCPA request procedures will be
            published when Emily confirms the full policy. First-party funnel events may be recorded
            to understand storefront flow; any additional analytics provider will be named here only
            after it is actually in use.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-6 sm:mt-14" data-reveal>
        <Link
          href="/contact"
          className="btn-ghost px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
        >
          Contact
        </Link>
        <Link
          href="/shipping"
          className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
        >
          Shipping →
        </Link>
      </div>
    </section>
  );
}
