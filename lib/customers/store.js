/**
 * Customer identity persistence.
 *
 * Durable on Cloudflare D1 (same database as the commerce tables) and mirrored
 * to a local JSON file off Workers so dev and CI behave identically. Every
 * statement is additive — this module never drops, alters or truncates.
 *
 * Server-only. Nothing here may be imported from a client component.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getRawD1Binding } from '../commerce/index.js';
import { CUSTOMER_MIGRATION_SQL, normalizeEmail } from './schema.js';

const DATA_DIR = path.join(process.cwd(), 'data', 'runtime');
/**
 * Local JSON fallback path. `CUSTOMER_STORE_FILE` lets tests (and CI) point at a
 * temporary file so a test run never writes into the real runtime data.
 */
const FILE_PATH =
  process.env.CUSTOMER_STORE_FILE || path.join(DATA_DIR, 'customers.json');

const EMPTY = () => ({ customers: [], customer_sessions: [], favorites: [] });

/** @type {ReturnType<typeof EMPTY> | null} */
let memory = null;
let fileWritable = null;
let d1SchemaReady = false;

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ file */

function ensureFile() {
  if (fileWritable === false) return false;
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(EMPTY(), null, 2));
    }
    fileWritable = true;
    return true;
  } catch {
    fileWritable = false;
    if (!memory) memory = EMPTY();
    return false;
  }
}

function readFile() {
  if (!ensureFile()) return memory || (memory = EMPTY());
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    const data = EMPTY();
    for (const key of Object.keys(data)) {
      if (Array.isArray(parsed?.[key])) data[key] = parsed[key];
    }
    memory = data;
    return data;
  } catch {
    // Corrupt file: keep a backup and start clean rather than throwing.
    try {
      if (fs.existsSync(FILE_PATH)) {
        fs.renameSync(FILE_PATH, `${FILE_PATH}.corrupt.${Date.now()}`);
      }
    } catch {
      /* ignore */
    }
    memory = EMPTY();
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(memory, null, 2));
    } catch {
      fileWritable = false;
    }
    return memory;
  }
}

function writeFile(data) {
  memory = data;
  if (!ensureFile()) return;
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    try {
      fs.renameSync(tmp, FILE_PATH);
    } catch {
      try {
        fs.unlinkSync(FILE_PATH);
      } catch {
        /* ignore */
      }
      fs.renameSync(tmp, FILE_PATH);
    }
  } catch {
    fileWritable = false;
  }
}

/* -------------------------------------------------------------------- d1 */

/** @returns {Promise<any|null>} raw D1 binding, or null for the file backend */
async function d1() {
  const db = await getRawD1Binding();
  if (!db) return null;
  if (!d1SchemaReady) {
    const statements = CUSTOMER_MIGRATION_SQL.split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await db.prepare(stmt).run();
    }
    d1SchemaReady = true;
  }
  return db;
}

/* --------------------------------------------------------------- hashing */

/** Session/reset bearer values are never stored raw. */
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('base64url');
}

export function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

/* -------------------------------------------------------------- customers */

export async function findCustomerByEmail(email) {
  const normalized = normalizeEmail(email);
  const db = await d1();
  if (db) {
    return db
      .prepare('SELECT * FROM customers WHERE email_normalized = ?')
      .bind(normalized)
      .first();
  }
  const data = readFile();
  return data.customers.find((c) => c.email_normalized === normalized) || null;
}

export async function getCustomerById(id) {
  if (!id) return null;
  const db = await d1();
  if (db) {
    return db.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
  }
  const data = readFile();
  return data.customers.find((c) => c.id === id) || null;
}

/**
 * Create a customer. Returns `{ ok: false, reason: 'email_taken' }` instead of
 * throwing when the address already exists, so the caller can decide how much
 * to disclose.
 */
export async function createCustomer({ email, name, passwordHash, status = 'active' }) {
  const normalized = normalizeEmail(email);
  const existing = await findCustomerByEmail(normalized);
  if (existing) return { ok: false, reason: 'email_taken' };

  const row = {
    id: newId('cus'),
    email: String(email).trim(),
    email_normalized: normalized,
    name: name ? String(name).trim().slice(0, 120) : null,
    password_hash: passwordHash,
    status,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const db = await d1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO customers
           (id, email, email_normalized, name, password_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        row.id,
        row.email,
        row.email_normalized,
        row.name,
        row.password_hash,
        row.status,
        row.created_at,
        row.updated_at
      )
      .run();
    return { ok: true, customer: row };
  }

  const data = readFile();
  data.customers.push(row);
  writeFile(data);
  return { ok: true, customer: row };
}

