import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, searchStorefront } from '../lib/search.js';
import {
  filterProducts,
  sortProducts,
  parseShopParams,
  countActiveFilters,
  collectConcerns
} from '../lib/shop-filters.js';
import { PRODUCTS } from '../lib/products.js';

describe('search', () => {
  it('indexes products and finds cleanser by name', () => {
    const { flat, total } = searchStorefront('green tea', { catalog: PRODUCTS });
    assert.ok(total >= 1);
    assert.ok(flat.some((i) => i.href.includes('green-tea-citrus-cleanser')));
  });

  it('finds skin quiz guide', () => {
    const { groups } = searchStorefront('quiz', { catalog: PRODUCTS });
    assert.ok(groups.Guides?.some((g) => g.href === '/quiz'));
  });

  it('returns empty for nonsense query', () => {
    const { flat, total } = searchStorefront('zzzznotaproduct999', { catalog: PRODUCTS });
    assert.equal(total, 0);
    assert.equal(flat.length, 0);
  });

  it('buildSearchIndex excludes unpublished service/routine/membership routes', () => {
    const index = buildSearchIndex(PRODUCTS);
    assert.ok(index.some((i) => i.kind === 'product'));
    assert.ok(!index.some((i) => i.kind === 'service'));
    const hrefs = index.map((i) => i.href);
    for (const path of ['/routine', '/services', '/membership', '/book']) {
      assert.ok(
        !hrefs.some((h) => h === path || h.startsWith(`${path}?`)),
        `removed route should not be in search index: ${path}`
      );
    }
  });
});

describe('shop filters', () => {
  it('filters by category type', () => {
    const list = filterProducts(PRODUCTS, { type: 'Cleanser' });
    assert.ok(list.length >= 1);
    assert.ok(list.every((p) => p.category === 'Cleanser'));
  });

  it('sorts price ascending', () => {
    const list = sortProducts(PRODUCTS, 'price-asc');
    for (let i = 1; i < list.length; i++) {
      assert.ok(list[i].retail_price >= list[i - 1].retail_price);
    }
  });

  it('sorts name A-Z', () => {
    const list = sortProducts(PRODUCTS, 'name-asc');
    const names = list.map((p) => p.name);
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
  });

  it('parses shop params', () => {
    const state = parseShopParams(new URLSearchParams('type=Serum&sort=price-desc&time=am'));
    assert.equal(state.type, 'Serum');
    assert.equal(state.sort, 'price-desc');
    assert.equal(state.time, 'am');
    assert.equal(countActiveFilters(state), 2);
  });

  it('collects concerns from catalog', () => {
    const concerns = collectConcerns(PRODUCTS);
    assert.ok(concerns.length > 0);
  });

  it('filters PM excludes SPF', () => {
    const list = filterProducts(PRODUCTS, { time: 'pm' });
    assert.ok(list.every((p) => p.category !== 'SPF'));
  });
});
