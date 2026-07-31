'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';

/**
 * One-tap add of a curated kit (real catalog product IDs only).
 */
export default function AddRoutineKit({ productIds = [], label = 'Add kit to bag' }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState('idle');

  function onAdd() {
    if (!productIds.length) return;
    setStatus('adding');
    for (const id of productIds) {
      addItem(id, { quantity: 1 });
    }
    setStatus('done');
    setTimeout(() => setStatus('idle'), 2200);
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={status === 'adding' || !productIds.length}
      className="sweep btn-primary mt-6 w-full min-h-[44px] px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup disabled:opacity-60 sm:w-auto"
    >
      {status === 'done' ? 'Added to bag' : status === 'adding' ? 'Adding…' : label}
    </button>
  );
}
