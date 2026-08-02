'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ProductImage from '@/components/ProductImage';
import { useCart } from '@/components/CartProvider';
import {
  defaultRoutineTemplate,
  productsForCategory
} from '@/lib/skin-quiz';
import { formatMoney } from '@/lib/shipping';
import { ROUTINE_ORDER } from '@/lib/routine';

/**
 * Interactive AM/PM routine builder — catalog products only.
 * Inclusive UI for every age: simple defaults, clear sequence.
 */
export default function RoutineBuilder({ catalog = [] }) {
  const { addItem } = useCart();
  const [slot, setSlot] = useState('am');
  const [amSteps, setAmSteps] = useState(() => defaultRoutineTemplate(catalog, 'am'));
  const [pmSteps, setPmSteps] = useState(() => defaultRoutineTemplate(catalog, 'pm'));
  const [status, setStatus] = useState('idle');
  const [openCat, setOpenCat] = useState(null);

  const steps = slot === 'am' ? amSteps : pmSteps;
  const setSteps = slot === 'am' ? setAmSteps : setPmSteps;

  const selectedProducts = useMemo(
    () => steps.map((s) => s.product).filter(Boolean),
    [steps]
  );
  const subtotal = selectedProducts.reduce((s, p) => s + Number(p.retail_price || 0), 0);
  const completeRequired = steps.filter((s) => s.required).every((s) => s.product);

  function pickProduct(category, product) {
    setSteps((prev) =>
      prev.map((s) => (s.category === category ? { ...s, product } : s))
    );
    setOpenCat(null);
  }

  function clearStep(category) {
    setSteps((prev) =>
      prev.map((s) =>
        s.category === category && !s.required ? { ...s, product: null } : s
      )
    );
  }

  function addRoutine() {
    if (!selectedProducts.length) return;
    setStatus('adding');
    for (const p of selectedProducts) {
      addItem(p.id, { quantity: 1 });
    }
    setStatus('done');
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'routine_builder_add',
        slot,
        product_ids: selectedProducts.map((p) => p.id)
      }),
      keepalive: true
    }).catch(() => {});
    setTimeout(() => setStatus('idle'), 2200);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome">
            Sequence · Your rules
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-normal text-graphite">
            Build your routine
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm font-normal leading-relaxed text-charcoal/70 sm:text-base">
            Thin to thick. Morning ends in SPF. Evening can rest. Works for first routines and
            lifelong ones — teens to 60 & beyond.
          </p>
        </div>
        <div
          className="inline-flex rounded-[2px] border border-chrome/20 bg-surface p-1"
          role="tablist"
          aria-label="Morning or evening"
        >
          {[
            ['am', 'Morning'],
            ['pm', 'Evening']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={slot === id}
              onClick={() => {
                setSlot(id);
                setOpenCat(null);
              }}
              className={`min-h-[44px] px-6 py-2.5 font-label text-[0.68rem] font-normal uppercase tracking-lockup transition-colors ${
                slot === id
                  ? 'bg-graphite text-pearl'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-12 space-y-4">
        {steps.map((step, index) => {
          const options = productsForCategory(catalog, step.category);
          const isOpen = openCat === step.category;
          return (
            <li
              key={step.category}
              className="overflow-hidden rounded-[2px] border border-chrome/15 bg-surface shadow-card"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-center gap-4 sm:w-44 sm:shrink-0">
                  <span className="flex size-9 items-center justify-center border border-chrome/25 font-label text-[0.62rem] font-normal text-chrome">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-chrome">
                      {step.required ? 'Essential' : 'Optional'}
                    </p>
                    <p className="mt-0.5 font-display text-lg font-normal text-graphite">
                      {step.category}
                    </p>
                  </div>
                </div>

                {step.product ? (
                  <Link
                    href={`/shop/${step.product.id}`}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-[2px] bg-pearl">
                      <ProductImage product={step.product} sizes="56px" quality={70} className="!aspect-auto h-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-normal text-graphite sm:text-lg">
                        {step.product.name}
                      </p>
                      <p className="mt-0.5 font-label text-sm font-normal tracking-wide2 text-charcoal/70">
                        {formatMoney(step.product.retail_price)}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <p className="flex-1 font-body text-sm font-normal text-charcoal/55">
                    {options.length
                      ? 'Choose a formula for this step'
                      : 'No product in this category yet'}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenCat(isOpen ? null : step.category)}
                    className="btn-ghost min-h-[44px] px-5 py-2.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
                    disabled={!options.length}
                  >
                    {step.product ? 'Change' : 'Choose'}
                  </button>
                  {step.product && !step.required && (
                    <button
                      type="button"
                      onClick={() => clearStep(step.category)}
                      className="min-h-[44px] px-4 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome hover:text-charcoal"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isOpen && options.length > 0 && (
                <div className="border-t border-chrome/12 bg-pearl/50 px-4 py-4 sm:px-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {options.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickProduct(step.category, p)}
                        className={`flex gap-3 rounded-[2px] border p-3 text-left transition-colors ${
                          step.product?.id === p.id
                            ? 'border-graphite bg-surface'
                            : 'border-chrome/15 bg-surface hover:border-chrome/35'
                        }`}
                      >
                        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-[2px]">
                          <ProductImage product={p} sizes="44px" quality={65} className="!aspect-auto h-full" />
                        </div>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-base font-normal text-graphite">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block font-label text-xs font-normal text-chrome">
                            {formatMoney(p.retail_price)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-col gap-6 rounded-[2px] border border-chrome/15 bg-graphite p-8 text-pearl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-pearl/55">
            {slot === 'am' ? 'Morning' : 'Evening'} bag · {selectedProducts.length} step
            {selectedProducts.length === 1 ? '' : 's'}
          </p>
          <p className="mt-2 font-display text-3xl font-normal text-pearl">
            {formatMoney(subtotal)}
          </p>
          {!completeRequired && (
            <p className="mt-2 font-body text-xs font-normal text-pearl/60">
              Add required steps for a complete {slot === 'am' ? 'morning' : 'evening'} path.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <button
            type="button"
            onClick={addRoutine}
            disabled={!selectedProducts.length || status === 'adding'}
            className="min-h-[48px] border border-pearl/30 bg-pearl px-8 py-3.5 font-label text-[0.68rem] font-normal uppercase tracking-lockup text-graphite transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {status === 'done'
              ? 'Added to bag'
              : status === 'adding'
                ? 'Adding…'
                : `Add ${slot === 'am' ? 'morning' : 'evening'} routine`}
          </button>
          <Link
            href="/quiz"
            className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-pearl/65 hover:text-pearl"
          >
            Prefer Emily’s quiz →
          </Link>
        </div>
      </div>

      <p className="mt-6 font-body text-xs font-normal leading-relaxed text-charcoal/55">
        Order follows professional layering ({ROUTINE_ORDER.filter((c) => c !== 'Mask' && c !== 'Exfoliant').join(' → ')}
        …). Not a medical protocol — when in doubt, book a read with Emily.
      </p>
    </div>
  );
}
