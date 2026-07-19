'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import Rule from '@/components/Rule';
import { formatMoney } from '@/lib/shipping';

export default function CartView() {
  const {
    items,
    totals,
    discountCode,
    hydrated,
    updateQuantity,
    removeItem,
    setPromo,
    clearPromo,
    clearCart
  } = useCart();
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [guest, setGuest] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

  async function applyCode(e) {
    e.preventDefault();
    setCodeError('');
    setCodeLoading(true);
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || 'Code not valid');
        clearPromo();
        return;
      }
      setPromo(data.discount);
    } catch {
      setCodeError('Could not validate code');
    } finally {
      setCodeLoading(false);
    }
  }

  async function startCheckout(e) {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          discount_code: discountCode?.code || null,
          customer: {
            name: guest.name,
            email: guest.email,
            phone: guest.phone
          },
          shipping_address: {
            line1: guest.line1,
            city: guest.city,
            state: guest.state,
            postal_code: guest.postal_code,
            country: guest.country
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Checkout failed');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // Local mock checkout success
      clearCart();
      window.location.href = `/cart/confirmation?order=${data.order_id}`;
    } catch {
      setCheckoutError('Checkout failed. Try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-shell px-6 py-40 lg:px-10">
        <p className="font-body text-sm font-light text-charcoal/60">Loading cart…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10">
        <Rule left="Cart" right="Empty" />
        <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[1.02] text-graphite">
          Nothing here yet
        </h1>
        <p className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75">
          The collection is eight products — start with a cleanser or the mask if your barrier is dry.
        </p>
        <Link
          href="/shop"
          className="sweep mt-10 inline-block border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
        >
          Shop the collection
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <Rule left="Cart" right={`${items.reduce((n, i) => n + i.quantity, 0)} items`} />
      <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.02] text-graphite">
        Your bag
      </h1>

      <div className="mt-16 grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
        <ul className="divide-y divide-chrome/20 border-y border-chrome/20">
          {items.map((item) => (
            <li
              key={`${item.product_id}-${item.variant || ''}`}
              className="grid gap-4 py-8 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <Link
                  href={`/shop/${item.product_id}`}
                  className="font-display text-xl text-graphite hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-2 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                  {item.category}
                  {item.variant ? ` · ${item.variant}` : ''}
                  {item.size ? ` · ${item.size}` : ''}
                </p>
                <p className="mt-3 font-label text-sm font-light tracking-wide2 text-charcoal">
                  {formatMoney(item.unit_price)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="sr-only" htmlFor={`qty-${item.product_id}-${item.variant}`}>
                  Quantity for {item.name}
                </label>
                <input
                  id={`qty-${item.product_id}-${item.variant}`}
                  type="number"
                  min={1}
                  max={20}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.product_id, item.variant, Number(e.target.value) || 1)
                  }
                  className="w-16 border border-chrome/30 bg-white/60 px-2 py-2 text-center font-body text-sm font-light text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.product_id, item.variant)}
                  className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="glass-1 h-fit p-8 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-graphite">Summary</h2>

          <dl className="mt-8 space-y-3 font-body text-sm font-light text-charcoal/80">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotal)}</dd>
            </div>
            {totals.discount_amount > 0 && (
              <div className="flex justify-between text-chrome">
                <dt>Discount{totals.discount_code ? ` (${totals.discount_code})` : ''}</dt>
                <dd>−{formatMoney(totals.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>
                {totals.shipping_fee === 0 ? 'Free' : formatMoney(totals.shipping_fee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-chrome/20 pt-4 font-label text-[0.7rem] uppercase tracking-lockup text-graphite">
              <dt>Total</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
          </dl>

          <p className="mt-4 font-body text-xs font-light leading-relaxed text-charcoal/55">
            Flat $7 shipping, waived at $49+ subtotal (before discount).
          </p>

          <form onSubmit={applyCode} className="mt-8">
            <label
              htmlFor="promo"
              className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
            >
              Promo code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="DEW15"
                className="min-w-0 flex-1 border border-chrome/30 bg-white/70 px-3 py-3 font-body text-sm font-light uppercase tracking-wide2 text-charcoal"
              />
              <button
                type="submit"
                disabled={codeLoading}
                className="border border-graphite/25 px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
              >
                Apply
              </button>
            </div>
            {discountCode && (
              <button
                type="button"
                onClick={clearPromo}
                className="mt-2 font-label text-[0.6rem] uppercase tracking-lockup text-chrome hover:text-charcoal"
              >
                Remove {discountCode.code}
              </button>
            )}
            {codeError && (
              <p className="mt-2 font-body text-xs font-light text-charcoal/70" role="alert">
                {codeError}
              </p>
            )}
          </form>

          <form onSubmit={startCheckout} className="mt-10 space-y-4 border-t border-chrome/20 pt-8">
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              Shipping details
            </p>
            {[
              ['name', 'Full name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'tel'],
              ['line1', 'Address', 'text'],
              ['city', 'City', 'text'],
              ['state', 'State', 'text'],
              ['postal_code', 'Postal code', 'text']
            ].map(([key, label, type]) => (
              <div key={key}>
                <label
                  htmlFor={`guest-${key}`}
                  className="sr-only"
                >
                  {label}
                </label>
                <input
                  id={`guest-${key}`}
                  type={type}
                  required
                  placeholder={label}
                  value={guest[key]}
                  onChange={(e) => setGuest((g) => ({ ...g, [key]: e.target.value }))}
                  className="w-full border border-chrome/30 bg-white/70 px-3 py-3 font-body text-sm font-light text-charcoal"
                />
              </div>
            ))}

            {checkoutError && (
              <p className="font-body text-xs font-light text-charcoal/70" role="alert">
                {checkoutError}
              </p>
            )}

            <button
              type="submit"
              disabled={checkoutLoading}
              className="sweep w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
            >
              {checkoutLoading ? 'Starting checkout…' : 'Checkout'}
            </button>
            <p className="font-body text-xs font-light leading-relaxed text-charcoal/50">
              Stripe Checkout when keys are set; otherwise a local order is recorded for admin review.
            </p>
          </form>
        </aside>
      </div>
    </section>
  );
}
