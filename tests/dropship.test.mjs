/**
 * Dropship fulfill — idempotency, missing SKU, mock success
 */
import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import {
  fulfillOrder,
  resolveLineSku,
  sanitizeSupplierRaw,
  shouldAutoFulfill
} from '../lib/dropship/fulfill-order.js';
import { resetMockDropshipLedger } from '../lib/suppliers/skin-script/mock-adapter.js';
import { mutateStore, readStore } from '../lib/store.js';
import { ORDER_STATUSES } from '../lib/order-status.js';

describe('resolveLineSku', () => {
  it('uses line then product catalog then derived SKU', () => {
    assert.equal(resolveLineSku({ skin_script_sku: 'A' }, []), 'A');
    assert.equal(
      resolveLineSku({ product_id: 'p1' }, [{ id: 'p1', skin_script_sku: 'B' }]),
      'B'
    );
    assert.equal(resolveLineSku({ product_id: 'missing' }, []), 'SS-MISSING');
    assert.equal(resolveLineSku({ name: 'Ghost' }, []), null);
  });
});

describe('sanitizeSupplierRaw', () => {
  it('strips secrets', () => {
    const s = sanitizeSupplierRaw({ foo: 1, api_key: 'x', password: 'y' });
    assert.equal(s.foo, 1);
    assert.equal(s.api_key, undefined);
  });
});

describe('ORDER_STATUSES dropship states', () => {
  it('includes queued and failed_supplier', () => {
    assert.ok(ORDER_STATUSES.includes('queued_for_supplier'));
    assert.ok(ORDER_STATUSES.includes('failed_supplier'));
  });
});

describe('fulfillOrder mock path', () => {
  before(() => {
    resetMockDropshipLedger();
  });

  it('fails safely when line has no product mapping', async () => {
    const id = `ord_test_nosku_${Date.now()}`;
    mutateStore((s) => {
      s.orders.unshift({
        id,
        status: 'paid',
        customer: { name: 'T', email: 't@example.com' },
        items: [{ name: 'Ghost item no id', quantity: 1, unit_price: 10 }],
        shipping_address: { line1: '1', city: 'A', state: 'TX', postal_code: '78701' },
        created_at: new Date().toISOString()
      });
      return s;
    });
    const r = await fulfillOrder(id);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'sku_missing');
    const o = readStore().orders.find((x) => x.id === id);
    assert.equal(o.status, 'failed_supplier');
    assert.ok(o.fulfillment_error);
  });

  it('submits paid order and is idempotent', async () => {
    resetMockDropshipLedger();
    const products = readStore().products;
    const p = products[0];
    assert.ok(p, 'need product in store');

    const id = `ord_test_ok_${Date.now()}`;
    mutateStore((s) => {
      s.orders.unshift({
        id,
        status: 'paid',
        customer: { name: 'T', email: 't@example.com' },
        items: [
          {
            product_id: p.id,
            name: p.name,
            quantity: 1,
            unit_price: p.retail_price
          }
        ],
        shipping_address: { line1: '1 Pearl', city: 'Austin', state: 'TX', postal_code: '78701' },
        created_at: new Date().toISOString()
      });
      return s;
    });

    const r1 = await fulfillOrder(id);
    assert.equal(r1.ok, true, r1.error);
    assert.ok(r1.order.supplier_order_id);
    assert.equal(r1.order.status, 'submitted_to_skin_script');

    const r2 = await fulfillOrder(id);
    assert.equal(r2.ok, true);
    assert.equal(r2.idempotent, true);
    assert.equal(r2.order.supplier_order_id, r1.order.supplier_order_id);
  });
});

describe('shouldAutoFulfill', () => {
  it('defaults true', () => {
    const prev = process.env.AUTO_FULFILL;
    delete process.env.AUTO_FULFILL;
    assert.equal(shouldAutoFulfill(), true);
    process.env.AUTO_FULFILL = 'false';
    assert.equal(shouldAutoFulfill(), false);
    if (prev === undefined) delete process.env.AUTO_FULFILL;
    else process.env.AUTO_FULFILL = prev;
  });
});
