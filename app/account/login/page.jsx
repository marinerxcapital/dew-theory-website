import { withPageMetadata } from '@/lib/page-metadata';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import PageShell from '@/components/PageShell';
import AccountAuthForms from '@/components/customer/AccountAuthForms';
import { getCustomerFromCookies } from '@/lib/customers/guards';

export const metadata = withPageMetadata('/account/login', {
  title: 'Account',
  description:
    'Sign in to Dew Theory to keep favorites, see your orders, and hold your routine in one place.',
  alternates: { canonical: '/account/login' },
  robots: { index: false, follow: true }
});

export const dynamic = 'force-dynamic';

export default async function AccountLoginPage() {
  const existing = await getCustomerFromCookies();
  if (existing) redirect('/account');

  return (
    <PageShell
      eyebrow="Account"
      title="Sign in"
      intro="An account keeps your favorites and order history together. It is optional — the shop and the consultation both work without one."
    >
      <Suspense fallback={<div className="h-64 max-w-md border border-border" aria-hidden="true" />}>
        <AccountAuthForms />
      </Suspense>
    </PageShell>
  );
}
