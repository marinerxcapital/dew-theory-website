import { withPageMetadata } from '@/lib/page-metadata';
import { notFound } from 'next/navigation';
import Questionnaire from '@/components/consultation/Questionnaire';
import { CONSULTATION_STEPS, getStep, stepIndex } from '@/lib/consultation-questions';

export function generateStaticParams() {
  return CONSULTATION_STEPS.map((s) => ({ step: s.key }));
}

export async function generateMetadata({ params }) {
  const { step } = await params;
  const found = getStep(step);
  if (!found) return { title: 'Consultation' };
  const n = stepIndex(step) + 1;
  return withPageMetadata('/consultation/' + found.key, {
    title: 'Step ' + n + ' — ' + found.prompt,
    description: found.prompt + ' (' + found.helper + ')',
    alternates: { canonical: '/consultation/' + found.key },
    robots: { index: false, follow: true }
  });
}

export default async function ConsultationStepPage({ params }) {
  const { step } = await params;
  if (!getStep(step)) notFound();
  return <Questionnaire stepKey={step} />;
}
