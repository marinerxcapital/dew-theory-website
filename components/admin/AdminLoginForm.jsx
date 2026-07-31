'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { safeAdminNextPath } from '@/lib/admin-auth-policy';

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totp: totp || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.totp_required || data.code === 'totp_required') {
          setNeedTotp(true);
        }
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      const dest = safeAdminNextPath(searchParams.get('next'));
      router.push(dest);
      router.refresh();
    } catch {
      setError('Login failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="admin-email"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        />
      </div>
      <div>
        <label
          htmlFor="admin-password"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        />
      </div>
      {(needTotp || totp) && (
        <div>
          <label
            htmlFor="admin-totp"
            className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            Authenticator code
          </label>
          <input
            id="admin-totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light tracking-[0.2em] text-charcoal"
            placeholder="000000"
          />
          <p className="mt-2 font-body text-xs font-light text-charcoal/55">
            Enter the 6-digit code from your authenticator app (ADMIN_TOTP_SECRET is enabled).
          </p>
        </div>
      )}
      {error && (
        <p className="font-body text-xs font-light text-charcoal/70" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      {process.env.NODE_ENV !== 'production' && (
        <p className="font-body text-xs font-light text-charcoal/50">
          Dev default: admin@dewtheory.local / dew-admin-dev (override with ADMIN_EMAIL /
          ADMIN_PASSWORD). Defaults are rejected in production — set env vars. Optional 2FA:
          ADMIN_TOTP_SECRET (base32).
        </p>
      )}
    </form>
  );
}
