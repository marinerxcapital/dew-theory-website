'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Rule from '@/components/Rule';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';

/** Mock availability next 14 days (Mon–Sat). Replace with Google Calendar adapter. */
function buildSlots() {
  const slots = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 1; d <= 14; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (day.getDay() === 0) continue;
    for (const h of [10, 11, 13, 14, 15, 16]) {
      const t = new Date(day);
      t.setHours(h, 0, 0, 0);
      if (t.getTime() > Date.now()) slots.push(t.toISOString());
    }
  }
  return slots;
}

const ALL_SLOTS = buildSlots();

function track(type, payload = {}) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...payload }),
    keepalive: true
  }).catch(() => {});
}

export default function BookingFlow({
  initialServiceId = null,
  invalidServiceQuery = false
}) {
  const validInitial =
    initialServiceId && SERVICES.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : null;

  const [step, setStep] = useState(validInitial ? 2 : 1);
  const [serviceId, setServiceId] = useState(validInitial);
  const [slot, setSlot] = useState(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);
  const [showInvalidNotice, setShowInvalidNotice] = useState(invalidServiceQuery);
  const submitting = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track('booking_started');
  }, []);

  const service = useMemo(
    () => SERVICES.find((s) => s.id === serviceId) || null,
    [serviceId]
  );

  // If step is 2+ but service vanished, reset
  useEffect(() => {
    if (step > 1 && !service) {
      setStep(1);
      setServiceId(null);
      setSlot(null);
    }
  }, [step, service]);

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

  function selectService(id) {
    setServiceId(id);
    setSlot(null);
    setStep(2);
    setShowInvalidNotice(false);
    track('booking_service_selected', { service_id: id });
  }

  function selectSlot(iso) {
    setSlot(iso);
    track('booking_time_selected', { start_time: iso });
  }

  async function confirm(e) {
    e.preventDefault();
    if (submitting.current || status === 'loading' || status === 'done') return;
    if (!serviceId || !slot) {
      setError('Select a service and time');
      setStatus('error');
      return;
    }

    submitting.current = true;
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
        submitting.current = false;
        return;
      }
      setAppointmentId(data.appointment_id);
      setStatus('done');
      // Server also records booking_confirmed; client keeps funnel complete if API path differs
      track('booking_confirmed', { appointment_id: data.appointment_id });
    } catch {
      setError('Could not complete booking');
      setStatus('error');
      submitting.current = false;
    }
  }

  if (status === 'done') {
    return (
      <section
        className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10"
        data-reveal-group="book-done"
      >
        <Rule left="Booked" right="Confirmed" data-reveal />
        <h1
          data-reveal
          className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite"
        >
          You&apos;re on the calendar
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          <strong className="font-normal text-graphite">{service?.name}</strong>
          {slot && (
            <>
              {' '}
              on{' '}
              {new Date(slot).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </>
          )}
          . We have {contact.email} for confirmation. Live calendar sync starts when Google
          credentials are connected.
        </p>
        {appointmentId && (
          <p
            data-reveal
            className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome"
          >
            Ref {appointmentId}
          </p>
        )}
        <div data-reveal className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
          >
            Browse products for after
          </Link>
          <Link
            href="/services"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Treatment menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div data-reveal-group="book-head">
        <Rule left="Book" right={`Step ${step} of 3`} data-reveal />
        <h1
          data-reveal
          className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite"
        >
          Book a facial
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Service, then time, then your details. Availability is a working schedule until Google
          Calendar is connected.
        </p>
      </div>

      {showInvalidNotice && (
        <div
          className="mt-8 border border-chrome/30 bg-pearl/60 p-5"
          role="status"
          data-reveal
        >
          <p className="font-body text-sm font-light text-charcoal/75">
            That service link was not recognized. Choose from the menu below.
          </p>
          <button
            type="button"
            onClick={() => setShowInvalidNotice(false)}
            className="mt-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1 — service */}
      {step === 1 && (
        <ul className="mt-14 grid gap-4 md:grid-cols-2" data-reveal-group="book-svc">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                data-reveal
                onClick={() => selectService(s.id)}
                className="sweep glass-1 flex h-full w-full flex-col p-8 text-left"
              >
                <h2 className="font-display text-xl font-normal text-graphite">{s.name}</h2>
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
            onClick={() => {
              setStep(1);
              setSlot(null);
            }}
            className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
          >
            ← Change service
          </button>
          <p className="mt-4 font-display text-2xl font-normal text-graphite">{service.name}</p>
          <p className="mt-2 font-body text-sm font-light text-charcoal/60">
            {formatDuration(service.duration_minutes)} · {formatServicePrice(service.price)}
          </p>

          {slotsByDay.size === 0 ? (
            <p className="mt-10 font-body text-sm font-light text-charcoal/70">
              No open slots in the next two weeks. Write us on the contact form.
            </p>
          ) : (
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
                          onClick={() => selectSlot(iso)}
                          aria-pressed={active}
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
          )}

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

      {/* Step 3 — contact + deposit placeholder */}
      {step === 3 && service && slot && (
        <form onSubmit={confirm} className="mt-14 max-w-lg space-y-5">
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={status === 'loading'}
            className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal disabled:opacity-40"
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
                disabled={status === 'loading'}
                value={contact[key]}
                onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
                className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
              />
            </div>
          ))}

          {/* Deposit UI — structure only; no invented percentage (OPEN_ITEMS) */}
          <div className="border border-chrome/25 bg-pearl/40 p-5">
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              Deposit &amp; cancellation
            </p>
            <p className="mt-3 font-body text-xs font-light leading-relaxed text-charcoal/70">
              A deposit may apply when Emily publishes the policy. Percentage and cancellation
              cutoff are not set yet — no amount is charged at booking in this build. Terms will
              appear in this panel without inventing numbers.
            </p>
          </div>

          {error && (
            <p className="font-body text-xs font-light text-charcoal/70" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || submitting.current}
            className="sweep w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'Confirming…' : 'Confirm booking'}
          </button>
        </form>
      )}
    </section>
  );
}
