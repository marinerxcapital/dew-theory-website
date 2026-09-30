'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Signs out by revoking the server-side session and clearing the cookie. */
export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch('/api/customer/logout', { method: 'POST' });
    } catch {
      /* signing out is idempotent */
    }
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="btn-ghost inline-flex min-h-[48px] items-center px-7 py-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
    >
      {busy ? 'Signing out' : 'Sign out'}
    </button>
  );
}
