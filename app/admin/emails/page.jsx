import Link from 'next/link';
import { requireAdmin } from '@/lib/require-admin';
import { readStore } from '@/lib/store';

export default async function AdminEmailsPage() {
  await requireAdmin();
  const store = readStore();
  const emails = (store.outbound_emails || []).slice(0, 100);
  const interest = (store.membership_interest || []).slice(0, 50);

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-graphite">Outbound email</h1>
      <p className="mt-2 max-w-2xl font-body text-sm font-light text-charcoal/70">
        Messages recorded when Resend sends (or logs without <code>RESEND_API_KEY</code>). Booking,
        order, consultation, and membership interest share this log.
      </p>

      <h2 className="mt-10 font-display text-xl font-normal text-graphite">Recent messages</h2>
      {emails.length === 0 ? (
        <p className="mt-4 font-body text-sm font-light text-charcoal/60">No outbound email yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left font-body text-sm font-light">
            <thead>
              <tr className="border-b border-chrome/25 font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">To</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2">Tags</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((em) => (
                <tr key={em.id} className="border-b border-chrome/10">
                  <td className="py-2 pr-3 text-charcoal/60">
                    {em.created_at ? new Date(em.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-2 pr-3">
                    {em.status}
                    {em.provider ? ` · ${em.provider}` : ''}
                  </td>
                  <td className="py-2 pr-3">{em.to}</td>
                  <td className="py-2 pr-3">{em.subject}</td>
                  <td className="py-2 text-charcoal/60">
                    {(em.tags || []).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 font-display text-xl font-normal text-graphite">
        Membership interest
      </h2>
      {interest.length === 0 ? (
        <p className="mt-4 font-body text-sm font-light text-charcoal/60">No interest entries yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {interest.map((row) => (
            <li
              key={row.id}
              className="border border-chrome/15 bg-pearl/50 px-4 py-3 font-body text-sm font-light"
            >
              <span className="text-graphite">{row.name}</span>
              <span className="text-charcoal/50"> · </span>
              <span>{row.email}</span>
              <span className="ml-2 text-charcoal/50">
                {row.created_at ? new Date(row.created_at).toLocaleDateString() : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10">
        <Link
          href="/admin/analytics"
          className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
        >
          ← Analytics
        </Link>
      </p>
    </div>
  );
}
