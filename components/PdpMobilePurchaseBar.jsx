'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock } from '@/lib/shop';

/**
 * Mobile sticky purchase bar — appears after scroll; respects safe-area insets.
 * Does not change checkout/Stripe behavior; only calls the same cart addItem path.
 */
export default function PdpMobilePurchaseBar({ product }) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('');
  const oos = isOutOfStock(product);
  const discontinued = product?.stock_status === 'discontinued' || product?.active === false;
  const needsVariant = Array.isArray(product?.variants) && product.variants.length > 0;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!product || discontinued || !visible) return null;

  function handleAdd() {
    if (oos || needsVariant) return;
    addItem(product.id, { quantity: 1 });
    setStatus('Added');
    window.setTimeout(() => setStatus(''), 1600);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-18px_rgba(30,43,34,0.25)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-shell items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-label text-[0.58rem] uppercase tracking-lockup text-muted">
            {product.category}
          </p>
          <p className="truncate font-display text-base text-ink">{product.name}</p>
          <p className="font-label text-sm tracking-wide2 text-ink">
            {formatMoney(product.retail_price)}
          </p>
        </div>
        {needsVariant ? (
          <a
            href="#pdp-purchase"
            className="btn-primary shrink-0 px-5 py-3 font-label text-[0.62rem] uppercase tracking-lockup"
          >
            Choose options
          </a>
        ) : (
          <button
            type="button"
            disabled={oos}
            onClick={handleAdd}
            className="btn-primary shrink-0 px-5 py-3 font-label text-[0.62rem] uppercase tracking-lockup disabled:cursor-not-allowed disabled:opacity-45"
          >
            {oos ? 'Out of stock' : status || 'Add to Bag'}
          </button>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {status ? `${product.name} added to bag` : ''}
      </span>
    </div>
  );
}
