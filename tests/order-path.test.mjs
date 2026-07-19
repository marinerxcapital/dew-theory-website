/**
 * E5 — Cart → order → admin status path (offline, no HTTP server).
 * Exercises catalog re-price, order write, status transition, audit.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateAndPriceItems, priceCart } from '../lib/checkout.js';
import { resolveDiscountCode } from '../lib/discounts.js';
import { SEED_PRODUCTS } from '../lib/products.js';
import { mutateStore, readStore, audit } from '../lib/store.js';

describe('order path — cart → paid order → fulfillment status', () => {
  it('re-prices cart lines from catalog and rejects client unit_price', () => {
    const raw = [
      {
        product_id: 'green-tea-citrus-cleanser',
        quantity: 1,
        unit_price: 1 // malicious client price — must be ignored
      },
      {
        product_id: 'ageless-moisturizer',
        quantity: 1,
        unit_price: 999
      }
    ];
    const priced = validateAndPriceItems(raw, SEED_PRODUCTS);
    assert.equal(priced.ok, true);
    assert.equal(priced.items[0].unit_price, 32);
    assert.equal(priced.items[1].unit_price, 24);
    const totals = priceCart(priced.items, null);
    assert.equal(totals.subtotal, 56);
    assert.equal(totals.shipping_fee, 0); // free at $49+
    assert.equal(totals.total, 56);
  });

  it('rejects unknown SKU', () => {
    const priced = validateAndPriceItems(
      [{ product_id: 'not-a-real-sku', quantity: 1 }],
      SEED_PRODUCTS
    );
    assert.equal(priced.ok, false);
    assert.equal(priced.code, 'unknown_sku');
  });

  it('requires variant for lip treatment', () => {
    const priced = validateAndPriceItems(
      [{ product_id: 'lip-treatment-peppermint-pomegranate', quantity: 1 }],
      SEED_PRODUCTS
    );
    assert.equal(priced.ok, false);
    assert.equal(priced.code, 'variant_required');
  });

  it('writes mock paid order and transitions admin fulfillment status', () => {
    const priced = validateAndPriceItems(
      [
        {
          product_id: 'green-tea-citrus-cleanser',
          quantity: 1
        }
      ],
      SEED_PRODUCTS
    );
    assert.equal(priced.ok, true);

    const dew = resolveDiscountCode('dew15', readStore().discount_codes || []);
    // DEW15 may exist in seed store
    const discount = dew.ok ? dew.discount : null;
    const totals = priceCart(priced.items, discount);

    const orderId = `ord_smoke_${Date.now()}`;
    mutateStore((s) => {
      s.orders.unshift({
        id: orderId,
        customer: { name: 'Smoke Test', email: 'smoke@example.com', phone: '' },
        items: priced.items,
        ...totals,
        status: 'paid',
        shipping_address: {
          line1: '1 Test St',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'US'
        },
        source: 'order_path_test',
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
      });
      return s;
    });

    let found = readStore().orders.find((o) => o.id === orderId);
    assert.ok(found);
    assert.equal(found.status, 'paid');
    assert.equal(found.items[0].unit_price, 32);

    // Admin status transition (same mutation path as PATCH /api/admin/orders/[id])
    const before = found.status;
    mutateStore((s) => {
      const idx = s.orders.findIndex((o) => o.id === orderId);
      s.orders[idx] = {
        ...s.orders[idx],
        status: 'submitted_to_skin_script'
      };
      return s;
    });
    audit('adm_owner', 'order.status_update', 'Orders', orderId, {
      before,
      after: 'submitted_to_skin_script'
    });

    found = readStore().orders.find((o) => o.id === orderId);
    assert.equal(found.status, 'submitted_to_skin_script');

    const log = readStore().audit_log.find(
      (a) => a.entity_id === orderId && a.action === 'order.status_update'
    );
    assert.ok(log);
    assert.equal(log.diff.after, 'submitted_to_skin_script');
  });
});
