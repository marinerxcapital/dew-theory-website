import { getAdminFromCookies } from '@/lib/admin-auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin — Dew Theory',
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }) {
  const admin = await getAdminFromCookies();

  // Bare chrome for admin — no storefront Nav/Footer (those wrap via root layout).
  // AdminShell hides itself on login when unauthenticated.
  return (
    <div className="min-h-screen bg-pearl">
      <AdminShell admin={admin ? { name: admin.name, email: admin.email, role: admin.role } : null}>
        {children}
      </AdminShell>
    </div>
  );
}
