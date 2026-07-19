import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import DiscountManager from '@/components/admin/DiscountManager';

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const { discount_codes } = readStore();

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Discount codes</h1>
      <p className="mt-2 max-w-xl font-body text-sm font-light text-charcoal/70">
        Backed by Stripe Promotion Codes when STRIPE_SECRET_KEY is set; otherwise local store only.
        Percentage/amount is admin-configurable — not hardcoded.
      </p>
      <div className="mt-10">
        <DiscountManager initial={discount_codes} />
      </div>
    </div>
  );
}
