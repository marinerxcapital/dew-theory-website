/**
 * Pure admin auth policy helpers (unit-testable, no Next.js).
 * Used by admin-auth.js and tests — production never accepts default password.
 */

export const DEV_EMAIL = 'admin@dewtheory.local';
export const DEV_PASSWORD = 'dew-admin-dev';
export const DEV_SESSION_SECRET = 'dew-theory-dev-secret-change-me';

/**
 * Whether production may accept these env credentials.
 * @param {{ email?: string|null, password?: string|null, sessionSecret?: string|null, nodeEnv?: string }} env
 */
export function productionAuthConfigured(env = {}) {
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== 'production') return true;

  const email = env.email ?? process.env.ADMIN_EMAIL;
  const password = env.password ?? process.env.ADMIN_PASSWORD;
  const sessionSecret = env.sessionSecret ?? process.env.ADMIN_SESSION_SECRET;

  if (!email || !password) return false;
  if (password === DEV_PASSWORD) return false;
  if (!sessionSecret || sessionSecret === DEV_SESSION_SECRET) return false;
  return true;
}

/**
 * Resolve expected login pair for the current environment.
 * Returns null when production is misconfigured (reject all logins).
 * @param {{ email?: string|null, password?: string|null, sessionSecret?: string|null, nodeEnv?: string }} env
 * @returns {{ email: string, password: string } | null}
 */
export function resolveExpectedCredentials(env = {}) {
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  const envEmail = env.email !== undefined ? env.email : process.env.ADMIN_EMAIL;
  const envPass = env.password !== undefined ? env.password : process.env.ADMIN_PASSWORD;

  if (nodeEnv === 'production') {
    if (!productionAuthConfigured(env)) return null;
    return {
      email: String(envEmail).toLowerCase(),
      password: String(envPass)
    };
  }

  return {
    email: String(envEmail || DEV_EMAIL).toLowerCase(),
    password: String(envPass || DEV_PASSWORD)
  };
}

/**
 * Open-redirect guard for post-login ?next=
 * @param {string|null|undefined} raw
 */
export function safeAdminNextPath(raw) {
  if (!raw || typeof raw !== 'string') return '/admin';
  if (!raw.startsWith('/admin')) return '/admin';
  if (raw.startsWith('//') || raw.includes('://')) return '/admin';
  if (raw === '/admin/login') return '/admin';
  return raw;
}

/**
 * Emily owner email — explicit owner identity for admin command center.
 * Production: ADMIN_OWNER_EMAIL or ADMIN_EMAIL.
 * Development: ADMIN_OWNER_EMAIL or ADMIN_EMAIL or DEV_EMAIL.
 */
export function resolveOwnerEmail(env = {}) {
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  const owner =
    env.ownerEmail ??
    process.env.ADMIN_OWNER_EMAIL ??
    env.email ??
    process.env.ADMIN_EMAIL;
  if (owner) return String(owner).toLowerCase().trim();
  if (nodeEnv === 'production') return null;
  return DEV_EMAIL;
}

/**
 * Owner-equivalent admin role names.
 */
export function isOwnerRole(role) {
  const r = String(role || '').toLowerCase();
  return r === 'owner' || r === 'admin' || r === 'superadmin';
}

/**
 * @param {{ email?: string, role?: string }} admin
 */
export function isOwnerAdmin(admin, env = {}) {
  if (!admin?.email) return false;
  const ownerEmail = resolveOwnerEmail(env);
  if (!ownerEmail) return false;
  const emailOk = String(admin.email).toLowerCase().trim() === ownerEmail;
  return emailOk && isOwnerRole(admin.role);
}

export function ownerTotpRequired(env = {}) {
  const flag = env.requireTotp ?? process.env.ADMIN_REQUIRE_TOTP;
  if (flag === 'true' || flag === '1') return true;
  return Boolean(env.totpSecret ?? process.env.ADMIN_TOTP_SECRET);
}
