'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ProductImage from '@/components/ProductImage';
import AddRoutineKit from '@/components/AddRoutineKit';
import {
  QUIZ_DISCLAIMER,
  QUIZ_STEPS,
  encodeQuizAnswers,
  resolveQuizRoutine,
  scoreQuiz
} from '@/lib/skin-quiz';
import { formatMoney } from '@/lib/shipping';

/**
 * Multi-step skin quiz — teens through mature skin.
 * Catalog is passed from the server as plain product objects.
 */
export default function SkinQuiz({ catalog = [] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const total = QUIZ_STEPS.length;
  const current = QUIZ_STEPS[step];
  const progress = done ? 100 : Math.round((step / total) * 100);

  const result = useMemo(() => {
    if (!done) return null;
    const scored = scoreQuiz(answers);
    return resolveQuizRoutine(scored, catalog);
  }, [done, answers, catalog]);

  function select(value) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'skin_quiz_complete', code: encodeQuizAnswers(next) }),
        keepalive: true
      }).catch(() => {});
    }
  }

  function back() {
    if (done) {
      setDone(false);
      setStep(total - 1);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done && result) {
    return <QuizResults result={result} onRestart={restart} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between gap-4">
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
            {current.eyebrow}
          </p>
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
            {step + 1} / {total}
          </p>
        </div>
        <div
          className="mt-4 h-px w-full bg-chrome/20"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="h-px bg-graphite transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal leading-[1.12] text-graphite">
        {current.title}
      </h2>
      <p className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-charcoal/75">
        {current.subtitle}
      </p>

      <div
        className="mt-10 grid gap-3 sm:gap-4"
        role="listbox"
        aria-label={current.title}
      >
        {current.options.map((opt) => {
          const selected = answers[current.id] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => select(opt.value)}
              className={`group flex min-h-[72px] w-full flex-col items-start rounded-[2px] border px-5 py-5 text-left transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6 ${
                selected
                  ? 'border-graphite bg-graphite text-pearl shadow-card'
                  : 'border-chrome/20 bg-surface text-charcoal shadow-card hover:-translate-y-0.5 hover:border-chrome/40 hover:shadow-card-hover'
              }`}
            >
              <span>
                <span
                  className={`block font-display text-xl font-normal sm:text-2xl ${
                    selected ? 'text-pearl' : 'text-graphite'
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`mt-1.5 block font-body text-sm font-normal leading-relaxed ${
                    selected ? 'text-pearl/70' : 'text-charcoal/65'
                  }`}
                >
                  {opt.hint}
                </span>
              </span>
              <span
                className={`mt-4 font-label text-[0.62rem] font-normal uppercase tracking-lockup sm:mt-0 ${
                  selected ? 'text-pearl/55' : 'text-chrome'
                }`}
              >
                Select
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-charcoal/70 transition-colors hover:text-charcoal disabled:opacity-30"
        >
          ← Back
        </button>
        <p className="max-w-sm text-right font-body text-xs font-normal leading-relaxed text-charcoal/55">
          For every age — teens through 60 & beyond. No medical claims; just a clear sequence.
        </p>
      </div>
    </div>
  );
}

function QuizResults({ result, onRestart }) {
  const shareCode = encodeQuizAnswers(result.answers);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome">
        Your path · {result.archetype}
      </p>
      <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.1rem)] font-normal leading-[1.1] text-graphite">
        {result.headline}
      </h2>
      <p className="mt-5 max-w-2xl font-body text-base font-normal leading-relaxed text-charcoal/80 sm:text-[1.05rem]">
        {result.emilyNote}
      </p>

      {(result.notes?.length > 0 || result.cautions?.length > 0) && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {result.notes?.map((n) => (
            <p
              key={n}
              className="rounded-[2px] border border-chrome/15 bg-surface px-5 py-4 font-body text-sm font-normal leading-relaxed text-charcoal/75"
            >
              {n}
            </p>
          ))}
          {result.cautions?.map((n) => (
            <p
              key={n}
              className="rounded-[2px] border border-blush/40 bg-ivory/80 px-5 py-4 font-body text-sm font-normal leading-relaxed text-charcoal/80"
            >
              {n}
            </p>
          ))}
        </div>
      )}

      <RoutineColumn title="Morning" eyebrow="AM sequence" products={result.am} />
      <RoutineColumn title="Evening" eyebrow="PM sequence" products={result.pm} />
      {result.weekly?.length > 0 && (
        <RoutineColumn title="Weekly ritual" eyebrow="1–2× per week" products={result.weekly} />
      )}

      <div className="mt-12 flex flex-col gap-6 rounded-[2px] border border-chrome/15 bg-surface p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
            Full routine · retail
          </p>
          <p className="mt-2 font-display text-3xl font-normal text-graphite">
            {formatMoney(result.subtotal)}
          </p>
          <p className="mt-2 max-w-sm font-body text-sm font-normal text-charcoal/65">
            {result.products.length} Skin Script step
            {result.products.length === 1 ? '' : 's'} — no invented kit discounts.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <AddRoutineKit
            productIds={result.products.map((p) => p.id)}
            label="Add full routine to bag"
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="btn-ghost min-h-[44px] px-6 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup"
            >
              Book a facial instead
            </Link>
            <Link
              href="/virtual-consultation"
              className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
            >
              Prefer virtual →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 font-body text-xs font-normal leading-relaxed text-charcoal/55">
        {QUIZ_DISCLAIMER}
      </p>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-chrome/12 pt-8">
        <button
          type="button"
          onClick={onRestart}
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Retake quiz
        </button>
        <Link
          href={`/quiz?r=${encodeURIComponent(shareCode)}`}
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-chrome hover:text-charcoal"
        >
          Result code: {shareCode}
        </Link>
        <Link
          href="/routine"
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Build your own routine →
        </Link>
      </div>
    </div>
  );
}

function RoutineColumn({ title, eyebrow, products }) {
  if (!products?.length) return null;
  return (
    <section className="mt-14">
      <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-2xl font-normal text-graphite sm:text-3xl">{title}</h3>
      <ol className="mt-6 space-y-3">
        {products.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/shop/${p.id}`}
              className="group flex gap-4 rounded-[2px] border border-chrome/15 bg-surface p-4 transition-shadow hover:shadow-card-hover sm:gap-5 sm:p-5"
            >
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[2px] bg-pearl sm:h-28 sm:w-20">
                <ProductImage
                  product={p}
                  sizes="80px"
                  quality={70}
                  className="!aspect-auto h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-chrome">
                  Step {i + 1} · {p.category}
                </p>
                <p className="mt-1 font-display text-lg font-normal text-graphite group-hover:text-charcoal sm:text-xl">
                  {p.name}
                </p>
                <p className="mt-1 line-clamp-2 font-body text-sm font-normal text-charcoal/65">
                  {p.description_short}
                </p>
                <p className="mt-2 font-label text-sm font-normal tracking-wide2 text-graphite">
                  {formatMoney(p.retail_price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
