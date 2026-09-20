/**
 * Catalog / Emily confirmation honesty — engineered defaults stay unconfirmed
 * until Emily explicitly answers. Do not invent new Emily decisions here.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

const catalog = JSON.parse(read('data/products.json'));

const STOREFRONT_FILES = [
  'app/page.jsx',
  'app/shop/page.jsx',
  'app/shop/[id]/page.jsx',
  'app/cart/page.jsx',
  'app/cart/confirmation/page.jsx',
  'components/ProductCard.jsx',
  'components/ProductRail.jsx',
  'components/ProductImage.jsx',
  'components/AddToCart.jsx',
  'components/QuickAdd.jsx',
  'components/CartView.jsx',
  'components/AnnouncementBar.jsx',
  'components/Hero.jsx',
  'components/Nav.jsx',
  'components/Footer.jsx',
  'components/EmilyPairsWith.jsx',
  'components/FreeShippingMeter.jsx'
];

const FORBIDDEN_STOREFRONT = [
  /price confirmed/i,
  /confirmed (retail|price)/i,
  /retail[_ ]price[_ ]confirmed/i,
  /emily[-\s]?approved/i,
  /emily confirmed/i
];

describe('catalog honesty flags (2026-09-19 confirmation still pending)', () => {
  it('keeps Sheer Protection SPF retail at $30 and unconfirmed', () => {
    const spf = catalog.products.find((p) => p.id === 'sheer-protection-spf');
    assert.ok(spf, 'SPF product missing');
    assert.equal(spf.wholesale_price, 15);
    assert.equal(spf.retail_price, 30);
    assert.equal(spf.retail_price_confirmed, false);
    assert.match(String(spf.retail_price_note), /Emily still must confirm/i);
    assert.doesNotMatch(String(spf.retail_price_note), /Emily (approved|confirmed)/i);
  });

  it('keeps lip treatment as one product with Peppermint/Pomegranate variants', () => {
    const lip = catalog.products.find((p) => p.id === 'lip-treatment-peppermint-pomegranate');
    assert.ok(lip, 'lip treatment missing');
    assert.deepEqual(lip.variants, ['Peppermint', 'Pomegranate']);
    assert.match(String(lip.manufacturer_name_note), /OPEN_ITEMS\.md/);
    assert.match(String(lip.manufacturer_name_note), /2026-09-19/);
    const extraLip = catalog.products.filter((p) => p.category === 'Lip Treatment');
    assert.equal(extraLip.length, 1, 'do not split lip into two catalog SKUs without Emily');
  });

  it('keeps Botanical Bloom at 2 oz with size unconfirmed', () => {
    const mask = catalog.products.find((p) => p.id === 'botanical-bloom-hydrating-mask');
    assert.ok(mask, 'mask missing');
    assert.equal(mask.size, '2 oz');
    assert.equal(mask.size_confirmed, false);
    assert.match(String(mask.size_note), /OPEN_ITEMS\.md/);
  });
});

describe('OPEN_ITEMS.md §2 2026-09-19 status', () => {
  it('records pending Emily confirmation and does not claim approval', () => {
    const open = read('OPEN_ITEMS.md');
    const section = open.split('## 3.')[0].split('## 2.')[1] || '';
    assert.match(section, /2026-09-19/);
    assert.match(section, /did not answer/i);
    assert.match(section, /not\*\*[\s\S]*Emily-approved|not Emily-approved/i);
    assert.match(section, /retail_price_confirmed: false/);
    assert.match(section, /size_confirmed: false/);
    assert.match(section, /DEW15/);
    assert.match(section, /placeholder launch promo/i);
    assert.doesNotMatch(section, /Emily approved/i);
    assert.doesNotMatch(section, /Emily confirmed/i);
  });
});

describe('storefront does not label unconfirmed prices as confirmed', () => {
  it('public shop/cart surfaces omit confirmation / Emily-approved price copy', () => {
    for (const rel of STOREFRONT_FILES) {
      const src = read(rel);
      for (const pattern of FORBIDDEN_STOREFRONT) {
        assert.doesNotMatch(
          src,
          pattern,
          `${rel} must not present unconfirmed prices as confirmed (${pattern})`
        );
      }
    }
  });

  it('cart promo field does not claim DEW15 15% is Emily-approved', () => {
    const cart = read('components/CartView.jsx');
    assert.match(cart, /DEW15/);
    assert.doesNotMatch(cart, /emily[-\s]?approved/i);
    assert.doesNotMatch(cart, /15%\s*(off|launch)/i);
  });
});

describe('admin DEW15 copy stays a launch-promo placeholder', () => {
  it('discounts page does not present 15% as Emily-approved', () => {
    const page = read('app/admin/discounts/page.jsx');
    assert.match(page, /launch-promo placeholder/i);
    assert.match(page, /not an Emily-approved marketing rate/i);
  });
});
