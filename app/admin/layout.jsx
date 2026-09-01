import { getAdminFromCookies } from '@/lib/admin-auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin — Dew Theory',
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }) {
  const admin = await getAdminFromCookies();

  return (
    <div className="min-h-screen bg-pearl">
      <AdminShell admin={admin ? { name: admin.name, email: admin.email, role: admin.role } : null}>
        {children}
      </AdminShell>
    </div>
  );
}
