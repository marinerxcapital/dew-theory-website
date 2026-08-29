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

  const pathKind = sessionId ? 'stripe' : initialOrder ? 'mock' : 'unknown';

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
        const data = await res.json().catch(() => ({}));
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
          setError('Could not confirm payment — check your connection and try refreshing.');
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
        right={
          status === 'error' ? 'Issue' : status === 'resolving' ? 'Confirming' : 'Confirmed'
        }
        data-reveal
      />
      <h1
        data-reveal
        className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite"
      >
        {status === 'error' ? 'Almost there' : status === 'resolving' ? 'One moment' : 'Thank you'}
      </h1>

      {status === 'resolving' && (
        <div data-reveal className="mt-6 max-w-lg" aria-busy="true" aria-live="polite">
          <p className="font-body text-base font-light leading-relaxed text-charcoal/75">
            Confirming your Stripe payment and recording the order…
          </p>
          <p className="mt-3 font-body text-sm font-light text-charcoal/55">
            This usually finishes in a few seconds. Keep this tab open.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div data-reveal className="mt-6 max-w-lg" role="alert">
          <div className="border border-chrome/30 bg-pearl/60 p-5">
            <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
              Payment confirmation
            </p>
            <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/80">
              {error} If you were charged, Emily can match your order from the payment email —
              contact the studio with your receipt or card statement last four.
            </p>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div data-reveal className="mt-6 max-w-lg">
          <p className="font-body text-base font-light leading-relaxed text-charcoal/75">
            {pathKind === 'stripe'
              ? 'Payment received. Your order is in — Emily will fulfill it through Skin Script.'
              : pathKind === 'mock'
                ? 'Your order is recorded for admin review (local checkout path — no card charged on this page). Emily will fulfill it through Skin Script.'
                : 'Your order is in. Emily will fulfill it manually through Skin Script.'}{' '}
            You&apos;ll get a confirmation email with details when that path is configured. No live
            tracking link; we&apos;ll update you when it ships.
          </p>
        </div>
      )}

      {orderId && status !== 'resolving' && (
        <p
          data-reveal
          className="mt-4 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome"
        >
          Order {orderId}
          {total != null ? ` · ${formatMoney(total)}` : ''}
          {pathKind === 'stripe' && status === 'ready' ? ' · Stripe' : ''}
          {pathKind === 'mock' && status === 'ready' ? ' · Local' : ''}
        </p>
      )}

      {status === 'ready' && (
        <ol
          data-reveal
          className="mt-8 max-w-lg space-y-4 border border-chrome/20 bg-pearl/40 p-5 sm:p-6"
        >
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Next · 1
            </span>
            <span className="mt-1 block">
              Save your order reference
              {orderId ? ` (${orderId})` : ''} — a confirmation email is queued when Resend is
              configured.
            </span>
          </li>
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Next · 2
            </span>
            <span className="mt-1 block">
              Emily fulfills Skin Script wholesale manually unless auto-fulfill is enabled. Watch
              for ship updates from the studio.
            </span>
          </li>
          <li className="font-body text-sm font-light leading-relaxed text-charcoal/75">
            <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
              Next · 3
            </span>
            <span className="mt-1 block">
              Apply the products in their AM / PM order — sequencing is half the result.
            </span>
          </li>
        </ol>
      )}

      <div data-reveal className="mt-10 flex flex-wrap gap-4">
        {status === 'error' ? (
          <>
            <Link
              href="mailto:hello@dewtheory.studio"
              className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
            >
              Contact studio
            </Link>
            <Link
              href="/cart"
              className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
            >
              Back to cart
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/shop"
              className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
            >
              Continue shopping
            </Link>
            {status === 'ready' && (
              <Link
                href="mailto:hello@dewtheory.studio"
                className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
              >
                Questions?
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
