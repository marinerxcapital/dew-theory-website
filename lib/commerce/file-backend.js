/**
 * File-backed durable commerce store for local dev and CI.
 * Survives process restarts; mirrors D1 schema shape.
 */
import fs from 'fs';
import path from 'path';
import { fromJson, newId, nowIso, toJson } from './schema.js';

const DATA_DIR = path.join(process.cwd(), 'data', 'runtime');
const COMMERCE_PATH = path.join(DATA_DIR, 'commerce.json');

function emptyCommerce() {
  return {
    orders: {},
    fulfillment_jobs: {},
    fulfillment_attempts: {},
    webhook_events: {},
    supplier_mappings: {},
    supplier_order_events: {},
    audit_log: {},
    hmac_nonces: {}
  };
}

function readRaw() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(COMMERCE_PATH)) {
      fs.writeFileSync(COMMERCE_PATH, JSON.stringify(emptyCommerce(), null, 2));
    }
    return JSON.parse(fs.readFileSync(COMMERCE_PATH, 'utf8'));
  } catch {
    return emptyCommerce();
  }
}

function writeRaw(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = path.join(DATA_DIR, `commerce.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  try {
    fs.renameSync(tmp, COMMERCE_PATH);
  } catch {
    try {
      fs.unlinkSync(COMMERCE_PATH);
    } catch {
      /* ignore */
    }
    fs.renameSync(tmp, COMMERCE_PATH);
  }
}

export function getFileBackend() {
  return {
    name: 'file',
    async ready() {
      readRaw();
      return true;
    },

    async getOrder(id) {
      const db = readRaw();
      const row = db.orders[id];
      if (!row) return null;
      return { ...fromJson(row.payload, {}), id: row.id, status: row.status };
    },

    async upsertOrder(order) {
      const db = readRaw();
      const ts = nowIso();
      db.orders[order.id] = {
        id: order.id,
        stripe_session_id: order.stripe_session_id || null,
        stripe_payment_intent_id: order.stripe_payment_intent || null,
        status: order.status,
        payload: toJson(order),
        created_at: order.created_at || ts,
        updated_at: ts
      };
      writeRaw(db);
      return order;
    },

    async findOrderByStripeSession(sessionId) {
      const db = readRaw();
      for (const row of Object.values(db.orders)) {
        if (row.stripe_session_id === sessionId) {
          return { ...fromJson(row.payload, {}), id: row.id, status: row.status };
        }
      }
      return null;
    },

    async listOrders() {
      const db = readRaw();
      return Object.values(db.orders)
        .map((row) => ({ ...fromJson(row.payload, {}), id: row.id, status: row.status }))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    },

    async getFulfillmentJob(id) {
      const db = readRaw();
      const row = db.fulfillment_jobs[id];
      if (!row) return null;
      return { ...row, payload: fromJson(row.payload, null) };
    },

    async getFulfillmentJobByOrder(orderId, supplier = 'skin_script') {
      const db = readRaw();
      return (
        Object.values(db.fulfillment_jobs).find(
          (j) => j.order_id === orderId && j.supplier === supplier
        ) || null
      );
    },

    async upsertFulfillmentJob(job) {
      const db = readRaw();
      const ts = nowIso();
      const existing = Object.values(db.fulfillment_jobs).find(
        (j) => j.order_id === job.order_id && j.supplier === (job.supplier || 'skin_script')
      );
      const id = job.id || existing?.id || newId('fj');
      db.fulfillment_jobs[id] = {
        ...job,
        id,
        supplier: job.supplier || 'skin_script',
        payload: toJson(job.payload ?? null),
        updated_at: ts,
        created_at: job.created_at || existing?.created_at || ts
      };
      writeRaw(db);
      return { ...db.fulfillment_jobs[id], payload: fromJson(db.fulfillment_jobs[id].payload, null) };
    },

    async createFulfillmentAttempt(attempt) {
      const db = readRaw();
      const id = attempt.id || newId('fa');
      db.fulfillment_attempts[id] = {
        ...attempt,
        id,
        metadata: toJson(attempt.metadata ?? null)
      };
      writeRaw(db);
      return { ...db.fulfillment_attempts[id], metadata: fromJson(db.fulfillment_attempts[id].metadata, null) };
    },

    async listFulfillmentAttempts(jobId) {
      const db = readRaw();
      return Object.values(db.fulfillment_attempts)
        .filter((a) => a.fulfillment_job_id === jobId)
        .map((a) => ({ ...a, metadata: fromJson(a.metadata, null) }))
        .sort((a, b) => a.attempt_number - b.attempt_number);
    },

    async listFulfillmentJobs({ status, limit = 200 } = {}) {
      const db = readRaw();
      let jobs = Object.values(db.fulfillment_jobs);
      if (status) jobs = jobs.filter((j) => j.status === status);
      return jobs
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .slice(0, limit)
        .map((row) => ({ ...row, payload: fromJson(row.payload, null) }));
    },

    async listWebhookEvents({ limit = 50 } = {}) {
      const db = readRaw();
      return Object.values(db.webhook_events)
        .sort((a, b) => String(b.at).localeCompare(String(a.at)))
        .slice(0, limit);
    },

    async listAuditLog({ limit = 100 } = {}) {
      const db = readRaw();
      return Object.values(db.audit_log)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, limit)
        .map((r) => ({ ...r, diff: fromJson(r.diff, null) }));
    },

    async getWebhookEvent(id) {
      const db = readRaw();
      return db.webhook_events[id] || null;
    },

    async upsertWebhookEvent(event) {
      const db = readRaw();
      db.webhook_events[event.id] = {
        ...event,
        payload: toJson(event.payload ?? null)
      };
      writeRaw(db);
      return db.webhook_events[event.id];
    },

    async markWebhookProcessed(id) {
      const db = readRaw();
      if (db.webhook_events[id]) {
        db.webhook_events[id].processed = 1;
        writeRaw(db);
      }
    },

    async getSupplierMapping(productId) {
      const db = readRaw();
      return db.supplier_mappings[productId] || null;
    },

    async listSupplierMappings({ activeOnly = true } = {}) {
      const db = readRaw();
      return Object.values(db.supplier_mappings).filter((m) => !activeOnly || m.active !== 0);
    },

    async upsertSupplierMapping(mapping) {
      const db = readRaw();
      const ts = nowIso();
      db.supplier_mappings[mapping.product_id] = {
        ...mapping,
        updated_at: ts
      };
      writeRaw(db);
      return db.supplier_mappings[mapping.product_id];
    },

    async recordSupplierOrderEvent(evt) {
      const db = readRaw();
      const id = evt.id || newId('soe');
      db.supplier_order_events[id] = {
        ...evt,
        id,
        payload: toJson(evt.payload ?? null),
        created_at: evt.created_at || nowIso()
      };
      writeRaw(db);
      return db.supplier_order_events[id];
    },

    async recordNonce(nonce) {
      const db = readRaw();
      db.hmac_nonces[nonce] = { nonce, seen_at: nowIso() };
      const keys = Object.keys(db.hmac_nonces);
      if (keys.length > 5000) {
        for (const k of keys.slice(0, keys.length - 5000)) delete db.hmac_nonces[k];
      }
      writeRaw(db);
    },

    async hasNonce(nonce) {
      const db = readRaw();
      return Boolean(db.hmac_nonces[nonce]);
    },

    async audit(adminId, action, entity, entityId, diff = null) {
      const db = readRaw();
      const id = newId('aud');
      db.audit_log[id] = {
        id,
        admin_id: adminId,
        action,
        entity,
        entity_id: entityId,
        diff: toJson(diff),
        created_at: nowIso()
      };
      writeRaw(db);
    }
  };
}
