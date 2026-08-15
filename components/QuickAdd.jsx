'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { isOutOfStock } from '@/lib/shop';

/**
 * Compact add-to-bag control for product cards / rails.
 * Products that require a variant choice deep-link to the PDP instead.
 */
export default function QuickAdd({ product, className = '' }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState('');
  const oos = isOutOfStock(product);
  const discontinued = product?.stock_status === 'discontinued' || product?.active === false;
  const needsVariant = Array.isArray(product?.variants) && product.variants.length > 0;

  if (!product || discontinued) return null;

  if (needsVariant) {
    return (
      <div className={className}>
        <Link
          href={`/shop/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-ghost inline-flex w-full items-center justify-center px-3 py-2.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
        >
          Choose options
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={oos}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (oos) return;
          addItem(product.id, { quantity: 1 });
          setStatus('Added');
          window.setTimeout(() => setStatus(''), 1600);
        }}
        className="btn-primary w-full px-3 py-2.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup disabled:cursor-not-allowed disabled:opacity-45"
      >
        {oos ? 'Out of stock' : status || 'Add to Bag'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status ? `${product.name} added to bag` : ''}
      </span>
    </div>
  );
}
