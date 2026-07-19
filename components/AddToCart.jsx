'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';

export default function AddToCart({ product, className = '' }) {
  const { addItem } = useCart();
  const variants = product.variants || [];
  const [variant, setVariant] = useState(variants[0] || null);
  const [added, setAdded] = useState(false);
  const needsVariant = variants.length > 0;

  function handleAdd() {
    if (needsVariant && !variant) return;
    addItem(product.id, { quantity: 1, variant: needsVariant ? variant : null });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={className}>
      {needsVariant && (
        <fieldset className="mb-6">
          <legend className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
            Scent
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
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
                  onChange={() => setVariant(v)}
                  className="sr-only"
                />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="sweep w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl transition-opacity hover:opacity-90 sm:w-auto"
      >
        {added ? 'Added to cart' : 'Add to cart'}
      </button>
    </div>
  );
}
