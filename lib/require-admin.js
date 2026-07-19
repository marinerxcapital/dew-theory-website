import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/admin-auth';

export async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect('/admin/login');
  return admin;
}
