import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';

function countBy(events, type) {
  return events.filter((e) => e.type === type).length;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const store = readStore();
  const events = store.events || [];
  const orders = store.orders.filter((o) => o.status === 'paid' || o.status === 'fulfilled' || o.status === 'submitted_to_skin_script');
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const aov = orders.length ? revenue / orders.length : 0;

  // Product performance from order line items
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

  const appts = store.appointments;
  const byService = new Map();
  for (const a of appts) {
    const prev = byService.get(a.service_name) || { count: 0, cancelled: 0, no_show: 0 };
    prev.count += 1;
    if (a.status === 'cancelled') prev.cancelled += 1;
    if (a.status === 'no_show') prev.no_show += 1;
    byService.set(a.service_name, prev);
  }

  const shopFunnel = [
    { label: 'Product views', n: countBy(events, 'product_view') },
    { label: 'Add to cart', n: countBy(events, 'add_to_cart') },
    { label: 'Checkout started', n: countBy(events, 'checkout_started') },
    { label: 'Checkout completed', n: countBy(events, 'checkout_completed') }
  ];

  const bookFunnel = [
    { label: 'Booking started', n: countBy(events, 'booking_started') },
    { label: 'Service selected', n: countBy(events, 'booking_service_selected') },
    { label: 'Time selected', n: countBy(events, 'booking_time_selected') },
    { label: 'Confirmed', n: countBy(events, 'booking_confirmed') }
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-graphite">Analytics</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        From site data (Orders, Appointments, DiscountCodes, events) — not static mock UI numbers.
        Visitor traffic source needs a provider (recommended: Vercel Analytics).
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Revenue', value: formatMoney(revenue) },
          { label: 'Orders', value: String(orders.length) },
          { label: 'Avg order value', value: formatMoney(aov) }
        ].map((c) => (
          <div key={c.label} className="glass-1 p-6">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-chrome">
              {c.label}
            </p>
            <p className="mt-2 font-display text-2xl text-graphite">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl text-graphite">Shop funnel</h2>
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
        </section>
        <section>
          <h2 className="font-display text-xl text-graphite">Booking funnel</h2>
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
        </section>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl text-graphite">Product performance</h2>
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
          <h2 className="font-display text-xl text-graphite">By category</h2>
          <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
            {[...byCategory.entries()].map(([cat, v]) => (
              <li key={cat} className="flex justify-between py-3 font-body text-sm font-light">
                <span>{cat}</span>
                <span className="text-charcoal/70">
                  {v.units} u · {formatMoney(v.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-xl text-graphite">Service utilization</h2>
        <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
          {[...byService.entries()].map(([name, v]) => (
            <li key={name} className="flex justify-between py-3 font-body text-sm font-light">
              <span>{name}</span>
              <span className="text-charcoal/70">
                {v.count} booked · {v.cancelled} cancelled · {v.no_show} no-show
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl text-graphite">Discount codes</h2>
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
        </ul>
      </section>
    </div>
  );
}
