'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Rule from '@/components/Rule';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';
import {
  MockAvailabilityAdapter,
  groupSlotsByDay
} from '@/lib/availability';
import { getBookingLegalDocuments } from '@/lib/legal-documents';
import LegalDocLinks from '@/components/LegalDocLinks';

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
  const [errorCode, setErrorCode] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);
  const [showInvalidNotice, setShowInvalidNotice] = useState(invalidServiceQuery);
  const [openSlots, setOpenSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsLoadFailed, setSlotsLoadFailed] = useState(false);
  const [slotSource, setSlotSource] = useState('mock');
  const [slotsRetryKey, setSlotsRetryKey] = useState(0);
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

  // Load bookable slots via availability adapter (API filters booked; client falls back to mock)
  useEffect(() => {
    if (step !== 2 || !serviceId) return undefined;
    let cancelled = false;
    setSlotsLoading(true);
    setOpenSlots([]);
    setSlotsLoadFailed(false);
    setSlot(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/availability?service_id=${encodeURIComponent(serviceId)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && Array.isArray(data.slots)) {
          setOpenSlots(data.slots);
          setSlotSource(data.source || 'mock');
          setSlotsLoadFailed(false);
          return;
        }
        throw new Error(data.error || 'availability failed');
      } catch {
        if (cancelled) return;
        try {
          const adapter = new MockAvailabilityAdapter();
          const slots = await adapter.listOpenSlots({ serviceId });
          if (!cancelled) {
            setOpenSlots(slots);
            setSlotSource(adapter.getSource());
            // Soft fallback — times still shown from local adapter
            setSlotsLoadFailed(false);
          }
        } catch {
          if (!cancelled) {
            setOpenSlots([]);
            setSlotSource('unavailable');
            setSlotsLoadFailed(true);
          }
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, serviceId, slotsRetryKey]);

  const slotsByDay = useMemo(() => groupSlotsByDay(openSlots), [openSlots]);

  function selectService(id) {
    setServiceId(id);
    setSlot(null);
    setStep(2);
    setShowInvalidNotice(false);
    setError('');
    setErrorCode('');
    setStatus('idle');
    track('booking_service_selected', { service_id: id });
  }

  function selectSlot(iso) {
    setSlot(iso);
    track('booking_time_selected', { start_time: iso });
  }

  function retrySlots() {
    setSlotsRetryKey((k) => k + 1);
  }

  async function confirm(e) {
    e.preventDefault();
    if (submitting.current || status === 'loading' || status === 'done') return;
    if (!serviceId || !slot) {
      setError('Select a service and time');
      setErrorCode('selection_incomplete');
      setStatus('error');
      return;
    }

    submitting.current = true;
    setStatus('loading');
    setError('');
    setErrorCode('');

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data.code || '';
        let message = data.error || 'Booking failed';
        if (code === 'slot_taken' || res.status === 409) {
          message =
            data.error ||
            'That time was just taken. Go back and pick another open slot.';
        } else if (code === 'slot_in_past') {
          message = data.error || 'That time has passed. Choose a future slot.';
        }
        setError(message);
        setErrorCode(code || String(res.status));
        setStatus('error');
        submitting.current = false;
        return;
      }
      setAppointmentId(data.appointment_id);
      setStatus('done');
      // Server also records booking_confirmed; client keeps funnel complete if API path differs
      track('booking_confirmed', { appointment_id: data.appointment_id });
    } catch {
      setError('Could not complete booking — check your connection and try again.');
      setErrorCode('network');
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
          . A confirmation is queued for {contact.email}
          {slotSource === 'google_calendar' ? ' · live calendar availability' : ''}.
        </p>
        {appointmentId && (
          <p
            data-reveal
            className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome"
          >
            Ref {appointmentId}
          </p>
        )}
        <ol
          data-reveal
          className="mt-8 max-w-lg space-y-3 border border-chrome/20 bg-pearl/40 p-5"
        >
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Prep · 1
            </span>
            <span className="mt-1 block">
              Arrive with a clean face when possible — skip heavy makeup the morning of.
            </span>
          </li>
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Prep · 2
            </span>
            <span className="mt-1 block">
              Note any new actives, prescriptions, or reactions since your last visit so Emily can
              adjust the plan.
            </span>
          </li>
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Prep · 3
            </span>
            <span className="mt-1 block">
              Need to change the time? Contact the studio with ref {appointmentId || 'your booking'}.
              Deposit / cancellation windows appear when Emily confirms them.
            </span>
          </li>
        </ol>
        <div data-reveal className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
          >
            Start a home routine
          </Link>
          <Link
            href="/services"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Treatment menu
          </Link>
          <Link
            href="/contact"
            className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
          >
            Contact studio
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
          Service, then time, then your details. Times come from the availability adapter
          (mock schedule until Google Calendar credentials are connected).
        </p>
      </div>

      {showInvalidNotice && (
        <div
          className="mt-8 border border-chrome/30 bg-pearl/60 p-5"
          role="status"
          data-reveal
        >
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
            Link not recognized
          </p>
          <p className="mt-2 font-body text-sm font-light text-charcoal/75">
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

          {slotsLoading ? (
            <div
              className="mt-10 border border-chrome/20 bg-pearl/40 p-6"
              aria-busy="true"
              aria-live="polite"
            >
              <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                Availability
              </p>
              <p className="mt-2 font-body text-sm font-light text-charcoal/70">
                Loading open times…
              </p>
            </div>
          ) : slotsLoadFailed ? (
            <div className="mt-10 border border-chrome/30 bg-pearl/60 p-6" role="alert">
              <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                Times unavailable
              </p>
              <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/75">
                We couldn&apos;t load open slots right now. Retry, or write us on the contact form
                with your preferred times.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={retrySlots}
                  className="sweep border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
                >
                  Retry times
                </button>
                <Link
                  href="/contact"
                  className="sweep border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
                >
                  Contact studio
                </Link>
              </div>
            </div>
          ) : slotsByDay.size === 0 ? (
            <div className="mt-10 border border-chrome/20 bg-pearl/40 p-6" role="status">
              <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                No open slots
              </p>
              <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/75">
                Nothing open in the next two weeks for this service. Try another treatment, or
                message the studio with dates that work for you.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSlot(null);
                  }}
                  className="sweep border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
                >
                  Other services
                </button>
                <Link
                  href="/contact"
                  className="sweep border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
                >
                  Contact form
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                  Source · {slotSource}
                </p>
                <p className="font-body text-xs font-light text-charcoal/55">
                  Double-book guarded at confirm — taken slots are rejected even if still shown.
                </p>
              </div>
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
                          className={`min-h-[44px] border px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup transition-colors ${
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
            disabled={!slot || slotsLoading || slotsLoadFailed}
            onClick={() => setStep(3)}
            className="sweep mt-12 min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-40"
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
            onClick={() => {
              setStep(2);
              setError('');
              setErrorCode('');
              setStatus('idle');
            }}
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
              cutoff are not set yet — no amount is charged at booking in this build. Review the
              booking and aesthetic policies below before confirming.
            </p>
            <LegalDocLinks
              dense
              className="mt-4"
              documents={getBookingLegalDocuments()}
            />
          </div>

          <p className="font-body text-xs font-light leading-relaxed text-charcoal/55">
            Slot uniqueness is checked when you confirm (double-book guarded in store). Google
            Calendar live sync is separate and only active once credentials are connected.
          </p>

          {error && (
            <div className="border border-chrome/30 bg-pearl/70 p-4" role="alert">
              <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                Booking issue
                {errorCode ? ` · ${errorCode}` : ''}
              </p>
              <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/80">
                {error}
              </p>
              {(errorCode === 'slot_taken' || errorCode === '409') && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                    setErrorCode('');
                    setStatus('idle');
                    setSlot(null);
                    retrySlots();
                  }}
                  className="mt-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
                >
                  Pick another time →
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || submitting.current}
            className="sweep w-full min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'Confirming…' : 'Confirm booking'}
          </button>
        </form>
      )}
    </section>
  );
}
