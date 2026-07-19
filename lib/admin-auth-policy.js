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
