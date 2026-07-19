/**
 * File-backed data store mirroring Supabase tables (Products, Orders, etc.).
 * Swap for Supabase client once project keys land — schema already matches Addendum 9A.
 * Server-only: do not import from client components.
 */
import fs from 'fs';
import path from 'path';
import catalog from '../data/products.json' with { type: 'json' };

const DATA_DIR = path.join(process.cwd(), 'data', 'runtime');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

function seed() {
  const now = new Date().toISOString();
  return {
    products: catalog.products.map((p) => ({
      ...p,
      stock_status: p.stock_status || 'in_stock',
      source: p.source || 'manual',
      skin_script_sku: p.skin_script_sku || null,
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
    ]
  };
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    // Seed only if missing — never wipe live runtime data
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed(), null, 2));
  }
}

/**
 * Read store with corrupt-JSON recovery.
 * On parse failure: rename broken file to .corrupt.<ts>, re-seed empty structure.
 * Does not delete the corrupt backup.
 */
export function readStore() {
  ensure();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('store root not object');
    // Ensure expected arrays exist (soft heal without wipe)
    for (const key of [
      'products',
      'orders',
      'appointments',
      'discount_codes',
      'admins',
      'audit_log',
      'events'
    ]) {
      if (!Array.isArray(data[key])) data[key] = [];
    }
    return data;
  } catch (err) {
    const bak = `${STORE_PATH}.corrupt.${Date.now()}`;
    try {
      if (fs.existsSync(STORE_PATH)) fs.renameSync(STORE_PATH, bak);
    } catch {
      // ignore rename failure
    }
    const fresh = seed();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2));
    console.error('[store] corrupt JSON recovered; backup at', bak, err?.message || err);
    return fresh;
  }
}

/** Atomic write: temp file in same dir + rename. */
export function writeStore(data) {
  ensure();
  const tmp = path.join(DATA_DIR, `store.${process.pid}.${Date.now()}.tmp`);
  const json = JSON.stringify(data, null, 2);
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
