import BookingFlow from '@/components/BookingFlow';
import { SERVICES } from '@/lib/services';

export const metadata = {
  title: 'Book',
  description:
    'Book a facial with Emily Mitchener. Choose a service, pick a time, leave your details.'
};

export default function BookPage({ searchParams }) {
  const raw = typeof searchParams?.service === 'string' ? searchParams.service : null;
  const valid = raw && SERVICES.some((s) => s.id === raw);
  const initialServiceId = valid ? raw : null;
  // True when ?service= was present but not a real id (typo / old link)
  const invalidServiceQuery = Boolean(raw && !valid);

  return (
    <BookingFlow
      initialServiceId={initialServiceId}
      invalidServiceQuery={invalidServiceQuery}
    />
  );
}
