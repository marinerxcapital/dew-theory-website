import BookingFlow from '@/components/BookingFlow';
import { SERVICES } from '@/lib/services';

export const metadata = {
  title: 'Book a Facial',
  description:
    'Book an in-studio facial with licensed aesthetician Emily Mitchener. Choose a service, pick a time, and confirm your details online.',
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Book a Facial — Dew Theory',
    description: 'Schedule an in-studio facial with Emily Mitchener.',
    url: '/book'
  }
};

export default async function BookPage({ searchParams }) {
  const sp = await searchParams;
  const raw = typeof sp?.service === 'string' ? sp.service : null;
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
