import { withPageMetadata } from '@/lib/page-metadata';
import { Suspense } from 'react';
import PageShell from '@/components/PageShell';
import ResetPasswordForm from '@/components/customer/ResetPasswordForm';

export const metadata = withPageMetadata('/account/reset', {
  title: 'Reset password',
  description: 'Choose a new password for your Dew Theory account.',
  alternates: { canonical: '/account/reset' },
  robots: { index: false, follow: false }
});

export const dynamic = 'force-dynamic';

export default function AccountResetPage() {
  return (
    <PageShell
      eyebrow="Account"
      title="Choose a new password"
      intro="Resetting signs out every device that was signed in, then signs you back in here."
    >
      <Suspense fallback={<div className="h-64 max-w-md border border-border" aria-hidden="true" />}>
        <ResetPasswordForm />
      </Suspense>
    </PageShell>
  );
}
