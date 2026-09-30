'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MODES = [
  { id: 'signin', label: 'Sign in' },
  { id: 'register', label: 'Create account' },
  { id: 'recover', label: 'Reset password' }
];

const FIELD =
  'mt-2 w-full border border-border bg-surface px-4 py-3 font-body text-[0.95rem] text-ink placeholder:text-muted focus-visible:outline-none';

const SEG_ON = 'min-h-[48px] flex-1 px-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup transition-colors bg-green-300 text-ink';
const SEG_OFF = 'min-h-[48px] flex-1 px-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup transition-colors bg-transparent text-ink hover:bg-surface';

/**
 * Account authentication UI: sign in, create account, request a reset.
 *
 * All three post to the customer API routes; the browser never sees a session
 * token, only an httpOnly cookie. Server-side validation is authoritative — the
 * client-side checks here exist to fail fast, not to enforce policy.
 */
export default function AccountAuthForms() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';

  const [mode, setMode] = useState('signin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (mode === 'register' && form.password !== form.confirm) {
      setError('Those passwords do not match');
      return;
    }

    setBusy(true);
    try {
      let endpoint = '/api/customer/login';
      if (mode === 'register') endpoint = '/api/customer/register';
      if (mode === 'recover') endpoint = '/api/customer/recover';

      let payload = { email: form.email, password: form.password };
      if (mode === 'register') {
        payload = { name: form.name, email: form.email, password: form.password };
      }
      if (mode === 'recover') {
        payload = { email: form.email };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
        return;
      }

      if (mode === 'recover') {
        setNotice(data.message || 'If that email has an account, a reset link is on its way.');
        return;
      }

      router.push(next.startsWith('/') ? next : '/account');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  let submitLabel = 'Sign in';
  if (mode === 'register') submitLabel = 'Create account';
  if (mode === 'recover') submitLabel = 'Send reset link';

  return (
    <div className="max-w-md">
      <div role="group" aria-label="Account action" className="flex border border-border">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => switchMode(m.id)}
            aria-pressed={mode === m.id}
            className={mode === m.id ? SEG_ON : SEG_OFF}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="mt-8">
        {mode === 'register' ? (
          <label className="block">
            <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
              Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
              className={FIELD}
            />
          </label>
        ) : null}

        <label className="mt-6 block">
          <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
            Email
          </span>
          <input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            className={FIELD}
          />
        </label>

        {mode !== 'recover' ? (
          <label className="mt-6 block">
            <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
              Password
            </span>
            <input
              type="password"
              required
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className={FIELD}
            />
            {mode === 'register' ? (
              <span className="mt-2 block font-body text-[0.78rem] text-muted">
                At least 10 characters.
              </span>
            ) : null}
          </label>
        ) : null}

        {mode === 'register' ? (
          <label className="mt-6 block">
            <span className="font-body text-[0.68rem] font-medium uppercase tracking-eyebrow text-muted">
              Confirm password
            </span>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              className={FIELD}
            />
          </label>
        ) : null}

        {error ? (
          <p role="alert" className="mt-6 border-l-2 border-promo pl-4 font-body text-[0.9rem] text-promo">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p role="status" className="mt-6 border-l-2 border-ink pl-4 font-body text-[0.9rem] text-ink">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-8 inline-flex min-h-[54px] w-full items-center justify-center px-8 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
        >
          {busy ? 'Working' : submitLabel}
        </button>
      </form>

      <p className="mt-8 font-body text-[0.85rem] leading-[1.7] text-muted">
        Prefer not to hold an account?{' '}
        <Link href="/shop" className="underline decoration-border underline-offset-4 hover:decoration-ink">
          Shop the collection
        </Link>{' '}
        or{' '}
        <Link
          href="/virtual-consultation"
          className="underline decoration-border underline-offset-4 hover:decoration-ink"
        >
          book a consultation
        </Link>{' '}
        — neither requires one.
      </p>
    </div>
  );
}
