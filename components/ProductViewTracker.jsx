'use client';

import { useEffect } from 'react';

/** Fires first-party product_view once per mount for analytics funnel. */
export default function ProductViewTracker({ productId }) {
  useEffect(() => {
    if (!productId) return;
    const ctrl = new AbortController();
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'product_view', product_id: productId }),
      signal: ctrl.signal,
      keepalive: true
    }).catch(() => {
      /* analytics must never break the page */
    });
    return () => ctrl.abort();
  }, [productId]);

  return null;
}
