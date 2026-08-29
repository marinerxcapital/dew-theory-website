'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import FreeShippingMeter from '@/components/FreeShippingMeter';
import ProductImage from '@/components/ProductImage';
import ProductCard from '@/components/ProductCard';
import Rule from '@/components/Rule';
import { productById, PRODUCTS } from '@/lib/products';
import { suggestMissingRoutineSteps } from '@/lib/routine';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';
import { isShopVisible } from '@/lib/shop';
import { getCheckoutLegalDocuments } from '@/lib/legal-documents';
import LegalDocLinks from '@/components/LegalDocLinks';

const NOTE_MAX = 400;

export default function CartView() {
  const {
    items,
    totals,
    discountCode,
    hydrated,
    maxQty,
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
  const [orderNote, setOrderNote] = useState('');
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

  const freeShipping = totals.shipping_fee === 0;
  const complements = useMemo(
    () =>
      suggestMissingRoutineSteps(items, PRODUCTS, {
        isVisible: isShopVisible,
        limit: 3
      }),
    [items]
  );

  async function applyCode(e) {
    e.preventDefault();
    setCodeError('');
    const code = codeInput.trim();
    if (!code) {
      setCodeError('Enter a code');
      return;
    }
    setCodeLoading(true);
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || 'Code not valid');
        clearPromo();
        return;
      }
      setPromo(data.discount);
      setCodeError('');
    } catch {
      setCodeError('Could not validate code — check connection and try again');
    } finally {
      setCodeLoading(false);
    }
  }

  function onClearPromo() {
    clearPromo();
    setCodeInput('');
    setCodeError('');
  }

  function onQtyChange(productId, variant, raw) {
    // Empty field while typing — wait for blur; treat 0 as remove
    if (raw === '' || raw === '-') return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    updateQuantity(productId, variant, n);
  }

  function onQtyBlur(productId, variant, raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      updateQuantity(productId, variant, 0);
      return;
    }
    updateQuantity(productId, variant, Math.min(maxQty, Math.floor(n)));
  }

  async function startCheckout(e) {
    e.preventDefault();
    setCheckoutError('');
    if (!items.length) {
      setCheckoutError('Your cart is empty');
      return;
    }
    setCheckoutLoading(true);
    try {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `chk_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          items,
          discount_code: discountCode?.code || null,
          idempotency_key: idempotencyKey,
          customer_notes: orderNote.trim().slice(0, NOTE_MAX) || null,
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
        const detail =
          Array.isArray(data.details) && data.details[0]?.error
            ? data.details[0].error
            : null;
        setCheckoutError(detail || data.error || 'Checkout failed — please try again');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      clearCart();
      window.location.href = `/cart/confirmation?order=${encodeURIComponent(data.order_id)}`;
    } catch {
      setCheckoutError('Checkout failed. Check your connection and try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (!hydrated) {
    return (
      <section
        className="mx-auto flex min-h-[50svh] max-w-shell flex-col justify-center px-6 py-40 lg:px-10"
        aria-busy="true"
        aria-live="polite"
      >
        <Rule left="Bag" right="Loading" />
        <p className="mt-8 font-display text-2xl font-normal text-graphite">Opening your bag…</p>
        <p className="mt-3 max-w-md font-body text-sm font-light leading-relaxed text-charcoal/60">
          Restoring items saved on this device. This only takes a moment.
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section
        className="mx-auto flex min-h-[70svh] max-w-shell flex-col justify-center px-5 py-24 sm:px-6 lg:px-10"
        data-reveal-group="cart-empty"
      >
        <p
          data-reveal
          className="font-label text-[0.62rem] uppercase tracking-lockup text-muted"
        >
          Bag · Empty
        </p>
        <h1
          data-reveal
          className="mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] font-normal leading-[1.02] text-ink"
        >
          Nothing here yet
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-base font-normal leading-relaxed text-muted"
        >
          Start with Skin Script, or book a virtual consultation for a personalized plan. Free shipping at{' '}
          {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal (before discount).
        </p>
        <div data-reveal className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="btn-primary px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Shop Skin Script
          </Link>
          <Link
            href="/virtual-consultation"
            className="btn-dew-outline px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Virtual consultation
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div data-reveal-group="cart-head">
        <p
          data-reveal
          className="font-label text-[0.62rem] uppercase tracking-lockup text-muted"
        >
          Bag · {items.reduce((n, i) => n + i.quantity, 0)} items
        </p>
        <h1
          data-reveal
          className="mt-3 font-display text-[clamp(2.2rem,6vw,3.75rem)] font-normal leading-[1.02] text-ink"
        >
          Your bag
        </h1>
      </div>

      <div
        className="mt-10 grid gap-10 sm:mt-14 lg:mt-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
        data-reveal-group="cart-body"
      >
        <ul className="order-last min-w-0 divide-y divide-chrome/20 border-y border-chrome/20 lg:order-first">
          {items.map((item) => {
            const catalogProduct = productById(item.product_id);
            const thumbProduct = catalogProduct || {
              id: item.product_id,
              name: item.name,
              category: item.category
            };
            return (
            <li
              key={`${item.product_id}-${item.variant || ''}`}
              data-reveal
              className="grid gap-4 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-5 sm:py-8"
            >
              <Link
                href={`/shop/${item.product_id}`}
                className="block w-16 shrink-0 sm:w-20"
                aria-hidden="true"
                tabIndex={-1}
              >
                <ProductImage
                  product={thumbProduct}
                  framed
                  sizes="80px"
                  className="!rounded-[2px]"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/shop/${item.product_id}`}
                  className="break-words font-display text-lg font-normal text-graphite hover:underline sm:text-xl"
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
              <div className="flex items-center gap-4 sm:col-auto">
                <label className="sr-only" htmlFor={`qty-${item.product_id}-${item.variant}`}>
                  Quantity for {item.name}
                </label>
                <input
                  id={`qty-${item.product_id}-${item.variant}`}
                  type="number"
                  min={0}
                  max={maxQty}
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(e) =>
                    onQtyChange(item.product_id, item.variant, e.target.value)
                  }
                  onBlur={(e) => onQtyBlur(item.product_id, item.variant, e.target.value)}
                  className="w-16 border border-chrome/30 bg-pearl/80 px-2 py-2 text-center font-body text-sm font-light text-charcoal"
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
            );
          })}
        </ul>

        <aside
          data-reveal
          className="glass-1 order-first h-fit p-6 sm:p-8 lg:sticky lg:top-24 lg:order-last"
        >
          <h2 className="font-display text-2xl font-normal text-graphite">Summary</h2>

          <dl className="mt-8 space-y-3 font-body text-sm font-light text-charcoal/80">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="shrink-0">{formatMoney(totals.subtotal)}</dd>
            </div>
            {totals.discount_amount > 0 && (
              <div className="flex justify-between gap-4 text-chrome">
                <dt>Discount{totals.discount_code ? ` (${totals.discount_code})` : ''}</dt>
                <dd className="shrink-0">−{formatMoney(totals.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt>Shipping</dt>
              <dd className="shrink-0">{freeShipping ? 'Free' : formatMoney(totals.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-chrome/20 pt-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-graphite">
              <dt>Total</dt>
              <dd className="shrink-0">{formatMoney(totals.total)}</dd>
            </div>
          </dl>

          <FreeShippingMeter subtotal={totals.subtotal} className="mt-4" />

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
                autoComplete="off"
                disabled={codeLoading || checkoutLoading}
                className="min-w-0 flex-1 border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light uppercase tracking-wide2 text-charcoal disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={codeLoading || !codeInput.trim() || checkoutLoading}
                className="min-h-[44px] border border-graphite/25 px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60 disabled:opacity-40"
              >
                {codeLoading ? '…' : 'Apply'}
              </button>
            </div>
            {discountCode && (
              <button
                type="button"
                onClick={onClearPromo}
                className="mt-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
              >
                Remove {discountCode.code}
              </button>
            )}
            {codeError && (
              <p
                className="mt-2 border border-chrome/25 bg-pearl/60 px-3 py-2 font-body text-xs font-light text-charcoal/75"
                role="alert"
              >
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
                <label htmlFor={`guest-${key}`} className="sr-only">
                  {label}
                </label>
                <input
                  id={`guest-${key}`}
                  type={type}
                  required
                  placeholder={label}
                  disabled={checkoutLoading}
                  value={guest[key]}
                  onChange={(e) => setGuest((g) => ({ ...g, [key]: e.target.value }))}
                  className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="order-note"
                className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome"
              >
                Gift or order note (optional)
              </label>
              <textarea
                id="order-note"
                rows={3}
                maxLength={NOTE_MAX}
                disabled={checkoutLoading}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value.slice(0, NOTE_MAX))}
                placeholder="Delivery instructions or a short gift message"
                className="mt-2 w-full resize-y border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
              />
              <p className="mt-1 text-right font-label text-[0.55rem] font-light uppercase tracking-lockup text-chrome/70">
                {orderNote.length}/{NOTE_MAX}
              </p>
            </div>

            {checkoutError && (
              <div
                className="border border-chrome/30 bg-pearl/70 p-4"
                role="alert"
              >
                <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                  Checkout issue
                </p>
                <p className="mt-2 font-body text-xs font-light leading-relaxed text-charcoal/80">
                  {checkoutError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={checkoutLoading || !items.length}
              className="sweep w-full min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? 'Starting checkout…' : 'Checkout'}
            </button>

            {/* Trust strip — near CTA; values from lib/shipping.js only */}
            <ul className="space-y-2.5 border border-chrome/20 bg-pearl/40 px-4 py-4">
              <li className="flex gap-3 font-body text-[0.7rem] font-light leading-relaxed text-charcoal/65">
                <span
                  className="mt-0.5 shrink-0 font-label text-[0.55rem] font-light uppercase tracking-lockup text-chrome"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span>
                  <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                    Secure checkout
                  </span>
                  <span className="mt-0.5 block">
                    Stripe Checkout when keys are set; otherwise a local order is recorded for admin
                    review — no card form on this page.
                  </span>
                </span>
              </li>
              <li className="flex gap-3 font-body text-[0.7rem] font-light leading-relaxed text-charcoal/65">
                <span
                  className="mt-0.5 shrink-0 font-label text-[0.55rem] font-light uppercase tracking-lockup text-chrome"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span>
                  <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                    Shipping
                  </span>
                  <span className="mt-0.5 block">
                    Free at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ subtotal (pre-discount);
                    otherwise {formatMoney(FLAT_SHIPPING_USD)} flat.
                  </span>
                </span>
              </li>
              <li className="flex gap-3 font-body text-[0.7rem] font-light leading-relaxed text-charcoal/65">
                <span
                  className="mt-0.5 shrink-0 font-label text-[0.55rem] font-light uppercase tracking-lockup text-chrome"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span>
                  <span className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                    Authenticity
                  </span>
                  <span className="mt-0.5 block">
                    Skin Script professional formulas — stocked and fulfilled by the studio, not
                    third-party marketplace sellers.
                  </span>
                </span>
              </li>
            </ul>

            <div className="mt-5 border-t border-chrome/15 pt-4">
              <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
                Policies
              </p>
              <LegalDocLinks
                dense
                className="mt-2"
                documents={getCheckoutLegalDocuments()}
              />
            </div>
          </form>
        </aside>
      </div>

      {complements.length > 0 && (
        <div className="mt-16 border-t border-chrome/15 pt-14" data-reveal-group="cart-routine">
          <p
            data-reveal
            className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            Complete the routine
          </p>
          <h2
            data-reveal
            className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal text-graphite"
          >
            Missing steps from your bag
          </h2>
          <p
            data-reveal
            className="mt-3 max-w-xl font-body text-sm font-light leading-relaxed text-charcoal/70"
          >
            Suggestions follow standard order of operations (cleanser → treatments → moisturizer →
            SPF) — not a medical protocol.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="cart-upsell">
            {complements.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
