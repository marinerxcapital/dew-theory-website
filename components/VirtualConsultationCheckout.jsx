'use client';

import { useState } from 'react';

export default function VirtualConsultationCheckout() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
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
        setError(data.error || 'Unable to start checkout');
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError('Checkout URL missing');
      setLoading(false);
    } catch {
      setError('Network error — try again');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-1 mx-auto max-w-lg rounded-[3px] p-7 sm:p-9"
      aria-labelledby="vc-book-heading"
    >
      <h2
        id="vc-book-heading"
        className="font-display text-2xl font-normal text-graphite sm:text-[1.75rem]"
      >
        Book your consultation
      </h2>
      <p className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/70">
        Secure payment via Stripe. After checkout you&apos;ll schedule Zoom and complete a private
        intake with photos.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="vc-name" className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Full name
          </label>
          <input
            id="vc-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40"
          />
        </div>
        <div>
          <label htmlFor="vc-email" className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
            Email
          </label>
          <input
            id="vc-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
            required
          />
          <span className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            I understand this is aesthetic skincare guidance (not medical diagnosis), and I agree to
            the consultation terms and privacy practices for intake and photos.
          </span>
        </label>
      </div>

      {error ? (
        <p className="mt-5 font-body text-sm font-light text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="sweep btn-primary mt-8 w-full min-h-[44px] px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:opacity-60"
      >
        {loading ? 'Starting checkout…' : 'Book your consultation'}
      </button>
    </form>
  );
}
