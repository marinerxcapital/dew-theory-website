'use client';

import { useState } from 'react';

export default function MembershipInterestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/membership/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save interest');
        setStatus('idle');
        return;
      }
      setStatus('done');
      setName('');
      setEmail('');
    } catch {
      setError('Could not save interest');
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <p className="mt-6 font-body text-sm font-light text-charcoal/75" role="status">
        Interest recorded. We will reach out when Emily publishes membership terms — nothing was
        charged.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4">
      <div>
        <label
          htmlFor="mem-name"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Name
        </label>
        <input
          id="mem-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        />
      </div>
      <div>
        <label
          htmlFor="mem-email"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Email
        </label>
        <input
          id="mem-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        />
      </div>
      {error && (
        <p className="font-body text-xs font-light text-charcoal/70" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="sweep btn-primary min-h-[44px] px-8 py-3 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:opacity-60"
      >
        {status === 'loading' ? 'Saving…' : 'Join interest list'}
      </button>
    </form>
  );
}
