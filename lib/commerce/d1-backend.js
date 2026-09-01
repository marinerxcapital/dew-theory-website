/**
 * Cloudflare D1 durable commerce backend.
 * Activated when DEW_THEORY_D1 binding is available via OpenNext context.
 */
import { fromJson, newId, nowIso, toJson } from './schema.js';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS fulfillment_jobs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  supplier TEXT NOT NULL DEFAULT 'skin_script',
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_attempt_at TEXT,
  locked_at TEXT,
  locked_by TEXT,
  started_at TEXT,
  completed_at TEXT,
  error_code TEXT,
  error_message TEXT,
  supplier_order_id TEXT,
  idempotency_key TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(order_id, supplier)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillment_idempotency ON fulfillment_jobs(idempotency_key);
CREATE TABLE IF NOT EXISTS fulfillment_attempts (
  id TEXT PRIMARY KEY,
  fulfillment_job_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  stage TEXT,
  result TEXT,
  error_code TEXT,
  error_summary TEXT,
  supplier_order_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  metadata TEXT
);
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  payload TEXT,
  at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS supplier_mappings (
  product_id TEXT PRIMARY KEY,
  skin_script_sku TEXT NOT NULL,
  supplier_product_url TEXT,
  supplier_product_name TEXT,
  supplier_size TEXT,
  variant TEXT,
  expected_wholesale_price REAL,
  verified INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS supplier_order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  fulfillment_job_id TEXT,
  supplier_order_id TEXT,
  event_type TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS hmac_nonces (
  nonce TEXT PRIMARY KEY,
  seen_at TEXT NOT NULL
);
`;

let schemaReady = false;

async function ensureSchema(db) {
  if (schemaReady) return;
  const statements = MIGRATION_SQL.split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await db.prepare(stmt).run();
  }
  schemaReady = true;
}

function rowOrder(row) {
  const payload = fromJson(row.payload, {});
  return { ...payload, id: row.id, status: row.status };
}

export function getD1Backend(db) {
  if (!db) throw new Error('D1 database binding required');

  return {
    name: 'd1',

    async ready() {
      await ensureSchema(db);
      return true;
    },

    async getOrder(id) {
      await ensureSchema(db);
      const row = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      return row ? rowOrder(row) : null;
    },

    async upsertOrder(order) {
      await ensureSchema(db);
      const ts = nowIso();
      await db
        .prepare(
          `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent_id, status, payload, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             stripe_session_id=excluded.stripe_session_id,
             stripe_payment_intent_id=excluded.stripe_payment_intent_id,
             status=excluded.status,
             payload=excluded.payload,
             updated_at=excluded.updated_at`
        )
        .bind(
          order.id,
          order.stripe_session_id || null,
          order.stripe_payment_intent || null,
          order.status,
          toJson(order),
          order.created_at || ts,
          ts
        )
        .run();
      return order;
    },

    async findOrderByStripeSession(sessionId) {
      await ensureSchema(db);
      const row = await db
        .prepare('SELECT * FROM orders WHERE stripe_session_id = ?')
        .bind(sessionId)
        .first();
      return row ? rowOrder(row) : null;
    },

    async listOrders() {
      await ensureSchema(db);
      const { results } = await db
        .prepare('SELECT * FROM orders ORDER BY created_at DESC')
        .all();
      return (results || []).map(rowOrder);
    },

    async getFulfillmentJob(id) {
      await ensureSchema(db);
      const row = await db.prepare('SELECT * FROM fulfillment_jobs WHERE id = ?').bind(id).first();
      if (!row) return null;
      return { ...row, payload: fromJson(row.payload, null) };
    },

    async getFulfillmentJobByOrder(orderId, supplier = 'skin_script') {
      await ensureSchema(db);
      const row = await db
        .prepare('SELECT * FROM fulfillment_jobs WHERE order_id = ? AND supplier = ?')
        .bind(orderId, supplier)
        .first();
      if (!row) return null;
      return { ...row, payload: fromJson(row.payload, null) };
    },

    async upsertFulfillmentJob(job) {
      await ensureSchema(db);
      const ts = nowIso();
      const id = job.id || newId('fj');
      await db
        .prepare(
          `INSERT INTO fulfillment_jobs (
            id, order_id, supplier, status, attempt_count, max_attempts, next_attempt_at,
            locked_at, locked_by, started_at, completed_at, error_code, error_message,
            supplier_order_id, idempotency_key, payload, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(order_id, supplier) DO UPDATE SET
            status=excluded.status,
            attempt_count=excluded.attempt_count,
            max_attempts=excluded.max_attempts,
            next_attempt_at=excluded.next_attempt_at,
            locked_at=excluded.locked_at,
            locked_by=excluded.locked_by,
            started_at=excluded.started_at,
            completed_at=excluded.completed_at,
            error_code=excluded.error_code,
            error_message=excluded.error_message,
            supplier_order_id=excluded.supplier_order_id,
            payload=excluded.payload,
            updated_at=excluded.updated_at`
        )
        .bind(
          id,
          job.order_id,
          job.supplier || 'skin_script',
          job.status,
          job.attempt_count ?? 0,
          job.max_attempts ?? 3,
          job.next_attempt_at || null,
          job.locked_at || null,
          job.locked_by || null,
          job.started_at || null,
          job.completed_at || null,
          job.error_code || null,
          job.error_message || null,
          job.supplier_order_id || null,
          job.idempotency_key,
          toJson(job.payload ?? null),
          job.created_at || ts,
          ts
        )
        .run();
      return this.getFulfillmentJob(id);
    },

    async createFulfillmentAttempt(attempt) {
      await ensureSchema(db);
      const id = attempt.id || newId('fa');
      await db
        .prepare(
          `INSERT INTO fulfillment_attempts (
            id, fulfillment_job_id, attempt_number, stage, result, error_code,
            error_summary, supplier_order_id, started_at, ended_at, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          attempt.fulfillment_job_id,
          attempt.attempt_number,
          attempt.stage || null,
          attempt.result || null,
          attempt.error_code || null,
          attempt.error_summary || null,
          attempt.supplier_order_id || null,
          attempt.started_at,
          attempt.ended_at || null,
          toJson(attempt.metadata ?? null)
        )
        .run();
      return { ...attempt, id, metadata: attempt.metadata ?? null };
    },

    async listFulfillmentAttempts(jobId) {
      await ensureSchema(db);
      const { results } = await db
        .prepare(
          'SELECT * FROM fulfillment_attempts WHERE fulfillment_job_id = ? ORDER BY attempt_number ASC'
        )
        .bind(jobId)
        .all();
      return (results || []).map((a) => ({ ...a, metadata: fromJson(a.metadata, null) }));
    },

    async listFulfillmentJobs({ status, limit = 200 } = {}) {
      await ensureSchema(db);
      let sql = 'SELECT * FROM fulfillment_jobs';
      const binds = [];
      if (status) {
        sql += ' WHERE status = ?';
        binds.push(status);
      }
      sql += ' ORDER BY updated_at DESC LIMIT ?';
      binds.push(limit);
      const { results } = await db.prepare(sql).bind(...binds).all();
      return (results || []).map((row) => ({
        ...row,
        payload: fromJson(row.payload, null)
      }));
    },

    async listWebhookEvents({ limit = 50 } = {}) {
      await ensureSchema(db);
      const { results } = await db
        .prepare('SELECT * FROM webhook_events ORDER BY at DESC LIMIT ?')
        .bind(limit)
        .all();
      return results || [];
    },

    async listAuditLog({ limit = 100 } = {}) {
      await ensureSchema(db);
      const { results } = await db
        .prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?')
        .bind(limit)
        .all();
      return (results || []).map((r) => ({ ...r, diff: fromJson(r.diff, null) }));
    },

    async getWebhookEvent(id) {
      await ensureSchema(db);
      return db.prepare('SELECT * FROM webhook_events WHERE id = ?').bind(id).first();
    },

    async upsertWebhookEvent(event) {
      await ensureSchema(db);
      await db
        .prepare(
          `INSERT INTO webhook_events (id, type, processed, payload, at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET type=excluded.type, at=excluded.at`
        )
        .bind(event.id, event.type, event.processed ? 1 : 0, toJson(event.payload ?? null), event.at)
        .run();
      return event;
    },

    async markWebhookProcessed(id) {
      await ensureSchema(db);
      await db.prepare('UPDATE webhook_events SET processed = 1 WHERE id = ?').bind(id).run();
    },

    async getSupplierMapping(productId) {
      await ensureSchema(db);
      return db.prepare('SELECT * FROM supplier_mappings WHERE product_id = ?').bind(productId).first();
    },

    async listSupplierMappings({ activeOnly = true } = {}) {
      await ensureSchema(db);
      const sql = activeOnly
        ? 'SELECT * FROM supplier_mappings WHERE active = 1'
        : 'SELECT * FROM supplier_mappings';
      const { results } = await db.prepare(sql).all();
      return results || [];
    },

    async upsertSupplierMapping(mapping) {
      await ensureSchema(db);
      const ts = nowIso();
      await db
        .prepare(
          `INSERT INTO supplier_mappings (
            product_id, skin_script_sku, supplier_product_url, supplier_product_name,
            supplier_size, variant, expected_wholesale_price, verified, verified_at, active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(product_id) DO UPDATE SET
            skin_script_sku=excluded.skin_script_sku,
            supplier_product_url=excluded.supplier_product_url,
            supplier_product_name=excluded.supplier_product_name,
            supplier_size=excluded.supplier_size,
            variant=excluded.variant,
            expected_wholesale_price=excluded.expected_wholesale_price,
            verified=excluded.verified,
            verified_at=excluded.verified_at,
            active=excluded.active,
            updated_at=excluded.updated_at`
        )
        .bind(
          mapping.product_id,
          mapping.skin_script_sku,
          mapping.supplier_product_url || null,
          mapping.supplier_product_name || null,
          mapping.supplier_size || null,
          mapping.variant || null,
          mapping.expected_wholesale_price ?? null,
          mapping.verified ? 1 : 0,
          mapping.verified_at || null,
          mapping.active === false ? 0 : 1,
          ts
        )
        .run();
      return this.getSupplierMapping(mapping.product_id);
    },

    async recordSupplierOrderEvent(evt) {
      await ensureSchema(db);
      const id = evt.id || newId('soe');
      await db
        .prepare(
          `INSERT INTO supplier_order_events (id, order_id, fulfillment_job_id, supplier_order_id, event_type, payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          evt.order_id,
          evt.fulfillment_job_id || null,
          evt.supplier_order_id || null,
          evt.event_type,
          toJson(evt.payload ?? null),
          evt.created_at || nowIso()
        )
        .run();
      return { ...evt, id };
    },

    async recordNonce(nonce) {
      await ensureSchema(db);
      await db
        .prepare('INSERT OR IGNORE INTO hmac_nonces (nonce, seen_at) VALUES (?, ?)')
        .bind(nonce, nowIso())
        .run();
    },

    async hasNonce(nonce) {
      await ensureSchema(db);
      const row = await db.prepare('SELECT nonce FROM hmac_nonces WHERE nonce = ?').bind(nonce).first();
      return Boolean(row);
    },

    async audit(adminId, action, entity, entityId, diff = null) {
      await ensureSchema(db);
      const id = newId('aud');
      await db
        .prepare(
          'INSERT INTO audit_log (id, admin_id, action, entity, entity_id, diff, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(id, adminId, action, entity, entityId, toJson(diff), nowIso())
        .run();
    }
  };
}