export async function updateCustomerPassword(customerId, passwordHash) {
  const db = await d1();
  if (db) {
    await db
      .prepare('UPDATE customers SET password_hash = ?, updated_at = ? WHERE id = ?')
      .bind(passwordHash, nowIso(), customerId)
      .run();
    return true;
  }
  const data = readFile();
  const row = data.customers.find((c) => c.id === customerId);
  if (!row) return false;
  row.password_hash = passwordHash;
  row.updated_at = nowIso();
  writeFile(data);
  return true;
}

/* --------------------------------------------------------------- sessions */

export async function createSessionRecord({ tokenHash, customerId, kind = 'session', ttlMs }) {
  const row = {
    token_hash: tokenHash,
    customer_id: customerId,
    kind,
    created_at: nowIso(),
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
    last_seen_at: null
  };

  const db = await d1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO customer_sessions
           (token_hash, customer_id, kind, created_at, expires_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        row.token_hash,
        row.customer_id,
        row.kind,
        row.created_at,
        row.expires_at,
        row.last_seen_at
      )
      .run();
    return row;
  }

  const data = readFile();
  data.customer_sessions.push(row);
  writeFile(data);
  return row;
}

/** Returns the session row when it exists, is not expired and matches `kind`. */
export async function getSessionRecord(tokenHash, kind = 'session') {
  if (!tokenHash) return null;
  const db = await d1();
  let row = null;
  if (db) {
    row = await db
      .prepare('SELECT * FROM customer_sessions WHERE token_hash = ? AND kind = ?')
      .bind(tokenHash, kind)
      .first();
  } else {
    const data = readFile();
    row =
      data.customer_sessions.find(
        (s) => s.token_hash === tokenHash && s.kind === kind
      ) || null;
  }
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteSessionRecord(tokenHash);
    return null;
  }
  return row;
}

export async function touchSessionRecord(tokenHash) {
  const db = await d1();
  if (db) {
    await db
      .prepare('UPDATE customer_sessions SET last_seen_at = ? WHERE token_hash = ?')
      .bind(nowIso(), tokenHash)
      .run();
    return;
  }
  const data = readFile();
  const row = data.customer_sessions.find((s) => s.token_hash === tokenHash);
  if (row) {
    row.last_seen_at = nowIso();
    writeFile(data);
  }
}

export async function deleteSessionRecord(tokenHash) {
  const db = await d1();
  if (db) {
    await db.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').bind(tokenHash).run();
    return;
  }
  const data = readFile();
  data.customer_sessions = data.customer_sessions.filter((s) => s.token_hash !== tokenHash);
  writeFile(data);
}

/** Used on password change/reset: every existing grant for that customer dies. */
export async function deleteSessionsForCustomer(customerId, kind = null) {
  const db = await d1();
  if (db) {
    if (kind) {
      await db
        .prepare('DELETE FROM customer_sessions WHERE customer_id = ? AND kind = ?')
        .bind(customerId, kind)
        .run();
    } else {
      await db
        .prepare('DELETE FROM customer_sessions WHERE customer_id = ?')
        .bind(customerId)
        .run();
    }
    return;
  }
  const data = readFile();
  data.customer_sessions = data.customer_sessions.filter((s) => {
    if (s.customer_id !== customerId) return true;
    if (kind && s.kind !== kind) return true;
    return false;
  });
  writeFile(data);
}

/* -------------------------------------------------------------- favorites */

export async function listFavorites(customerId) {
  if (!customerId) return [];
  const db = await d1();
  if (db) {
    const { results } = await db
      .prepare('SELECT product_id, created_at FROM favorites WHERE customer_id = ? ORDER BY created_at DESC')
      .bind(customerId)
      .all();
    return results || [];
  }
  const data = readFile();
  return data.favorites
    .filter((f) => f.customer_id === customerId)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function addFavorite(customerId, productId) {
  const db = await d1();
  if (db) {
    await db
      .prepare('INSERT OR IGNORE INTO favorites (customer_id, product_id, created_at) VALUES (?, ?, ?)')
      .bind(customerId, productId, nowIso())
      .run();
    return true;
  }
  const data = readFile();
  const exists = data.favorites.some(
    (f) => f.customer_id === customerId && f.product_id === productId
  );
  if (!exists) {
    data.favorites.push({ customer_id: customerId, product_id: productId, created_at: nowIso() });
    writeFile(data);
  }
  return true;
}

export async function removeFavorite(customerId, productId) {
  const db = await d1();
  if (db) {
    await db
      .prepare('DELETE FROM favorites WHERE customer_id = ? AND product_id = ?')
      .bind(customerId, productId)
      .run();
    return true;
  }
  const data = readFile();
  data.favorites = data.favorites.filter(
    (f) => !(f.customer_id === customerId && f.product_id === productId)
  );
  writeFile(data);
  return true;
}

/** Test helper: forget the memoised D1 schema flag. */
export function resetCustomerStoreForTests() {
  d1SchemaReady = false;
  memory = null;
  fileWritable = null;
}
