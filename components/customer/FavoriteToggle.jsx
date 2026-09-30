'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconHeart } from '@/components/Icons';

// Save / unsave a product.
//
// `initiallySaved` is only passed where the server already knows the answer
// (the product page for a signed-in customer, and the favorites page). Where the
// answer is unknown the control starts unlit rather than guessing, and the
// authoritative value comes back from the API on the first interaction.
//
// Signed-out visitors are sent to sign in instead of being told the save worked.
export default function FavoriteToggle({
  productId,
  initiallySaved = false,
  withLabel = true
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(Boolean(initiallySaved));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError('');
    const next = !saved;
    try {
      const res = await fetch('/api/customer/favorites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.status === 401) {
        router.push('/account/login?next=' + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not save that');
        return;
      }
      setSaved(next);
      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
        className="inline-flex min-h-[44px] items-center gap-2 border border-border px-4 font-body text-[0.66rem] font-medium uppercase tracking-lockup text-ink transition-colors hover:border-ink disabled:cursor-not-allowed"
      >
        <IconHeart filled={saved} className="h-4 w-4" />
        {withLabel ? <span>{saved ? 'Saved' : 'Save'}</span> : null}
      </button>
      {error ? (
        <span role="alert" className="font-body text-[0.8rem] text-promo">
          {error}
        </span>
      ) : null}
    </span>
  );
}
