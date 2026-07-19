#!/usr/bin/env node
/**
 * HTTP smoke: cart checkout (mock) → admin login → order status update.
 *
 * Prerequisites: app running (`npm run dev` or `npm start`)
 *
 *   node scripts/smoke-checkout.mjs
 *   BASE_URL=http://localhost:3000 node scripts/smoke-checkout.mjs
 *
 * Exit 0 on success; non-zero on failure.
 */

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dewtheory.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dew-admin-dev';

function fail(msg, detail) {
  console.error('FAIL:', msg);
  if (detail) console.error(detail);
  process.exit(1);
}

function ok(msg) {
  console.log('  ✓', msg);
}

async function main() {
  console.log(`Smoke checkout path → ${BASE}\n`);

  // 0. Health
  let res = await fetch(`${BASE}/shop`).catch((e) => fail('Server not reachable', e.message));
  if (!res.ok) fail(`GET /shop → ${res.status}`);
  ok('storefront responds');

  // 1. Mock checkout (no Stripe key expected in local)
  const idem = `smoke_${Date.now()}`;
  res = await fetch(`${BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idem,
      Origin: BASE
    },
    body: JSON.stringify({
      idempotency_key: idem,
      items: [
        { product_id: 'green-tea-citrus-cleanser', quantity: 1 },
        { product_id: 'ageless-moisturizer', quantity: 1 }
      ],
      discount_code: 'DEW15',
      customer: {
        name: 'Smoke Tester',
        email: 'smoke@dewtheory.test',
        phone: '555-0100'
      },
      shipping_address: {
        line1: '100 Pearl Ave',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        country: 'US'
      }
    })
  });
  const checkout = await res.json();
  if (!res.ok) fail(`POST /api/checkout → ${res.status}`, checkout);
  if (!checkout.order_id) fail('checkout missing order_id', checkout);
  ok(`checkout mock order ${checkout.order_id} (mock=${Boolean(checkout.mock)})`);
  if (checkout.totals) {
    ok(
      `totals subtotal=${checkout.totals.subtotal} ship=${checkout.totals.shipping_fee} total=${checkout.totals.total}`
    );
  }

  // 2. Idempotent replay
  res = await fetch(`${BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idem,
      Origin: BASE
    },
    body: JSON.stringify({
      idempotency_key: idem,
      items: [{ product_id: 'green-tea-citrus-cleanser', quantity: 1 }],
      customer: { name: 'X', email: 'x@y.com' },
      shipping_address: {
        line1: '1',
        city: 'A',
        state: 'TX',
        postal_code: '78701',
        country: 'US'
      }
    })
  });
  const replay = await res.json();
  if (!res.ok) fail('idempotent replay failed', replay);
  if (replay.order_id !== checkout.order_id) {
    fail('idempotency returned different order_id', { checkout, replay });
  }
  ok('idempotency key replayed same order_id');

  // 3. Admin login
  res = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const login = await res.json();
  if (!res.ok) fail(`admin login → ${res.status}`, login);
  const setCookie = res.headers.getSetCookie?.() || [];
  const cookieHeader =
    setCookie.map((c) => c.split(';')[0]).join('; ') ||
    (res.headers.get('set-cookie') || '').split(',').map((c) => c.split(';')[0].trim()).join('; ');
  if (!cookieHeader.includes('dew_admin_session')) {
    fail('admin session cookie missing', { setCookie, cookieHeader });
  }
  ok('admin login cookie set');

  // 4. Patch order status (fulfillment)
  res = await fetch(`${BASE}/api/admin/orders/${checkout.order_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE,
      Cookie: cookieHeader
    },
    body: JSON.stringify({ status: 'submitted_to_skin_script' })
  });
  const patched = await res.json();
  if (!res.ok) fail(`PATCH order → ${res.status}`, patched);
  if (patched.order?.status !== 'submitted_to_skin_script') {
    fail('status not updated', patched);
  }
  ok('admin marked order submitted_to_skin_script');

  console.log('\nPASS — cart → order → admin status path');
}

main().catch((e) => fail(e.message || String(e)));
