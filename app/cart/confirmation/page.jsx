import CartConfirmation from '@/components/CartConfirmation';

export const metadata = {
  title: 'Order confirmed',
  description: 'Your Dew Theory order is confirmed.',
  robots: { index: false, follow: false }
};

export default function ConfirmationPage({ searchParams }) {
  const orderId = searchParams?.order || null;
  const sessionId = searchParams?.session_id || null;

  return <CartConfirmation orderId={orderId} sessionId={sessionId} />;
}
