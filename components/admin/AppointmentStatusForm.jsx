'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

/** Mirrors lib/appointment-status APPOINTMENT_TRANSITIONS for client bundle */
const TRANSITIONS = {
  confirmed: ['completed', 'cancelled', 'no_show'],
  pending: ['confirmed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: []
};

function optionsFor(current) {
  const next = TRANSITIONS[current] || [];
  return [current, ...next.filter((s) => s !== current)];
}

export default function AppointmentStatusForm({ appointmentId, current }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const options = useMemo(() => optionsFor(current), [current]);
  const terminal = (TRANSITIONS[current] || []).length === 0;

  async function save() {
    if (status === current) {
      setMsg('No change');
      return;
    }
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || 'Update failed');
      setStatus(current);
      return;
    }
    setMsg('Saved');
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={terminal}
        className="border border-chrome/30 bg-pearl/90 px-2 py-2 font-body text-xs font-light disabled:opacity-60"
        aria-label="Appointment status"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={loading || terminal || status === current}
        className="border border-graphite/25 px-3 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-50"
      >
        {loading ? '…' : terminal ? 'Final' : 'Save'}
      </button>
      {msg && (
        <p className="w-full font-body text-[0.65rem] font-light text-charcoal/60" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
