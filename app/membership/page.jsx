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
    <section className="mx-auto max-w-shell px-6 pb-24 pt-12 sm:pb-28 sm:pt-14 lg:px-10 lg:pt-16">
      <div data-reveal-group="mem-head">
        <Rule left="Membership" right={livePricing ? 'Packages' : 'Interest list'} data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-ink"
        >
          Stay in the plan
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Membership is built for a calm, steady rhythm of care — not a hard sell at the end of a
          facial. The packages below describe the shape of what is coming; pricing appears here
          the moment Emily finalizes it.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2" data-reveal-group="mem-packages">
        {packages.map((pkg) => (
          <article
            key={pkg.id}
            data-reveal
            className="flex flex-col rounded-[3px] border border-border bg-white p-8 shadow-card sm:p-10"
          >
            <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
              Package
            </p>
            <h2 className="mt-3 font-display text-2xl font-normal text-ink">{pkg.name}</h2>
            <p className="mt-4 flex-1 font-body text-sm font-normal leading-relaxed text-muted">
              {pkg.description}
            </p>
            <ul className="mt-6 space-y-2 border-t border-border pt-5">
              {(pkg.perks || []).map((perk) => (
                <li
                  key={perk}
                  className="font-body text-sm font-normal leading-relaxed text-muted"
                >
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-8 font-label text-[0.7rem] font-normal uppercase tracking-lockup text-ink">
              {formatPackagePrice(pkg)}
            </p>
            {!pkg.price_cents && (
              <p className="mt-2 font-body text-xs font-normal text-muted">
                Not for sale yet — join the interest list below.
              </p>
            )}
          </article>
        ))}
      </div>

      <div
        className="mt-16 max-w-lg rounded-[3px] border border-border bg-surface-light p-8 sm:p-10"
        data-reveal-group="mem-interest"
      >
        <h2 className="font-display text-2xl font-normal text-ink">Join the interest list</h2>
        <p className="mt-4 font-body text-sm font-normal leading-relaxed text-muted">
          Leave your name and email for a quiet note when membership opens. No billing, no card on
          file, no charge — just an early heads-up.
        </p>
        <MembershipInterestForm />
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/book"
            className="btn-primary px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Book without membership
          </Link>
          <Link
            href="/shop"
            className="btn-ghost px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
