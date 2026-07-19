import { redirect } from 'next/navigation';
import { getAdminFromCookies } from './admin-auth.js';

export async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect('/admin/login');
  return admin;
}
