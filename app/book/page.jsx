import BookingFlow from '@/components/BookingFlow';
import { SERVICES } from '@/lib/services';

export const metadata = {
  title: 'Book Now — Dew Theory',
  description: 'Book an appointment with licensed aesthetician Emily Mitchener.'
};

export default function BookPage({ searchParams }) {
  const raw = searchParams?.service;
  const initial =
    raw && SERVICES.some((s) => s.id === raw) ? raw : null;

  return <BookingFlow initialServiceId={initial} />;
}
