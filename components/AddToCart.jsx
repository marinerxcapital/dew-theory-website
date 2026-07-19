'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { isOutOfStock } from '@/lib/shop';

export default function AddToCart({ product, className = '' }) {
  const { addItem } = useCart();
  const variants = product.variants || [];
  const needsVariant = variants.length > 0;
  // Require explicit choice when variants exist — do not pre-select
  const [variant, setVariant] = useState(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const oos = isOutOfStock(product);
  const discontinued = product.stock_status === 'discontinued' || product.active === false;

  function trackAdd() {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'add_to_cart',
        product_id: product.id,
        variant: needsVariant ? variant : null
      }),
      keepalive: true
    }).catch(() => {});
  }

  function handleAdd() {
    setError('');
    if (oos || discontinued) return;
    if (needsVariant && !variant) {
      setError('Choose a scent to continue');
      return;
    }
    addItem(product.id, { quantity: 1, variant: needsVariant ? variant : null });
    trackAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (discontinued) {
    return (
      <div className={className}>
        <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
          Discontinued
        </p>
        <p className="mt-3 font-body text-sm font-light text-charcoal/70">
          This product is no longer offered. See related items below.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {needsVariant && (
        <fieldset className="mb-6">
          <legend className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
            Scent <span className="text-charcoal/50">— required</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-required="true">
            {variants.map((v) => (
              <label
                key={v}
                className={`cursor-pointer border px-5 py-3 font-label text-[0.68rem] font-light uppercase tracking-lockup transition-colors ${
                  variant === v
                    ? 'border-graphite bg-graphite text-pearl'
                    : 'border-graphite/25 text-charcoal hover:border-graphite/60'
                }`}
              >
                <input
                  type="radio"
                  name={`variant-${product.id}`}
                  value={v}
                  checked={variant === v}
                  onChange={() => {
                    setVariant(v);
                    setError('');
                  }}
                  className="sr-only"
                />
                {v}
              </label>
            ))}
          </div>
          {error && (
            <p className="mt-3 font-body text-xs font-light text-charcoal/70" role="alert">
              {error}
            </p>
          )}
        </fieldset>
      )}

      {oos ? (
        <p className="border border-chrome/30 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-chrome">
          Out of stock
        </p>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={needsVariant && !variant}
          aria-disabled={needsVariant && !variant}
          className="sweep w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {added
            ? 'Added to cart'
            : needsVariant && !variant
              ? 'Select a scent'
              : 'Add to cart'}
        </button>
      )}
    </div>
  );
}
