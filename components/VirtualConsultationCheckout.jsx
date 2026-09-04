'use client';

import { useState } from 'react';
import LegalDocLinks from '@/components/LegalDocLinks';
import { getVirtualConsultationLegalDocuments } from '@/lib/legal-documents';

export default function VirtualConsultationCheckout() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const legalDocs = getVirtualConsultationLegalDocuments();
  const canSubmit =
    !loading && name.trim().length > 0 && email.trim().length > 0 && consent;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/consultations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, consent })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Unable to start checkout — try again in a moment');
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError('Checkout URL missing — payment path is not fully configured yet');
      setLoading(false);
    } catch {
      setError('Network error — check your connection and try again');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-1 mx-auto max-w-lg rounded-[3px] p-7 sm:p-9"
      aria-labelledby="vc-book-heading"
      aria-busy={loading}
    >
      <h2
        id="vc-book-heading"
        className="font-display text-2xl font-normal text-graphite sm:text-[1.75rem]"
      >
        Book your consultation
      </h2>
      <p className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/70">
        After checkout you&apos;ll schedule Zoom and complete a private intake with photos.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="vc-name"
            className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            Full name
          </label>
          <input
            id="vc-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="vc-email"
            className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            Email
          </label>
          <input
            id="vc-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="border border-chrome/20 bg-pearl/40 px-4 py-4">
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
            Review before you agree
          </p>
          <LegalDocLinks dense className="mt-3" documents={legalDocs} />
          <p className="mt-3 font-body text-[0.7rem] font-light leading-relaxed text-charcoal/60">
            Photo &amp; intake authorization covers clinical consultation use only — it is not a
            marketing or publicity release.
          </p>
        </div>

        <label
          className={`flex items-start gap-3 ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            checked={consent}
            disabled={loading}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
            required
          />
          <span className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            I understand this is aesthetic skincare guidance (not medical diagnosis), and I agree to
            the consultation terms and privacy practices for intake and photos linked above.
          </span>
        </label>
      </div>

      {/* Trust notes — private photos + payment path; no invented price */}
      <ul className="mt-6 space-y-2.5 border border-chrome/20 bg-pearl/40 px-4 py-4">
        <li className="font-body text-[0.7rem] font-light leading-relaxed text-charcoal/65">
          <span className="font-label text-[0.55rem] uppercase tracking-lockup text-chrome">
            Private photos
          </span>
          <span className="mt-0.5 block">
            Intake photos stay on a private token path for Emily&apos;s review — not public product
            galleries.
          </span>
        </li>
        <li className="font-body text-[0.7rem] font-light leading-relaxed text-charcoal/65">
          <span className="font-label text-[0.55rem] uppercase tracking-lockup text-chrome">
            Secure payment
          </span>
          <span className="mt-0.5 block">
            When Stripe is configured, checkout runs on Stripe&apos;s hosted page (no card fields on
            this form). Local/dev without Stripe may use a clearly labeled mock checkout — never a
            silent live charge. Production without keys returns an error instead of charging.
          </span>
        </li>
      </ul>

      {error ? (
        <div className="mt-5 border border-chrome/30 bg-pearl/70 p-4" role="alert">
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
            Checkout issue
          </p>
          <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/80">
            {error}
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="sweep btn-primary mt-8 w-full min-h-[48px] px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Starting checkout…' : 'Book your consultation'}
      </button>

      {loading && (
        <p className="mt-3 text-center font-body text-xs font-light text-charcoal/55" aria-live="polite">
          Redirecting to payment — keep this tab open.
        </p>
      )}
    </form>
  );
}
