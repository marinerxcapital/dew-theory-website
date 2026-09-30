import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CONCERN_FAMILIES,
  allClaimedConditions,
  productsForFamily
} from '../lib/concerns.js';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('data/products.json', root), 'utf8'));
const products = catalog.products;

/** Every condition string any product actually declares. */
const realConditions = new Set();
for (const p of products) {
  for (const c of p.conditions_addressed || []) realConditions.add(c);
}

describe('skin concern taxonomy', () => {
  it('claims only conditions that exist in the catalog', () => {
    for (const condition of allClaimedConditions()) {
      assert.ok(
        realConditions.has(condition),
        `taxonomy claims a condition no product declares: ${condition}`
      );
    }
  });

  it('leaves no catalog condition unclaimed', () => {
    const claimed = new Set(allClaimedConditions());
    for (const condition of realConditions) {
      assert.ok(claimed.has(condition), `catalog condition not in any family: ${condition}`);
    }
  });

  it('does not claim the same condition in two families', () => {
    const seen = new Set();
    for (const family of CONCERN_FAMILIES) {
      for (const condition of family.conditions) {
        assert.ok(!seen.has(condition), `condition claimed twice: ${condition}`);
        seen.add(condition);
      }
    }
  });

  it('has unique slugs and every family resolves to at least one product', () => {
    const slugs = new Set();
    for (const family of CONCERN_FAMILIES) {
      assert.ok(!slugs.has(family.slug), `duplicate family slug: ${family.slug}`);
      slugs.add(family.slug);
      const items = productsForFamily(family, products);
      assert.ok(items.length > 0, `family has no products: ${family.slug}`);
    }
  });

  it('only assigns products that declare the family condition', () => {
    for (const family of CONCERN_FAMILIES) {
      const wanted = new Set(family.conditions);
      for (const product of productsForFamily(family, products)) {
        assert.ok(
          (product.conditions_addressed || []).some((c) => wanted.has(c)),
          `${product.id} was assigned to ${family.slug} without declaring it`
        );
      }
    }
  });
});
