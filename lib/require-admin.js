import { redirect } from 'next/navigation';
import { getAdminFromCookies } from './admin-auth.js';

export async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect('/admin/login');
  return admin;
}

/** Owner-only admin (Emily) — use for all command center routes. */
export async function requireOwnerAdmin() {
  return requireAdmin();
}
