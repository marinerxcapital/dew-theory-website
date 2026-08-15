import Link from 'next/link';
import Rule from '@/components/Rule';

export const metadata = {
  title: 'Returns',
  description:
    'Dew Theory returns scaffold — eligibility, how to request, and non-returnables. Final policy will be published by Emily before full launch.'
};

export default function ReturnsPage() {
  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group="returns-head">
        <Rule left="Policies" right="Returns" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-ink"
        >
          Returns
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Structure only for now. Return windows, restocking rules, and refund timing are business
          decisions Emily will publish before full launch — this page does not invent a 30-day (or
          any other) guarantee.
        </p>
      </div>

      <div className="mt-16 space-y-6" data-reveal-group="returns-body">
        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Eligibility</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Which products can be returned, in what condition, and within what timeframe will be
            stated here once confirmed. Skincare often has hygiene limits; final eligibility will
            reflect both client policy and any manufacturer or wholesale constraints.
          </p>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            {/* OPEN_ITEMS: returns process / Skin Script partner rules unconfirmed */}
            Until then, treat every order as subject to the forthcoming published policy rather than
            an implied standard retail window.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">How to request</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            When the full policy is live, this section will list the steps and what to include (order
            reference, reason, photos if needed). For now, reach out through the{' '}
            <Link href="/contact" className="text-charcoal underline-offset-4 hover:underline">
              contact form
            </Link>{' '}
            with your order details and what went wrong — Emily can respond case by case while formal
            terms are finalized.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Non-returnables</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            Categories that cannot be returned (for example opened actives, certain hygiene-sensitive
            items, or final-sale promotions) will be listed explicitly when Emily sets the policy. No
            placeholder list is offered here as if it were already decided.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Damaged or incorrect</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            If something arrives damaged or does not match what you ordered, contact the studio as
            soon as you can with photos and your order reference. Resolution paths (replacement,
            refund, or supplier coordination) depend on fulfillment setup and will be documented with
            the final returns policy.
          </p>
        </div>

        <div data-reveal className="glass-1 p-8 md:p-10">
          <h2 className="font-display text-xl font-normal text-ink">Services</h2>
          <p className="mt-4 max-w-2xl font-body text-sm font-light leading-relaxed text-charcoal/70">
            In-studio facials and virtual consultations are services, not shipped goods. Deposit and
            cancellation terms for bookings are separate and will publish when those numbers are set
            — they are not folded into product returns language.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 sm:mt-14" data-reveal>
        <Link
          href="/contact"
          className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Contact
        </Link>
        <Link
          href="/shipping"
          className="inline-flex min-h-[44px] items-center font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Shipping →
        </Link>
      </div>
    </section>
  );
}
