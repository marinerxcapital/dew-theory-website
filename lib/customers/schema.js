/**
 * Customer identity tables.
 *
 * Additive only: every statement is CREATE ... IF NOT EXISTS, so running it
 * against the live database cannot drop, alter or truncate anything. The tables
 * live in the same D1 database as the commerce tables (DEW_THEORY_D1) and are
 * registered here so `lib/commerce/schema.js` remains the single inventory of
 * durable tables.
 */

export const CUSTOMER_TABLES = ['customers', 'customer_sessions', 'favorites'];

/**
 * `kind` separates a login session from a single-use password-reset grant.
 * Both are stored as a SHA-256 hash of the bearer value, so a database read
 * cannot be replayed as a login.
 */
export const CUSTOMER_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers(email_normalized);
CREATE TABLE IF NOT EXISTS customer_sessions (
  token_hash TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'session',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_kind ON customer_sessions(kind);
CREATE TABLE IF NOT EXISTS favorites (
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (customer_id, product_id)
);
`;

/** Normalised form used for uniqueness and lookup. */
export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/** Practical email shape check — deliberately permissive, server-enforced. */
export function isPlausibleEmail(email) {
  const value = String(email || '').trim();
  if (value.length < 5 || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
