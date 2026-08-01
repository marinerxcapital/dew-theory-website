import CartView from '@/components/CartView';

export const metadata = {
  title: 'Cart',
  description: 'Review your Skin Script order and check out securely.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/cart' }
};

export default function CartPage() {
  return <CartView />;
}
