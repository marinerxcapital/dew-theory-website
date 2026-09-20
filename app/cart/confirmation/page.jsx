import CartConfirmation from '@/components/CartConfirmation';
import { getAutomationMode, getCustomerFulfillmentCopy } from '@/lib/admin/dashboard';

export const metadata = {
  title: 'Order confirmed',
  description: 'Your Dew Theory order is confirmed.',
  robots: { index: false, follow: false }
};

export default function ConfirmationPage({ searchParams }) {
  const orderId = searchParams?.order || null;
  const sessionId = searchParams?.session_id || null;
  const automation = getAutomationMode();
  const fulfillmentCopy = getCustomerFulfillmentCopy(automation);

  return (
    <CartConfirmation
      orderId={orderId}
      sessionId={sessionId}
      automationLive={Boolean(automation.automationLive)}
      fulfillmentCopy={fulfillmentCopy}
    />
  );
}
