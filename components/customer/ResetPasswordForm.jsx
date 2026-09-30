'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const FIELD =
  'mt-2 w-full border border-border bg-surface px-4 py-3 font-body text-[0.95rem] text-ink focus-visible:outline-none';

/**
 * Completes a password reset from the emailed token.
 *
 * The token is read from the query string, sent to the server, and never stored
 * client-side. On success every prior session is revoked server-side and a fresh
 * one is issued, so the customer lands signed in.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Those passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/customer/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not reset the password');
        return;
      }
      router.push('/account');
      router.refresh();
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md border border-border p-8">
        <p className="font-display text-[1.4rem] text-ink">This link is incomplete.</p>
        <p className="mt-3 font-body text-[0.95rem] leading-[1.7] text-muted">
          Open the reset link from your email, or request a new one.
        </p>
        <Link
          href="/account/login"
          className="btn-ghost mt-6 inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <label className="block">
        <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
          New password
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className={FIELD}
        />
        <span className="mt-2 block font-body text-[0.78rem] text-muted">At least 10 characters.</span>
      </label>

      <label className="mt-6 block">
        <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
          Confirm new password
        </span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={FIELD}
        />
      </label>

      {error ? (
        <p role="alert" className="mt-6 border-l-2 border-promo pl-4 font-body text-[0.9rem] text-promo">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary mt-8 inline-flex min-h-[54px] w-full items-center justify-center px-8 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
      >
        {busy ? 'Saving' : 'Set new password'}
      </button>
    </form>
  );
}
