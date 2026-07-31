import Link from 'next/link';
import Rule from '@/components/Rule';
import MembershipInterestForm from '@/components/MembershipInterestForm';
import {
  formatPackagePrice,
  getMembershipPackages,
  membershipCheckoutEnabled
} from '@/lib/membership';

export const metadata = {
  title: 'Membership',
  description:
    'Dew Theory membership interest list and package structure. Pricing publishes when Emily sets terms.'
};

export default function MembershipPage() {
  const packages = getMembershipPackages();
  const livePricing = membershipCheckoutEnabled();

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div data-reveal-group="mem-head">
        <Rule left="Membership" right={livePricing ? 'Packages' : 'Interest list'} data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-graphite"
        >
          Stay in the plan
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Membership is structured for a calm rhythm of care — not a hard sell at the end of a
          facial. Package names below are directional. Prices appear only when Emily publishes them
          (or sets <code className="text-charcoal/90">MEMBERSHIP_PACKAGES_JSON</code> in ops).
          Checkout is not enabled without real price cents.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2" data-reveal-group="mem-packages">
        {packages.map((pkg) => (
          <article key={pkg.id} data-reveal className="glass-1 flex flex-col p-8 sm:p-10">
            <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
              Package
            </p>
            <h2 className="mt-3 font-display text-2xl font-normal text-graphite">{pkg.name}</h2>
            <p className="mt-4 flex-1 font-body text-sm font-light leading-relaxed text-charcoal/70">
              {pkg.description}
            </p>
            <ul className="mt-6 space-y-2 border-t border-chrome/15 pt-5">
              {(pkg.perks || []).map((perk) => (
                <li
                  key={perk}
                  className="font-body text-sm font-light leading-relaxed text-charcoal/70"
                >
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-8 font-label text-[0.7rem] font-light uppercase tracking-lockup text-graphite">
              {formatPackagePrice(pkg)}
            </p>
            {!pkg.price_cents && (
              <p className="mt-2 font-body text-xs font-light text-charcoal/55">
                Not for sale yet — join the interest list.
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-16 max-w-lg" data-reveal-group="mem-interest">
        <h2 className="font-display text-2xl font-normal text-graphite">Interest list</h2>
        <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/70">
          Leave your name for a quiet note when membership opens. No fake monthly fee, no card
          capture here.
        </p>
        <MembershipInterestForm />
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/book"
            className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
          >
            Book without membership
          </Link>
          <Link
            href="/shop"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
