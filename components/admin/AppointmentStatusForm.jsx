'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = ['confirmed', 'completed', 'cancelled', 'no_show'];

export default function AppointmentStatusForm({ appointmentId, current }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-chrome/30 bg-white/70 px-2 py-2 font-body text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="border border-graphite/25 px-3 py-2 font-label text-[0.6rem] uppercase tracking-lockup text-charcoal"
      >
        Save
      </button>
    </div>
  );
}
