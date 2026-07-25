/**
 * File-backed data store mirroring Supabase tables (Products, Orders, etc.).
 * Swap for Supabase client once project keys land — schema already matches Addendum 9A.
 * Server-only: do not import from client components.
 *
 * On Cloudflare Workers (read-only FS), falls back to in-memory store so the site
 * still works for browsing, cart, and mock checkout. Data is not durable across isolates.
 */
import fs from 'fs';
import path from 'path';
import catalog from '../data/products.json' with { type: 'json' };

const DATA_DIR = path.join(process.cwd(), 'data', 'runtime');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

/** @type {ReturnType<typeof seed> | null} */
let memoryStore = null;
/** @type {boolean | null} */
let fsWritable = null;

function seed() {
  const now = new Date().toISOString();
  return {
    products: catalog.products.map((p) => ({
      ...p,
      stock_status: p.stock_status || 'in_stock',
      source: p.source || 'manual',
      skin_script_sku:
        p.skin_script_sku ||
        `SS-${String(p.id).toUpperCase().replace(/-/g, '_')}`,
      images: p.images || [],
      active: p.active !== false
    })),
    orders: [
      {
        id: 'ord_seed_001',
        customer: { name: 'Test Customer', email: 'test@example.com', phone: '' },
        items: [
          {
            product_id: 'green-tea-citrus-cleanser',
            name: 'Green Tea Citrus Cleanser',
            quantity: 1,
            unit_price: 32,
            variant: null
          },
          {
            product_id: 'ageless-moisturizer',
            name: 'Ageless Moisturizer',
            quantity: 1,
            unit_price: 24,
            variant: null
          }
        ],
        subtotal: 56,
        shipping_fee: 0,
        discount_code: null,
        discount_amount: 0,
        total: 56,
        status: 'paid',
        shipping_address: {
          line1: '123 Pearl St',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'US'
        },
        created_at: now
      }
    ],
    appointments: [
      {
        id: 'apt_seed_001',
        service_id: 'signature-dew-facial',
        service_name: 'Signature Dew Facial',
        start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        price: 145,
        status: 'confirmed',
        customer: { name: 'Test Guest', email: 'guest@example.com', phone: '555-0100' },
        calendar_event_id: null,
        created_at: now
      }
    ],
    discount_codes: [
      {
        id: 'dc_launch',
        code: 'DEW15',
        type: 'percentage',
        value: 15,
        referrer_customer_id: null,
        max_uses: null,
        uses_count: 0,
        expires_at: null,
        active: true,
        stripe_promotion_code_id: null,
        created_at: now
      }
    ],
    admins: [
      {
        id: 'adm_owner',
        name: 'Emily Mitchener',
        email: process.env.ADMIN_EMAIL || 'admin@dewtheory.local',
        role: 'owner',
        // Password checked via ADMIN_PASSWORD env; never stored here in plain text for real deploys.
        auth_id: 'local',
        created_at: now
      }
    ],
    audit_log: [],
    events: [
      // Funnel seed for analytics
      { type: 'product_view', product_id: 'green-tea-citrus-cleanser', at: now },
      { type: 'add_to_cart', product_id: 'green-tea-citrus-cleanser', at: now },
      { type: 'checkout_started', at: now },
      { type: 'checkout_completed', order_id: 'ord_seed_001', at: now },
      { type: 'booking_started', at: now },
      { type: 'booking_service_selected', service_id: 'signature-dew-facial', at: now },
      { type: 'booking_time_selected', at: now },
      { type: 'booking_confirmed', appointment_id: 'apt_seed_001', at: now }
    ],
    consultations: [],
    consultation_photos: [],
    consultation_plans: [],
    outbound_emails: [],
    webhook_events: [],
    messages: []
  };
}

function cloneSeed() {
  return structuredClone(seed());
}

function heal(data) {
  for (const key of [
    'products',
    'orders',
    'appointments',
    'discount_codes',
    'admins',
    'audit_log',
    'events',
    'consultations',
    'consultation_photos',
    'consultation_plans',
    'outbound_emails',
    'webhook_events',
    'messages'
  ]) {
    if (!Array.isArray(data[key])) data[key] = [];
  }
  return data;
}

function useMemory(reason) {
  if (fsWritable !== false) {
    fsWritable = false;
    console.warn('[store] filesystem unavailable; using in-memory store', reason || '');
  }
  if (!memoryStore) memoryStore = cloneSeed();
  return memoryStore;
}

function ensure() {
  if (fsWritable === false) return false;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(STORE_PATH)) {
      // Seed only if missing — never wipe live runtime data
      fs.writeFileSync(STORE_PATH, JSON.stringify(seed(), null, 2));
    }
    fsWritable = true;
    return true;
  } catch (err) {
    useMemory(err?.message || err);
    return false;
  }
}

/**
 * Read store with corrupt-JSON recovery.
 * On parse failure: rename broken file to .corrupt.<ts>, re-seed empty structure.
 * Does not delete the corrupt backup.
 * Falls back to in-memory store when the filesystem is not writable (e.g. Workers).
 */
export function readStore() {
  if (!ensure()) {
    return heal(structuredClone(useMemory()));
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('store root not object');
    return heal(data);
  } catch (err) {
    const bak = `${STORE_PATH}.corrupt.${Date.now()}`;
    try {
      if (fs.existsSync(STORE_PATH)) fs.renameSync(STORE_PATH, bak);
    } catch {
      // ignore rename failure — may fall through to memory
    }
    try {
      const fresh = seed();
      fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2));
      console.error('[store] corrupt JSON recovered; backup at', bak, err?.message || err);
      return fresh;
    } catch (writeErr) {
      return heal(structuredClone(useMemory(writeErr?.message || writeErr)));
    }
  }
}

/** Atomic write: temp file in same dir + rename. Memory fallback on Workers. */
export function writeStore(data) {
  memoryStore = data;
  if (!ensure()) return;
  const tmp = path.join(DATA_DIR, `store.${process.pid}.${Date.now()}.tmp`);
  const json = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(tmp, json, 'utf8');
    try {
      fs.renameSync(tmp, STORE_PATH);
    } catch {
      // Windows: rename over existing may fail — unlink then rename
      try {
        fs.unlinkSync(STORE_PATH);
      } catch {
        // empty
      }
      fs.renameSync(tmp, STORE_PATH);
    }
  } catch (err) {
    useMemory(err?.message || err);
  }
}

export function mutateStore(fn) {
  const data = readStore();
  const next = fn(data) ?? data;
  writeStore(next);
  return next;
}

/**
 * Documented store API surface for future lib/store-supabase.js swap (H3).
 * Call sites use only: readStore, writeStore, mutateStore, audit, trackEvent.
 * No call-site changes required when swapping implementation.
 */
export const STORE_API = [
  'readStore',
  'writeStore',
  'mutateStore',
  'audit',
  'trackEvent'
];

export function audit(adminId, action, entity, entityId, diff = null) {
  mutateStore((s) => {
    s.audit_log.unshift({
      id: `aud_${Date.now()}`,
      admin_id: adminId,
      action,
      entity,
      entity_id: entityId,
      diff,
      created_at: new Date().toISOString()
    });
    return s;
  });
}

export function trackEvent(type, payload = {}) {
  mutateStore((s) => {
    s.events.push({ type, ...payload, at: new Date().toISOString() });
    return s;
  });
}
