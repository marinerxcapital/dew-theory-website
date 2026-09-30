import { getConsultationByIntakeToken } from '@/lib/consultations/service.js';
import { withPageMetadata } from '@/lib/page-metadata';
import IntakeForm from '@/components/IntakeForm';

export const metadata = withPageMetadata('/virtual-consultation', {
  title: 'Consultation intake',
  robots: { index: false, follow: false }
});

export default async function IntakePage({ params }) {
  const { token } = await params;
  const consultation = getConsultationByIntakeToken(token);
  const initialError = !consultation ? 'Not found' : consultation.payment_status !== 'paid' ? 'Payment required' : ''; 
  return (
    <section className="mx-auto max-w-shell px-6 pb-24 pt-32 sm:pt-36 lg:px-10">
      <IntakeForm token={token} initialError={initialError} />
    </section>
  );
}
