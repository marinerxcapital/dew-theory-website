import { withPageMetadata } from '@/lib/page-metadata';
import CartView from '@/components/CartView';

export const metadata = withPageMetadata('/cart', {
  title: 'Cart',
  description: 'Review your Skin Script order and check out securely.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/cart' }
});

export default function CartPage() {
  return <CartView />;
}
