import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/admin-auth';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import Rule from '@/components/Rule';

export const metadata = { title: 'Admin login — Dew Theory' };

export default async function AdminLoginPage() {
  const admin = await getAdminFromCookies();
  if (admin) redirect('/admin');

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-6 py-20">
      <Rule left="Admin" right="Sign in" />
      <h1 className="mt-8 font-display text-3xl font-normal text-graphite">Studio portal</h1>
      <p className="mt-4 font-body text-sm font-light text-charcoal/70">
        Separate from customer accounts. Access requires a row in Admins — not a shop login.
      </p>
      <div className="mt-10">
        <AdminLoginForm />
      </div>
    </section>
  );
}
