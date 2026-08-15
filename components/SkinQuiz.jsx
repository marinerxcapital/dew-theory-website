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
  const progress = done ? 100 : Math.round(((step + 1) / total) * 100);

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
      <div className="mb-10">
        <div className="flex items-center justify-between gap-4">
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
            {current.eyebrow}
          </p>
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
            {step + 1} / {total}
          </p>
        </div>
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-dew-soft"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="h-full rounded-full bg-dew transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal leading-[1.12] text-ink">
        {current.title}
      </h2>
      <p className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted">
        {current.subtitle}
      </p>

      <div className="mt-10 grid gap-3 sm:gap-4" role="listbox" aria-label={current.title}>
        {current.options.map((opt) => {
          const selected = answers[current.id] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => select(opt.value)}
              className={`group flex min-h-[72px] w-full flex-col items-start rounded-[2px] border px-5 py-5 text-left transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6 ${
                selected
                  ? 'border-dew bg-dew text-white'
                  : 'border-border bg-white text-charcoal hover:border-dew/50'
              }`}
            >
              <span>
                <span
                  className={`block font-display text-xl font-normal sm:text-2xl ${
                    selected ? 'text-white' : 'text-ink'
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`mt-1.5 block font-body text-sm font-normal leading-relaxed ${
                    selected ? 'text-white/80' : 'text-muted'
                  }`}
                >
                  {opt.hint}
                </span>
              </span>
              <span
                className={`mt-4 font-label text-[0.62rem] font-normal uppercase tracking-lockup sm:mt-0 ${
                  selected ? 'text-white/70' : 'text-muted'
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
          className="min-h-[44px] font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted transition-colors hover:text-ink disabled:opacity-30"
        >
          ← Back
        </button>
        <p className="max-w-sm text-right font-body text-xs font-normal leading-relaxed text-muted">
          For every age — teens through 60 & beyond. Suggested sequences only; not a diagnosis.
        </p>
      </div>
    </div>
  );
}

function QuizResults({ result, onRestart }) {
  const shareCode = encodeQuizAnswers(result.answers);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-dew">
        Your Dew Theory routine · {result.archetype}
      </p>
      <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.1rem)] font-normal leading-[1.1] text-ink">
        {result.headline}
      </h2>
      <p className="mt-5 max-w-2xl font-body text-base font-normal leading-relaxed text-charcoal sm:text-[1.05rem]">
        {result.emilyNote}
      </p>

      {(result.notes?.length > 0 || result.cautions?.length > 0) && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {result.notes?.map((n) => (
            <p
              key={n}
              className="dew-panel rounded-[2px] px-5 py-4 font-body text-sm font-normal leading-relaxed text-charcoal"
            >
              {n}
            </p>
          ))}
          {result.cautions?.map((n) => (
            <p
              key={n}
              className="rounded-[2px] border border-border bg-surface-light px-5 py-4 font-body text-sm font-normal leading-relaxed text-charcoal"
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

      <div className="mt-12 flex flex-col gap-6 rounded-[2px] border border-border bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
            Suggested routine · retail
          </p>
          <p className="mt-2 font-display text-3xl font-normal text-ink">
            {formatMoney(result.subtotal)}
          </p>
          <p className="mt-2 max-w-sm font-body text-sm font-normal text-muted">
            {result.products.length} Skin Script step
            {result.products.length === 1 ? '' : 's'} at full retail.
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
              className="btn-dew-outline min-h-[44px] px-6 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup"
            >
              Book a facial instead
            </Link>
            <Link
              href="/virtual-consultation"
              className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
            >
              Prefer virtual →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 font-body text-xs font-normal leading-relaxed text-muted">
        {QUIZ_DISCLAIMER}
      </p>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-8">
        <button
          type="button"
          onClick={onRestart}
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
        >
          Retake quiz
        </button>
        <span className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted">
          Result code: {shareCode}
        </span>
        <Link
          href="/routine"
          className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
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
      <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-2xl font-normal text-ink sm:text-3xl">{title}</h3>
      <ol className="mt-6 space-y-3">
        {products.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/shop/${p.id}`}
              className="group flex gap-4 rounded-[2px] border border-border bg-white p-4 transition-colors hover:border-dew/40 sm:gap-5 sm:p-5"
            >
              <div className="relative flex h-24 w-8 shrink-0 items-start justify-center pt-1 sm:h-28">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dew font-label text-xs text-white">
                  {i + 1}
                </span>
              </div>
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[2px] bg-surface-light sm:h-28 sm:w-20">
                <ProductImage
                  product={p}
                  sizes="80px"
                  quality={70}
                  className="!aspect-auto h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
                  {p.category}
                </p>
                <p className="mt-1 font-display text-lg font-normal text-ink group-hover:text-dew-dark sm:text-xl">
                  {p.name}
                </p>
                <p className="mt-1 line-clamp-2 font-body text-sm font-normal text-muted">
                  {p.description_short}
                </p>
                <p className="mt-2 font-label text-sm font-normal tracking-wide2 text-ink">
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
