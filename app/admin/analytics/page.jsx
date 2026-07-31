import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import {
  parseDateRange,
  filterByCreatedAt,
  countEventsByType,
  weeklyEventSummary
} from '@/lib/analytics';

const PAIDISH = new Set(['paid', 'fulfilled', 'submitted_to_skin_script']);

export default async function AdminAnalyticsPage({ searchParams }) {
  await requireAdmin();
  const fromYmd = typeof searchParams?.from === 'string' ? searchParams.from : '';
  const toYmd = typeof searchParams?.to === 'string' ? searchParams.to : '';
  const { from, to } = parseDateRange(fromYmd || null, toYmd || null);

  const store = readStore();
  const events = filterByCreatedAt(store.events || [], from, to, 'at');
  const allOrders = filterByCreatedAt(store.orders || [], from, to, 'created_at');
  const orders = allOrders.filter((o) => PAIDISH.has(o.status));
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const aov = orders.length ? revenue / orders.length : 0;

  const byProduct = new Map();
  const byCategory = new Map();
  for (const o of orders) {
    for (const li of o.items || []) {
      const prev = byProduct.get(li.product_id) || { name: li.name, units: 0, revenue: 0 };
      prev.units += li.quantity;
      prev.revenue += li.unit_price * li.quantity;
      byProduct.set(li.product_id, prev);

      const product = store.products.find((p) => p.id === li.product_id);
      const cat = product?.category || 'Unknown';
      const cprev = byCategory.get(cat) || { units: 0, revenue: 0 };
      cprev.units += li.quantity;
      cprev.revenue += li.unit_price * li.quantity;
      byCategory.set(cat, cprev);
    }
  }

  const appts = filterByCreatedAt(store.appointments || [], from, to, 'created_at');
  const byService = new Map();
  for (const a of appts) {
    const prev = byService.get(a.service_name) || { count: 0, cancelled: 0, no_show: 0 };
    prev.count += 1;
    if (a.status === 'cancelled') prev.cancelled += 1;
    if (a.status === 'no_show') prev.no_show += 1;
    byService.set(a.service_name, prev);
  }

  const shopFunnel = [
    { label: 'Product views', n: countEventsByType(events, 'product_view') },
    { label: 'Add to cart', n: countEventsByType(events, 'add_to_cart') },
    { label: 'Checkout started', n: countEventsByType(events, 'checkout_started') },
    { label: 'Checkout completed', n: countEventsByType(events, 'checkout_completed') }
  ];

  const bookFunnel = [
    { label: 'Booking started', n: countEventsByType(events, 'booking_started') },
    { label: 'Service selected', n: countEventsByType(events, 'booking_service_selected') },
    { label: 'Time selected', n: countEventsByType(events, 'booking_time_selected') },
    { label: 'Confirmed', n: countEventsByType(events, 'booking_confirmed') }
  ];

  const week = weeklyEventSummary(store.events || [], 7);

  const rangeQs = (f, t) => {
    const p = new URLSearchParams();
    if (f) p.set('from', f);
    if (t) p.set('to', t);
    const s = p.toString();
    return s ? `?${s}` : '';
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Analytics</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        From site data (Orders, Appointments, DiscountCodes, events) — not static mock UI numbers.
        First-party funnel only; optional third-party traffic analytics later.
      </p>

      <div className="mt-8 glass-1 p-5">
        <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
          Last 7 days (UTC)
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Product views', week.byType.product_view],
            ['Add to cart', week.byType.add_to_cart],
            ['Checkout completed', week.byType.checkout_completed],
            ['Bookings confirmed', week.byType.booking_confirmed],
            ['Checkout started', week.byType.checkout_started],
            ['Booking started', week.byType.booking_started],
            ['Membership interest', week.byType.membership_interest],
            ['All events', week.total_events]
          ].map(([label, n]) => (
            <div key={label} className="border border-chrome/15 bg-pearl/40 px-4 py-3">
              <p className="font-label text-[0.55rem] uppercase tracking-lockup text-chrome">
                {label}
              </p>
              <p className="mt-1 font-display text-2xl font-normal text-graphite">{n}</p>
            </div>
          ))}
        </div>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 glass-1 p-4">
        <label className="font-body text-xs font-light text-charcoal/70">
          From
          <input
            type="date"
            name="from"
            defaultValue={fromYmd}
            className="mt-1 block border border-chrome/30 bg-pearl/90 px-2 py-2"
          />
        </label>
        <label className="font-body text-xs font-light text-charcoal/70">
          To
          <input
            type="date"
            name="to"
            defaultValue={toYmd}
            className="mt-1 block border border-chrome/30 bg-pearl/90 px-2 py-2"
          />
        </label>
        <button
          type="submit"
          className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-pearl"
        >
          Apply
        </button>
        <Link
          href="/admin/analytics"
          className="border border-chrome/30 px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-charcoal"
        >
          Clear
        </Link>
        {(fromYmd || toYmd) && (
          <p className="w-full font-body text-xs font-light text-chrome">
            Range filter active{fromYmd ? ` from ${fromYmd}` : ''}
            {toYmd ? ` to ${toYmd}` : ''}.
          </p>
        )}
      </form>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Revenue', value: formatMoney(revenue) },
          { label: 'Orders', value: String(orders.length) },
          { label: 'Avg order value', value: formatMoney(aov) }
        ].map((c) => (
          <div key={c.label} className="glass-1 p-6">
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              {c.label}
            </p>
            <p className="mt-2 font-display text-2xl font-normal text-graphite">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-normal text-graphite">Shop funnel</h2>
          <ul className="mt-4 space-y-2">
            {shopFunnel.map((s) => (
              <li
                key={s.label}
                className="flex justify-between border-b border-chrome/15 py-2 font-body text-sm font-light"
              >
                <span className="text-charcoal/75">{s.label}</span>
                <span className="text-graphite">{s.n}</span>
              </li>
            ))}
          </ul>
          {shopFunnel.every((s) => s.n === 0) && (
            <p className="mt-3 font-body text-xs font-light text-charcoal/50">
              No funnel events in this range yet.
            </p>
          )}
        </section>
        <section>
          <h2 className="font-display text-xl font-normal text-graphite">Booking funnel</h2>
          <ul className="mt-4 space-y-2">
            {bookFunnel.map((s) => (
              <li
                key={s.label}
                className="flex justify-between border-b border-chrome/15 py-2 font-body text-sm font-light"
              >
                <span className="text-charcoal/75">{s.label}</span>
                <span className="text-graphite">{s.n}</span>
              </li>
            ))}
          </ul>
          {bookFunnel.every((s) => s.n === 0) && (
            <p className="mt-3 font-body text-xs font-light text-charcoal/50">
              No booking events in this range yet.
            </p>
          )}
        </section>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-normal text-graphite">Product performance</h2>
          <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
            {[...byProduct.values()].map((p) => (
              <li key={p.name} className="flex justify-between py-3 font-body text-sm font-light">
                <span>{p.name}</span>
                <span className="text-charcoal/70">
                  {p.units} u · {formatMoney(p.revenue)}
                </span>
              </li>
            ))}
            {!byProduct.size && (
              <li className="py-3 text-sm text-charcoal/50">No order line items yet.</li>
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-normal text-graphite">By category</h2>
          <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
            {[...byCategory.entries()].map(([cat, v]) => (
              <li key={cat} className="flex justify-between py-3 font-body text-sm font-light">
                <span>{cat}</span>
                <span className="text-charcoal/70">
                  {v.units} u · {formatMoney(v.revenue)}
                </span>
              </li>
            ))}
            {!byCategory.size && (
              <li className="py-3 text-sm text-charcoal/50">No category sales yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-xl font-normal text-graphite">Service utilization</h2>
        <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
          {[...byService.entries()].map(([name, v]) => (
            <li key={name} className="flex justify-between py-3 font-body text-sm font-light">
              <span>{name}</span>
              <span className="text-charcoal/70">
                {v.count} booked · {v.cancelled} cancelled · {v.no_show} no-show
              </span>
            </li>
          ))}
          {!byService.size && (
            <li className="py-3 text-sm text-charcoal/50">No appointments in this range.</li>
          )}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-normal text-graphite">Discount codes</h2>
        <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
          {store.discount_codes.map((d) => (
            <li key={d.id} className="flex justify-between py-3 font-body text-sm font-light">
              <span>
                {d.code}
                {d.referrer_customer_id ? ` (ref ${d.referrer_customer_id})` : ''}
              </span>
              <span className="text-charcoal/70">
                {d.uses_count} redemptions · {d.active ? 'active' : 'off'}
              </span>
            </li>
          ))}
          {!store.discount_codes.length && (
            <li className="py-3 text-sm text-charcoal/50">No discount codes configured.</li>
          )}
        </ul>
      </section>

      {/* keep range helper referenced for future preset chips */}
      <span className="hidden">{rangeQs(fromYmd, toYmd)}</span>
    </div>
  );
}
