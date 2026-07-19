'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Rule from '@/components/Rule';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';

/** Generate mock availability slots for the next 14 days (Mon–Sat). Replace with Google Calendar. */
function buildSlots() {
  const slots = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 1; d <= 14; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    const dow = day.getDay();
    if (dow === 0) continue; // closed Sundays — placeholder policy
    const hours = [10, 11, 13, 14, 15, 16];
    for (const h of hours) {
      const t = new Date(day);
      t.setHours(h, 0, 0, 0);
      slots.push(t.toISOString());
    }
  }
  return slots;
}

const ALL_SLOTS = buildSlots();

export default function BookingFlow({ initialServiceId = null }) {
  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [slot, setSlot] = useState(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);

  const service = useMemo(
    () => SERVICES.find((s) => s.id === serviceId) || null,
    [serviceId]
  );

  const slotsByDay = useMemo(() => {
    const map = new Map();
    for (const iso of ALL_SLOTS) {
      const d = new Date(iso);
      const key = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(iso);
    }
    return map;
  }, []);

  async function confirm(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          start_time: slot,
          customer: contact
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking failed');
        setStatus('error');
        return;
      }
      setAppointmentId(data.appointment_id);
      setStatus('done');
    } catch {
      setError('Could not complete booking');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <section className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10">
        <Rule left="Booked" right="Confirmed" />
        <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] text-graphite">
          You&apos;re on the calendar
        </h1>
        <p className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75">
          {service?.name} on{' '}
          {slot &&
            new Date(slot).toLocaleString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          . A confirmation email is prepared for {contact.email}. Google Calendar sync activates once
          OAuth credentials are connected.
        </p>
        {appointmentId && (
          <p className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
            Ref {appointmentId}
          </p>
        )}
        <Link
          href="/shop"
          className="sweep mt-10 inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Browse products for after
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <Rule left="Book" right={`Step ${step} of 3`} />
      <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] text-graphite">
        Book a facial
      </h1>
      <p className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75">
        Select a service, choose a time, and leave your details. Live availability will mirror
        Emily&apos;s Google Calendar once credentials are set.
      </p>

      {/* Step 1 — service */}
      {step === 1 && (
        <ul className="mt-14 grid gap-4 md:grid-cols-2" data-reveal-group="book-svc">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                data-reveal
                onClick={() => {
                  setServiceId(s.id);
                  setStep(2);
                }}
                className="sweep glass-1 flex h-full w-full flex-col p-8 text-left transition-transform hover:-translate-y-1"
              >
                <h2 className="font-display text-xl text-graphite">{s.name}</h2>
                <Rule
                  left={formatDuration(s.duration_minutes)}
                  right={formatServicePrice(s.price)}
                  className="mt-4"
                />
                <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/70">
                  {s.note}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Step 2 — time */}
      {step === 2 && service && (
        <div className="mt-14">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
          >
            ← Change service
          </button>
          <p className="mt-4 font-display text-2xl text-graphite">{service.name}</p>
          <div className="mt-10 space-y-10">
            {[...slotsByDay.entries()].map(([day, times]) => (
              <div key={day}>
                <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                  {day}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {times.map((iso) => {
                    const label = new Date(iso).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    });
                    const active = slot === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSlot(iso)}
                        className={`border px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup transition-colors ${
                          active
                            ? 'border-graphite bg-graphite text-pearl'
                            : 'border-graphite/25 text-charcoal hover:border-graphite/60'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={!slot}
            onClick={() => setStep(3)}
            className="sweep mt-12 border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3 — contact */}
      {step === 3 && service && slot && (
        <form onSubmit={confirm} className="mt-14 max-w-lg space-y-5">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
          >
            ← Change time
          </button>
          <p className="font-body text-sm font-light text-charcoal/75">
            {service.name} ·{' '}
            {new Date(slot).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}{' '}
            · {formatServicePrice(service.price)}
          </p>

          {[
            ['name', 'Full name', 'text', true],
            ['email', 'Email', 'email', true],
            ['phone', 'Phone', 'tel', true],
            ['notes', 'Anything Emily should know (optional)', 'text', false]
          ].map(([key, label, type, required]) => (
            <div key={key}>
              <label
                htmlFor={`book-${key}`}
                className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
              >
                {label}
              </label>
              <input
                id={`book-${key}`}
                type={type}
                required={required}
                value={contact[key]}
                onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
                className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
              />
            </div>
          ))}

          {error && (
            <p className="font-body text-xs font-light text-charcoal/70" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="sweep w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'Confirming…' : 'Confirm booking'}
          </button>
          <p className="font-body text-xs font-light leading-relaxed text-charcoal/50">
            Deposit policy and cancellation window will appear here once confirmed. See OPEN_ITEMS.
          </p>
        </form>
      )}
    </section>
  );
}
