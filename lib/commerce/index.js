/**
 * Durable commerce persistence facade.
 * Prefers Cloudflare D1 when binding available; file backend for local dev/CI.
 */
import { getFileBackend } from './file-backend.js';
import { getD1Backend } from './d1-backend.js';

/** @type {ReturnType<typeof getFileBackend> | null} */
let cachedBackend = null;

async function resolveD1Binding() {
  if (process.env.STORE_BACKEND === 'file') return null;
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext({ async: true });
    const db = ctx?.env?.DEW_THEORY_D1;
    if (db) return db;
  } catch {
    /* not on Workers or OpenNext unavailable */
  }
  return null;
}

export async function getCommerceBackend() {
  if (cachedBackend) return cachedBackend;

  const d1 = await resolveD1Binding();
  if (d1) {
    cachedBackend = getD1Backend(d1);
  } else {
    cachedBackend = getFileBackend();
  }
  await cachedBackend.ready();
  return cachedBackend;
}

/** Test helper — force file backend */
export function resetCommerceBackendForTests() {
  cachedBackend = null;
}

export async function commerceUpsertOrder(order) {
  const db = await getCommerceBackend();
  return db.upsertOrder(order);
}

export async function commerceGetOrder(id) {
  const db = await getCommerceBackend();
  return db.getOrder(id);
}

export async function commerceFindOrderByStripeSession(sessionId) {
  const db = await getCommerceBackend();
  return db.findOrderByStripeSession(sessionId);
}

export async function commerceListOrders() {
  const db = await getCommerceBackend();
  return db.listOrders();
}

export async function commerceUpsertFulfillmentJob(job) {
  const db = await getCommerceBackend();
  return db.upsertFulfillmentJob(job);
}

export async function commerceGetFulfillmentJob(id) {
  const db = await getCommerceBackend();
  return db.getFulfillmentJob(id);
}

export async function commerceGetFulfillmentJobByOrder(orderId, supplier = 'skin_script') {
  const db = await getCommerceBackend();
  return db.getFulfillmentJobByOrder(orderId, supplier);
}

export async function commerceCreateFulfillmentAttempt(attempt) {
  const db = await getCommerceBackend();
  return db.createFulfillmentAttempt(attempt);
}

export async function commerceListFulfillmentAttempts(jobId) {
  const db = await getCommerceBackend();
  return db.listFulfillmentAttempts(jobId);
}

export async function commerceGetWebhookEvent(id) {
  const db = await getCommerceBackend();
  return db.getWebhookEvent(id);
}

export async function commerceUpsertWebhookEvent(event) {
  const db = await getCommerceBackend();
  return db.upsertWebhookEvent(event);
}

export async function commerceMarkWebhookProcessed(id) {
  const db = await getCommerceBackend();
  return db.markWebhookProcessed(id);
}

export async function commerceGetSupplierMapping(productId) {
  const db = await getCommerceBackend();
  return db.getSupplierMapping(productId);
}

export async function commerceListSupplierMappings(opts) {
  const db = await getCommerceBackend();
  return db.listSupplierMappings(opts);
}

export async function commerceUpsertSupplierMapping(mapping) {
  const db = await getCommerceBackend();
  return db.upsertSupplierMapping(mapping);
}

export async function commerceRecordSupplierOrderEvent(evt) {
  const db = await getCommerceBackend();
  return db.recordSupplierOrderEvent(evt);
}

export async function commerceAudit(adminId, action, entity, entityId, diff) {
  const db = await getCommerceBackend();
  return db.audit(adminId, action, entity, entityId, diff);
}

export async function commerceHasNonce(nonce) {
  const db = await getCommerceBackend();
  return db.hasNonce(nonce);
}

export async function commerceRecordNonce(nonce) {
  const db = await getCommerceBackend();
  return db.recordNonce(nonce);
}
