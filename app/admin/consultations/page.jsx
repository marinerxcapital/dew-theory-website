import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { listConsultations } from '@/lib/consultations/service.js';
import { nextActionLabel } from '@/lib/consultations/statuses.js';

export default async function AdminConsultationsPage({ searchParams }) {
  await requireAdmin();
  const filter = searchParams?.filter || 'all';
  let items = listConsultations();

  if (filter === 'upcoming') {
    items = items.filter(
      (c) =>
        c.appointment_start &&
        new Date(c.appointment_start) > new Date() &&
        c.status !== 'cancelled' &&
        c.status !== 'refunded'
    );
  } else if (filter === 'intake_missing') {
    items = items.filter(
      (c) =>
        c.payment_status === 'paid' &&
        !c.intake_submitted_at &&
        c.status !== 'cancelled' &&
        c.status !== 'refunded'
    );
  } else if (filter === 'ready_to_review') {
    items = items.filter((c) => c.status === 'intake_submitted');
  } else if (filter === 'plan_due') {
    items = items.filter((c) =>
      ['reviewed', 'consultation_completed', 'plan_draft'].includes(c.status)
    );
  } else if (filter === 'completed') {
    items = items.filter((c) => c.status === 'plan_sent');
  } else if (filter === 'closed') {
    items = items.filter((c) => c.status === 'cancelled' || c.status === 'refunded');
  }

  const filters = [
    ['all', 'All'],
    ['upcoming', 'Upcoming'],
    ['intake_missing', 'Intake missing'],
    ['ready_to_review', 'Ready to review'],
    ['plan_due', 'Plan due'],
    ['completed', 'Completed'],
    ['closed', 'Cancelled / refunded']
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Virtual consultations</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        Paid Zoom consultations, intake, photos, and skincare plans.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter consultations">
        {filters.map(([id, label]) => (
          <Link
            key={id}
            href={id === 'all' ? '/admin/consultations' : `/admin/consultations?filter=${id}`}
            className={`rounded-[2px] px-3 py-2 font-label text-[0.62rem] font-light uppercase tracking-lockup ${
              filter === id
                ? 'border border-graphite/30 bg-pearl text-graphite'
                : 'border border-transparent text-chrome hover:text-charcoal'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <ul className="mt-8 divide-y divide-chrome/20 border-y border-chrome/20">
        {items.map((c) => (
          <li key={c.id} className="grid gap-3 py-5 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
            <div>
              <Link
                href={`/admin/consultations/${c.id}`}
                className="font-display text-lg font-normal text-graphite hover:underline"
              >
                {c.client_name || 'Unnamed'} · {c.public_ref}
              </Link>
              <p className="mt-1 font-body text-xs font-light text-charcoal/65">
                {c.client_email}
                {c.appointment_start
                  ? ` · ${new Date(c.appointment_start).toLocaleString()}`
                  : ' · Not scheduled'}
              </p>
            </div>
            <div>
              <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                {c.payment_status} · {c.status}
              </p>
              <p className="mt-1 font-body text-xs font-light text-charcoal/60">
                Next: {nextActionLabel(c)}
              </p>
            </div>
            <Link
              href={`/admin/consultations/${c.id}`}
              className="font-label text-[0.64rem] font-light uppercase tracking-lockup text-charcoal"
            >
              Open →
            </Link>
          </li>
        ))}
        {!items.length && (
          <li className="py-8 font-body text-sm font-light text-charcoal/50">
            No consultations in this filter.
          </li>
        )}
      </ul>
    </div>
  );
}
