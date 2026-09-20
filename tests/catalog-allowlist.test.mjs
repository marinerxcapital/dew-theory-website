/**
 * Curated catalog allowlist — sync must never publish SKUs off this list.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  findAllowlistEntry,
  getEnabledAllowlistEntries,
  isAllowlisted,
  loadCatalogAllowlist
} from '../lib/catalog-allowlist.js';
import { planCatalogSync } from '../lib/catalog-sync.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'data/products.json'), 'utf8'));
const portal = JSON.parse(readFileSync(join(root, 'data/supplier/skin-script-portal-urls.json'), 'utf8'));

const INITIAL_IDS = [
  'green-tea-citrus-cleanser',
  'mandelic-brightening-serum',
  'botanical-bloom-hydrating-mask',
  'ageless-moisturizer',
  'hydrating-skin-serum',
  'lip-treatment-peppermint-pomegranate',
  'sheer-protection-spf',
  'cucumber-hydration-toner'
];

describe('catalog allowlist data', () => {
  it('lists the current 8 shop SKUs as sync-enabled', () => {
    const loaded = loadCatalogAllowlist();
    assert.equal(loaded.products.length, 8);
    assert.equal(getEnabledAllowlistEntries().length, 8);
    const ids = loaded.products.map((p) => p.product_id).sort();
    assert.deepEqual(ids, [...INITIAL_IDS].sort());
    assert.ok(loaded.products.every((p) => p.sync_enabled && p.skin_script_sku && p.supplier_product_url));
  });

  it('matches products.json ids and portal variant SKUs', () => {
    const catalogIds = new Set(catalog.products.map((p) => p.id));
    const portalById = new Map(portal.products.map((p) => [p.product_id, p]));
    for (const row of loadCatalogAllowlist().products) {
      assert.ok(catalogIds.has(row.product_id), `allowlist id missing from products.json: ${row.product_id}`);
      const portalRow = portalById.get(row.product_id);
      assert.ok(portalRow, `portal URL missing for ${row.product_id}`);
      assert.equal(row.skin_script_sku, portalRow.skin_script_sku);
      assert.equal(row.supplier_product_url, portalRow.supplier_product_url);
    }
  });
});

describe('allowlist lookup', () => {
  it('matches by Dew product id or Skin Script SKU', () => {
    assert.equal(isAllowlisted({ id: 'green-tea-citrus-cleanser' }), true);
    assert.equal(isAllowlisted({ skin_script_sku: '1010240' }), true);
    assert.equal(isAllowlisted({ skin_script_sku: '9999999' }), false);
    assert.equal(isAllowlisted({ id: 'not-a-dew-product' }), false);
    assert.equal(findAllowlistEntry({ sku: '1310440' }).product_id, 'mandelic-brightening-serum');
  });

  it('treats sync_enabled=false as not allowlisted for sync', () => {
    const doc = {
      products: [{ product_id: 'green-tea-citrus-cleanser', skin_script_sku: '1010240', sync_enabled: false }]
    };
    assert.equal(isAllowlisted({ id: 'green-tea-citrus-cleanser' }, doc), false);
    assert.equal(getEnabledAllowlistEntries(doc).length, 0);
  });
});

describe('planCatalogSync allowlist enforcement', () => {
  it('skips and never creates SKUs that are not on the allowlist', () => {
    const plan = planCatalogSync(
      [
        {
          id: 'secret-wholesale-item',
          name: 'Not For Dew Shop',
          wholesale_price: 9,
          skin_script_sku: '9990001'
        },
        {
          id: 'green-tea-citrus-cleanser',
          name: 'Green Tea Citrus Cleanser',
          wholesale_price: 16,
          retail_price: 32,
          stock_status: 'in_stock',
          skin_script_sku: '1010240',
          active: true
        }
      ],
      []
    );
    assert.equal(plan.create.length, 1);
    assert.equal(plan.create[0].product.id, 'green-tea-citrus-cleanser');
    assert.ok(plan.skip.some((s) => s.reason === 'not_on_allowlist' && s.sku === '9990001'));
    assert.equal(
      plan.create.some((c) => c.sku === '9990001'),
      false
    );
  });

  it('skips sync_disabled allowlist rows even if the feed has them', () => {
    const doc = {
      products: [
        { product_id: 'green-tea-citrus-cleanser', skin_script_sku: '1010240', sync_enabled: false }
      ]
    };
    const plan = planCatalogSync(
      [
        {
          id: 'green-tea-citrus-cleanser',
          name: 'Green Tea Citrus Cleanser',
          wholesale_price: 16,
          skin_script_sku: '1010240'
        }
      ],
      [],
      { allowlist: doc }
    );
    assert.equal(plan.create.length, 0);
    assert.ok(plan.skip.some((s) => s.reason === 'sync_disabled'));
  });

  it('updates commerce fields only and preserves editorial copy', () => {
    const existing = [
      {
        id: 'green-tea-citrus-cleanser',
        name: 'Green Tea Citrus Cleanser',
        category: 'Cleanser',
        size: '6.4 oz',
        wholesale_price: 16,
        retail_price: 32,
        retail_price_confirmed: true,
        description_short: 'Emily copy stays',
        how_to_use: 'Massage, rinse',
        key_actives: [{ name: 'Green Tea' }],
        skin_types: ['oily'],
        conditions_addressed: ['dullness'],
        stock_status: 'in_stock',
        skin_script_sku: '1010240',
        active: true,
        source: 'manual'
      }
    ];
    const plan = planCatalogSync(
      [
        {
          id: 'green-tea-citrus-cleanser',
          name: 'Manufacturer rename must not win',
          wholesale_price: 18,
          stock_status: 'out_of_stock',
          skin_script_sku: '1010240',
          description_short: 'Invented feed copy'
        }
      ],
      existing
    );
    assert.equal(plan.update.length, 1);
    const next = plan.update[0].product;
    assert.equal(next.name, 'Green Tea Citrus Cleanser');
    assert.equal(next.description_short, 'Emily copy stays');
    assert.equal(next.how_to_use, 'Massage, rinse');
    assert.equal(next.wholesale_price, 18);
    assert.equal(next.retail_price, 36);
    assert.equal(next.stock_status, 'out_of_stock');
    assert.equal(next.retail_price_confirmed, true);
    assert.equal(next.skin_script_sku, '1010240');
  });

  it('records allowlisted SKUs missing from the feed', () => {
    const plan = planCatalogSync([], []);
    assert.ok(plan.skip.some((s) => s.reason === 'allowlisted_not_in_feed'));
    assert.ok(plan.skip.length >= 8);
    assert.equal(plan.create.length, 0);
  });
});
