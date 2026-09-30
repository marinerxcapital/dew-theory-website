import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROUTINE_ORDER, ROUTINE_TIMELINE, routinePlacement } from '../lib/routine.js';
import {
  filterProducts,
  parseShopParams,
  shopStateToParams,
  countActiveFilters,
  collectPriceBounds,
  presentRoutineSteps,
  formatPriceChip,
  formatPriceRange
} from '../lib/shop-filters.js';
import { PRODUCTS } from '../lib/products.js';
import { isShopVisible } from '../lib/shop.js';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const catalog = JSON.parse(read('data/products.json'));
const products = catalog.products || catalog;

describe('routine timeline', () => {
  it('covers real catalog categories only, cleanser first and SPF last', () => {
    const categories = new Set(products.map((p) => p.category));
    for (const step of ROUTINE_TIMELINE) {
      assert.ok(
        categories.has(step.category),
        `${step.category} is not a real catalog category`
      );
    }
    assert.equal(ROUTINE_TIMELINE[0].category, 'Cleanser');
    assert.equal(ROUTINE_TIMELINE[ROUTINE_TIMELINE.length - 1].category, 'SPF');
  });

  it('stays a superset of the layering order used for recommendations', () => {
    const timeline = ROUTINE_TIMELINE.map((s) => s.category);
    const positions = ROUTINE_ORDER.map((c) => timeline.indexOf(c));
    assert.ok(
      positions.every((p) => p > -1),
      'every ROUTINE_ORDER category must appear in the timeline'
    );
    for (let i = 1; i < positions.length; i++) {
      assert.ok(
        positions[i] > positions[i - 1],
        'timeline must preserve the relative layering order'
      );
    }
  });

  it('places a serum and reports neighbours plus its AM/PM label', () => {
    const placement = routinePlacement('Serum');
    assert.equal(placement.label, 'Serum');
    assert.equal(placement.position, 4);
    assert.equal(placement.total, ROUTINE_TIMELINE.length);
    assert.equal(placement.time, 'AM + PM');
    assert.equal(placement.before, 'Exfoliant');
    assert.equal(placement.after, 'Eye Treatment');
  });

  it('has no position for a bundle and no time label where copy states none', () => {
    assert.equal(routinePlacement('Kit'), null);
    assert.equal(routinePlacement('Nonsense'), null);
    for (const step of ROUTINE_TIMELINE) {
      if (step.time) {
        assert.match(step.time, /^AM$|^PM$|^AM \+ PM$|^AM or PM$/);
      }
    }
  });
});

describe('pdp routine placement wiring', () => {
  const page = read('app/shop/[id]/page.jsx');

  it('mounts the placement timeline and the above-fold concern chips', () => {
    assert.ok(page.includes("from '@/components/RoutinePlacement'"), 'component must be imported');
    assert.ok(page.includes('<RoutinePlacement product={product} />'), 'component must be rendered');
    assert.ok(
      page.indexOf('<RoutinePlacement product={product} />') <
        page.indexOf('<EmilyPairsWith product={product}'),
      'placement sits above the pairs-with rail'
    );
    assert.ok(
      page.includes('aria-label="Skin concerns addressed"'),
      'concern chips need an accessible group label'
    );
    assert.ok(
      page.indexOf('aria-label="Skin concerns addressed"') < page.indexOf('<AddToCart'),
      'concern chips belong above the fold, before add to bag'
    );
  });

  it('renders the current step as aria-current rather than colour alone', () => {
    const component = read('components/RoutinePlacement.jsx');
    assert.ok(component.includes('aria-current={current ? \'step\' : undefined}'));
    assert.ok(component.includes('sr-only'), 'current step needs a text equivalent');
  });
});

describe('shop filter dimensions', () => {
  const synthetic = [
    { id: 'a', name: 'A', category: 'Cleanser', retail_price: 30, stock_status: 'in_stock' },
    { id: 'b', name: 'B', category: 'Serum', retail_price: 90, stock_status: 'out_of_stock' },
    { id: 'c', name: 'C', category: 'SPF', retail_price: 45, stock_status: 'in_stock' }
  ];

  it('filters by routine step, availability, and price', () => {
    assert.deepEqual(
      filterProducts(synthetic, { step: 'Serum' }).map((p) => p.id),
      ['b']
    );
    assert.deepEqual(
      filterProducts(synthetic, { availability: 'in-stock' }).map((p) => p.id),
      ['a', 'c']
    );
    assert.deepEqual(
      filterProducts(synthetic, { availability: 'out-of-stock' }).map((p) => p.id),
      ['b']
    );
    assert.deepEqual(
      filterProducts(synthetic, { minPrice: 40 }).map((p) => p.id),
      ['b', 'c']
    );
    assert.deepEqual(
      filterProducts(synthetic, { maxPrice: 40 }).map((p) => p.id),
      ['a']
    );
  });

  it('round-trips the new dimensions through the URL', () => {
    const state = parseShopParams(
      new URLSearchParams('step=Serum&availability=in-stock&min=30&max=90&type=Serum&time=am')
    );
    assert.equal(state.step, 'Serum');
    assert.equal(state.availability, 'in-stock');
    assert.equal(state.minPrice, 30);
    assert.equal(state.maxPrice, 90);
    // type, time, step, availability, price = 5 active dimensions
    assert.equal(countActiveFilters(state), 5);

    const params = shopStateToParams(state);
    assert.equal(params.get('step'), 'Serum');
    assert.equal(params.get('availability'), 'in-stock');
    assert.equal(params.get('min'), '30');
    assert.equal(params.get('max'), '90');
  });

  it('ignores an availability value that is not a real dimension', () => {
    const state = parseShopParams(new URLSearchParams('availability=maybe'));
    assert.equal(state.availability, '');
    assert.equal(countActiveFilters(state), 0);
  });

  it('derives price bounds and step options from the real catalog', () => {
    const bounds = collectPriceBounds(PRODUCTS);
    assert.ok(bounds, 'catalog must expose a price bound');
    const prices = PRODUCTS.filter(isShopVisible).map((p) => Number(p.retail_price));
    assert.ok(bounds.min <= Math.min(...prices));
    assert.ok(bounds.max >= Math.max(...prices));

    const steps = presentRoutineSteps(PRODUCTS);
    assert.ok(steps.length > 0);
    for (const step of steps) {
      assert.ok(PRODUCTS.some((p) => p.category === step));
    }
  });

  it('labels the price chip and range without inventing a currency style', () => {
    assert.equal(formatPriceChip(30, 90), '$30–$90');
    assert.equal(formatPriceChip(30, null), '$30+');
    assert.equal(formatPriceChip(null, 90), 'Under $90');
    assert.equal(formatPriceRange({ min: 30, max: 90 }), 'Catalog range $30–$90');
    assert.equal(formatPriceRange(null), '');
  });
});

describe('shop grid exposes the new controls', () => {
  const grid = read('components/ShopGrid.jsx');

  it('renders routine step, availability, and price fields', () => {
    assert.ok(grid.includes('Routine step'));
    assert.ok(grid.includes('Availability'));
    assert.ok(grid.includes('Price'));
    assert.ok(grid.includes('AVAILABILITY_OPTIONS'));
    assert.ok(grid.includes('presentRoutineSteps'));
  });

  it('commits price on blur or Enter instead of per keystroke', () => {
    assert.ok(grid.includes('onBlur={(e) => commitPrice('));
    assert.ok(!grid.includes('onChange={(e) => commitPrice('));
  });
});
