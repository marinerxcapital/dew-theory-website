import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';
import { formatMoney } from '@/lib/shipping';
import AppointmentStatusForm from '@/components/admin/AppointmentStatusForm';

export default async function AdminAppointmentsPage() {
  await requireAdmin();
  const { appointments } = readStore();

  return (
    <div>
      <h1 className="font-display text-3xl text-graphite">Appointments</h1>
      <p className="mt-2 font-body text-sm font-light text-charcoal/70">
        Booking queue. Google Calendar event IDs appear here once OAuth is connected.
      </p>

      <ul className="mt-10 divide-y divide-chrome/20 border-y border-chrome/20">
        {appointments.map((a) => (
          <li key={a.id} className="grid gap-4 py-6 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
            <div>
              <p className="font-display text-lg text-graphite">{a.service_name}</p>
              <p className="mt-1 font-body text-sm font-light text-charcoal/70">
                {new Date(a.start_time).toLocaleString()} · {a.duration_minutes} min ·{' '}
                {formatMoney(a.price)}
              </p>
              <p className="mt-1 font-body text-xs font-light text-chrome">
                {a.customer?.name} · {a.customer?.email} · {a.customer?.phone}
              </p>
            </div>
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-chrome">
              {a.status}
              {a.calendar_event_id ? ` · cal ${a.calendar_event_id}` : ''}
            </p>
            <AppointmentStatusForm appointmentId={a.id} current={a.status} />
          </li>
        ))}
        {!appointments.length && (
          <li className="py-8 font-body text-sm font-light text-charcoal/50">No appointments yet.</li>
        )}
      </ul>
    </div>
  );
}
