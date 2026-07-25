import IntakeForm from '@/components/IntakeForm';

export const metadata = {
  title: 'Consultation intake',
  robots: { index: false, follow: false }
};

export default function IntakePage({ params }) {
  const token = params?.token;
  return (
    <section className="mx-auto max-w-shell px-6 pb-24 pt-32 sm:pt-36 lg:px-10">
      <IntakeForm token={token} />
    </section>
  );
}
