'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { signalBagAdded } from '@/components/bag-signal';

// Adds a set of products to the bag in one action.
//
// Uses the same cart context as every other add-to-bag control, so pricing,
// availability and the free-shipping meter stay consistent. Shared by the
// consultation results (add the recommended routine) and favorites (add
// everything saved).
export default function AddAllToBag({ productIds, label = 'Add all to bag', doneLabel = 'Added to bag' }) {
  const { addItem } = useCart();
  const [done, setDone] = useState(false);

  if (!productIds || !productIds.length) return null;

  function addAll() {
    for (const id of productIds) addItem(id, { quantity: 1 });
    signalBagAdded();
    setDone(true);
  }

  return (
    <button
      type="button"
      onClick={addAll}
      className="btn-primary inline-flex min-h-[52px] items-center justify-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
    >
      {done ? doneLabel : label}
    </button>
  );
}
