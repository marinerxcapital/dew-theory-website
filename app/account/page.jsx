import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import SignOutButton from '@/components/customer/SignOutButton';
import { requireCustomer } from '@/lib/customers/guards';
import { listFavorites } from '@/lib/customers/store';
import { commerceListOrders } from '@/lib/commerce/index.js';
import { formatMoney } from '@/lib/shipping';
import { normalizeEmail } from '@/lib/customers/schema';

export const metadata = withPageMetadata('/account', {
  title: 'Your account',
  description: 'Your Dew Theory orders, favorites and routine in one place.',
  alternates: { canonical: '/account' },
  robots: { index: false, follow: false }
});

export const dynamic = 'force-dynamic';

/**
 * Account dashboard.
 *
 * Every value on this page is scoped server-side to the signed-in customer:
 * orders are filtered by the email on the session's own customer record, and
 * favorites are read by customer id. No identifier is taken from the URL, so
 * there is nothing here to tamper with.
 */
export default async function AccountPage() {
  const customer = await requireCustomer();

  const favorites = await listFavorites(customer.id);

  let orders = [];
  try {
    const all = await commerceListOrders();
    const mine = normalizeEmail(customer.email);
    orders = (all || [])
      .filter((o) => normalizeEmail(o?.customer?.email) === mine)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, 20);
  } catch {
    orders = [];
  }

  const displayName = customer.name || customer.email;

  return (
    <PageShell
      eyebrow="Account"
      title={displayName}
      intro="Your orders and favorites, held against your account."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/favorites"
          className="btn-ghost inline-flex min-h-[48px] items-center px-7 py-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup"
        >
          Favorites ({favorites.length})
        </Link>
        <Link
          href="/shop"
          className="btn-ghost inline-flex min-h-[48px] items-center px-7 py-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup"
        >
          Shop the collection
        </Link>
        <SignOutButton />
      </div>

      <section className="mt-16" aria-labelledby="account-orders">
        <h2
          id="account-orders"
          className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted"
        >
          Orders
        </h2>

        {orders.length ? (
          <ul className="mt-6 border-t border-border">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 border-b border-border py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="min-w-0">
                  <p className="font-display text-[1.15rem] font-normal text-ink">
                    {order.id}
                  </p>
                  <p className="mt-1 font-body text-[0.8rem] uppercase tracking-eyebrow text-muted">
                    {order.created_at ? new Date(order.created_at).toISOString().slice(0, 10) : ''}
                    {order.status ? ` · ${order.status}` : ''}
                  </p>
                  {Array.isArray(order.items) ? (
                    <p className="mt-2 font-body text-[0.9rem] text-muted">
                      {order.items
                        .map((i) => `${i.name || i.product_id} ×${i.quantity || 1}`)
                        .join(', ')}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 font-body text-[0.95rem] text-ink">
                  {typeof order.total === 'number' ? formatMoney(order.total) : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 border border-border px-8 py-14 text-center">
            <p className="font-display text-[1.4rem] text-ink">No orders yet.</p>
            <p className="mx-auto mt-3 max-w-md font-body text-[0.95rem] leading-[1.7] text-muted">
              Orders placed with this email address will appear here. Guest orders are matched on the
              email used at checkout.
            </p>
          </div>
        )}
      </section>

      <section className="mt-16 border-t border-border pt-10" aria-labelledby="account-details">
        <h2
          id="account-details"
          className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted"
        >
          Details
        </h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
              Email
            </dt>
            <dd className="mt-2 font-body text-[0.98rem] text-ink">{customer.email}</dd>
          </div>
          <div>
            <dt className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
              Name
            </dt>
            <dd className="mt-2 font-body text-[0.98rem] text-ink">{customer.name || 'Not set'}</dd>
          </div>
        </dl>
      </section>
    </PageShell>
  );
}
