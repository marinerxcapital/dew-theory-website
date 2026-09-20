import { requireOwnerAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import DiscountManager from '@/components/admin/DiscountManager';

export default async function AdminDiscountsPage() {
  await requireOwnerAdmin();
  const { discount_codes } = readStore();

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Discount codes</h1>
      <p className="mt-2 max-w-xl font-body text-sm font-light text-charcoal/70">
        Backed by Stripe Promotion Codes when STRIPE_SECRET_KEY is set; otherwise local store only.
        Seeded <span className="font-normal text-charcoal">DEW15</span> is a launch-promo
        placeholder at 15% — not an Emily-approved marketing rate. Change the percentage here
        anytime; do not present 15% as owner-confirmed until she answers.
      </p>
      <div className="mt-10">
        <DiscountManager initial={discount_codes} />
      </div>
    </div>
  );
}
