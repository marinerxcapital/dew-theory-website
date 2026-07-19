'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Rule from '@/components/Rule';
import { useCart } from '@/components/CartProvider';
import { formatMoney } from '@/lib/shipping';

/**
 * Handles confirmation from:
 * - ?order=ord_… (local mock checkout)
 * - ?session_id=cs_… (Stripe Checkout success_url)
 */
export default function CartConfirmation({ orderId: initialOrder, sessionId }) {
  const { clearCart } = useCart();
  const [orderId, setOrderId] = useState(initialOrder || null);
  const [status, setStatus] = useState(sessionId ? 'resolving' : 'ready');
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Always clear bag after a successful redirect back
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'Could not confirm payment');
          setStatus('error');
          return;
        }
        setOrderId(data.order_id);
        setTotal(data.total);
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setError('Could not confirm payment');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <section
      className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10"
      data-reveal-group="confirm"
    >
      <Rule
        left="Checkout"
        right={status === 'error' ? 'Issue' : 'Confirmed'}
        data-reveal
      />
      <h1
        data-reveal
        className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite"
      >
        {status === 'error' ? 'Almost there' : 'Thank you'}
      </h1>

      {status === 'resolving' && (
        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Confirming your payment…
        </p>
      )}

      {status === 'error' && (
        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
          role="alert"
        >
          {error} If you were charged, Emily can match your order from the payment email — contact
          the studio with your receipt.
        </p>
      )}

      {status === 'ready' && (
        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Your order is in. Emily will fulfill it manually through Skin Script — you&apos;ll get a
          confirmation email with details. No live tracking link; we&apos;ll update you when it
          ships.
        </p>
      )}

      {orderId && (
        <p
          data-reveal
          className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome"
        >
          Order {orderId}
          {total != null ? ` · ${formatMoney(total)}` : ''}
        </p>
      )}

      <div data-reveal className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/shop"
          className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
        >
          Continue shopping
        </Link>
        <Link
          href="/book"
          className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Book a facial
        </Link>
      </div>
    </section>
  );
}
