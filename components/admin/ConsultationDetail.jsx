'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CONSULTATION_STATUSES, PHOTO_SLOT_LABELS } from '@/lib/consultations/statuses.js';

export default function ConsultationDetail({ consultation: initial, catalog = [] }) {
  const router = useRouter();
  const [c, setC] = useState(initial);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(initial.status);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState({
    overview: initial.plan?.overview || '',
    morning_routine: initial.plan?.morning_routine || '',
    evening_routine: initial.plan?.evening_routine || '',
    weekly_schedule: initial.plan?.weekly_schedule || '',
    layering_instructions: initial.plan?.layering_instructions || '',
    expectations: initial.plan?.expectations || '',
    maintenance_plan: initial.plan?.maintenance_plan || '',
    additional_notes: initial.plan?.additional_notes || '',
    products: initial.plan?.products?.length
      ? initial.plan.products
      : [{ product_id: '', display_name: '', usage_instructions: '', routine_phase: 'morning', note: '' }]
  });

  const intake = c.intake;
  const photos = c.photos || [];

  async function patch(body) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/consultations/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || 'Request failed');
        setBusy(false);
        return;
      }
      if (data.consultation) setC(data.consultation);
      setMessage('Saved');
      router.refresh();
    } catch {
      setMessage('Network error');
    }
    setBusy(false);
  }

  const productOptions = useMemo(
    () => catalog.map((p) => ({ id: p.id, label: `${p.name} (${p.id})` })),
    [catalog]
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="font-label text-[0.62rem] uppercase tracking-lockup text-chrome">
          {c.public_ref} · {c.payment_status}
        </p>
        <h1 className="mt-2 font-display text-3xl font-normal text-graphite">
          {c.client_name || 'Client'}
        </h1>
        <p className="mt-2 font-body text-sm font-light text-charcoal/70">
          {c.client_email}
          {c.appointment_start
            ? ` · Appt ${new Date(c.appointment_start).toLocaleString()}`
            : ' · Scheduling pending'}
        </p>
        <p className="mt-1 font-label text-[0.62rem] uppercase tracking-lockup text-chrome">
          Status: {c.status}
        </p>
      </header>

      <section className="glass-1 space-y-4 rounded-[3px] p-6">
        <h2 className="font-display text-xl text-graphite">Status</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Update status
            </span>
            <select
              className="mt-1 block border border-chrome/30 bg-pearl px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {CONSULTATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ action: 'status', status })}
            className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup text-pearl"
          >
            Save status
          </button>
        </div>
        <div>
          <label className="block">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Internal note (never sent to client)
            </span>
            <textarea
              className="mt-1 w-full border border-chrome/30 bg-pearl px-3 py-2 text-sm"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={busy || !note.trim()}
            onClick={() => {
              patch({ action: 'note', text: note });
              setNote('');
            }}
            className="mt-2 border border-chrome/40 px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
          >
            Add note
          </button>
        </div>
        {Array.isArray(c.internal_notes) && c.internal_notes.length > 0 ? (
          <ul className="space-y-2 border-t border-chrome/15 pt-4">
            {c.internal_notes.map((n) => (
              <li key={n.id} className="font-body text-xs font-light text-charcoal/70">
                <span className="text-chrome">{new Date(n.created_at).toLocaleString()}</span> — {n.text}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="glass-1 rounded-[3px] p-6">
        <h2 className="font-display text-xl text-graphite">Intake</h2>
        {!intake ? (
          <p className="mt-3 font-body text-sm font-light text-charcoal/60">Not submitted yet.</p>
        ) : (
          <dl className="mt-4 space-y-3 font-body text-sm font-light text-charcoal/80">
            {[
              ['Age', intake.age],
              ['Concerns', intake.skin_concerns],
              ['Goals', intake.skin_goals],
              ['Skin type', intake.skin_type],
              ['Sensitivities', intake.sensitivities],
              ['Allergies', intake.allergies],
              ['Morning', intake.morning_routine],
              ['Night', intake.night_routine],
              ['Rx skincare', intake.prescription_skincare],
              ['Medications', intake.medications],
              ['Supplements', intake.supplements],
              ['Conditions', intake.medical_conditions],
              ['Pregnancy', intake.pregnancy_status],
              ['Budget', intake.preferences?.budget],
              ['Questions', intake.preferences?.questions_for_emily]
            ].map(([k, v]) =>
              v ? (
                <div key={k}>
                  <dt className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">{k}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{String(v)}</dd>
                </div>
              ) : null
            )}
          </dl>
        )}
      </section>

      <section className="glass-1 rounded-[3px] p-6">
        <h2 className="font-display text-xl text-graphite">Photos</h2>
        {photos.length === 0 ? (
          <p className="mt-3 font-body text-sm font-light text-charcoal/60">No photos uploaded.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id}>
                <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                  {PHOTO_SLOT_LABELS[p.slot] || p.slot}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/consultations/photos/${p.id}`}
                  alt={PHOTO_SLOT_LABELS[p.slot] || p.slot}
                  className="mt-2 aspect-square w-full rounded-[2px] object-cover"
                />
                <p className="mt-1 font-body text-[0.65rem] text-charcoal/50">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-1 space-y-4 rounded-[3px] p-6">
        <h2 className="font-display text-xl text-graphite">Skincare plan</h2>
        {[
          ['overview', 'Overview / summary'],
          ['morning_routine', 'Morning routine'],
          ['evening_routine', 'Evening routine'],
          ['weekly_schedule', 'Weekly schedule'],
          ['layering_instructions', 'Layering instructions'],
          ['expectations', 'Expectations / timeline'],
          ['maintenance_plan', 'Maintenance plan'],
          ['additional_notes', 'Additional notes']
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              {label}
            </span>
            <textarea
              className="mt-1 w-full border border-chrome/30 bg-pearl px-3 py-2 text-sm"
              rows={key.includes('routine') || key === 'overview' ? 4 : 2}
              value={plan[key]}
              onChange={(e) => setPlan((p) => ({ ...p, [key]: e.target.value }))}
            />
          </label>
        ))}

        <div>
          <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
            Product recommendations
          </p>
          {plan.products.map((prod, i) => (
            <div key={i} className="mt-3 grid gap-2 border-t border-chrome/10 pt-3 sm:grid-cols-2">
              <select
                className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
                value={prod.product_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const match = catalog.find((x) => x.id === id);
                  const products = [...plan.products];
                  products[i] = {
                    ...products[i],
                    product_id: id,
                    display_name: match?.name || products[i].display_name,
                    product_url: id ? `/shop/${id}` : ''
                  };
                  setPlan((p) => ({ ...p, products }));
                }}
              >
                <option value="">Select product…</option>
                {productOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Usage instructions"
                className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
                value={prod.usage_instructions}
                onChange={(e) => {
                  const products = [...plan.products];
                  products[i] = { ...products[i], usage_instructions: e.target.value };
                  setPlan((p) => ({ ...p, products }));
                }}
              />
              <select
                className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
                value={prod.routine_phase}
                onChange={(e) => {
                  const products = [...plan.products];
                  products[i] = { ...products[i], routine_phase: e.target.value };
                  setPlan((p) => ({ ...p, products }));
                }}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As needed</option>
              </select>
              <input
                placeholder="Note"
                className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
                value={prod.note}
                onChange={(e) => {
                  const products = [...plan.products];
                  products[i] = { ...products[i], note: e.target.value };
                  setPlan((p) => ({ ...p, products }));
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="mt-3 font-label text-[0.62rem] uppercase tracking-lockup text-charcoal/70"
            onClick={() =>
              setPlan((p) => ({
                ...p,
                products: [
                  ...p.products,
                  {
                    product_id: '',
                    display_name: '',
                    usage_instructions: '',
                    routine_phase: 'morning',
                    note: ''
                  }
                ]
              }))
            }
          >
            + Add product
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ action: 'save_plan', plan })}
            className="border border-chrome/40 px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ action: 'publish_plan', plan, publish: true })}
            className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup text-pearl"
          >
            Publish & email plan
          </button>
        </div>
      </section>

      {message ? (
        <p className="font-body text-sm text-charcoal/70" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
