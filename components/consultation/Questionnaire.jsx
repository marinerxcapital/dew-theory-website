'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CONSULTATION_STEP_COUNT,
  CONSULTATION_STEPS,
  encodeAnswers,
  nextStepKey,
  previousStepKey,
  stepIndex
} from '@/lib/consultation-questions';
import { IconArrowRight, IconCheck } from '@/components/Icons';

const STORAGE_KEY = 'dew.consultation.v1';

const OPTION_BASE =
  'group relative flex min-h-[6.25rem] w-full items-center justify-center border px-5 py-5 text-center transition-colors duration-200 focus-visible:outline-none lg:min-h-[6.75rem]';

// Multi-step consultation questionnaire (mockup DT-09).
//
// Answers live in sessionStorage so a refresh or back-navigation resumes where
// the visitor left off, and the final step hands them to the results page in the
// URL so that page can be server-rendered from real catalog data.
//
// No answer is a diagnosis, and no step asks for medical information.
export default function Questionnaire({ stepKey }) {
  const router = useRouter();
  const step = useMemo(
    () => CONSULTATION_STEPS.find((s) => s.key === stepKey) || CONSULTATION_STEPS[0],
    [stepKey]
  );
  const index = stepIndex(step.key);
  const [answers, setAnswers] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw) || {});
    } catch {
      // A blocked storage API must not break the flow.
    }
    setHydrated(true);
  }, []);

  const selected = answers[step.key];
  const selectedList = Array.isArray(selected) ? selected : selected ? [selected] : [];

  function persist(next) {
    setAnswers(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function toggle(value) {
    if (step.multi) {
      const current = Array.isArray(selected) ? selected : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      persist({ ...answers, [step.key]: next });
      return;
    }
    persist({ ...answers, [step.key]: value });
  }

  function goNext() {
    const nextKey = nextStepKey(step.key);
    if (nextKey) {
      router.push('/consultation/' + nextKey);
      return;
    }
    router.push('/consultation/results?a=' + encodeURIComponent(encodeAnswers(answers)));
  }

  function goBack() {
    const prevKey = previousStepKey(step.key);
    if (prevKey) router.push('/consultation/' + prevKey);
    else router.push('/consultation');
  }

  return (
    <div className="relative isolate overflow-hidden bg-void">
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art__glass" />
        <div className="hero-art__streak" />
      </div>

      <div className="relative z-[1] mx-auto max-w-shell px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Progress: a hairline rail with the completed portion in ink, plus the
            step count as text so the state is never colour-only. */}
        <div className="flex items-center gap-6">
          <div
            className="h-px flex-1 bg-hairline"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={CONSULTATION_STEP_COUNT}
            aria-valuenow={index + 1}
            aria-label="Consultation progress"
          >
            <div
              className="h-px bg-green-300 transition-[width] duration-500"
              style={{ width: ((index + 1) / CONSULTATION_STEP_COUNT) * 100 + '%' }}
            />
          </div>
          <p className="shrink-0 font-body text-[0.66rem] font-medium uppercase tracking-eyebrow text-muted">
            Step {index + 1} of {CONSULTATION_STEP_COUNT}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl text-center lg:mt-10">
          <h1 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.02] tracking-headline text-ink">
            {step.prompt}
          </h1>
          <p className="mt-4 font-body text-[0.72rem] font-medium uppercase tracking-eyebrow text-muted">
            {step.helper}
          </p>
        </div>

        <ul
          className={
            'mx-auto mt-8 grid max-w-5xl gap-3 lg:mt-10 ' +
            (step.options.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')
          }
        >
          {step.options.map((option) => {
            const isOn = selectedList.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => toggle(option.value)}
                  aria-pressed={isOn}
                  className={
                    OPTION_BASE +
                    ' ' +
                    (isOn
                      ? 'border-ink bg-[rgba(201,183,154,0.16)]'
                      : 'border-hairline bg-surface/70 hover:border-ink/50')
                  }
                >
                  {isOn ? (
                    <span
                      className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-300 text-ink"
                      aria-hidden="true"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                  <span className="font-display text-[1.25rem] font-normal leading-tight text-ink lg:text-[1.45rem]">
                    {option.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:mt-10">
          <button
            type="button"
            onClick={goBack}
            className="btn-ghost inline-flex min-h-[56px] items-center justify-center px-10 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup sm:min-w-[14rem]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hydrated || selectedList.length === 0}
            className="btn-primary inline-flex min-h-[56px] items-center justify-center gap-3 px-10 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed sm:min-w-[16rem]"
          >
            Continue
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          Step {index + 1} of {CONSULTATION_STEP_COUNT}
          {selectedList.length ? ', ' + selectedList.length + ' selected' : ''}
        </p>
      </div>
    </div>
  );
}
