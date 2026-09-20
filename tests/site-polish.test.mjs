import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { getFooterLegalLinks } from '../lib/legal-documents.js';

const root = new URL('../', import.meta.url);

function read(rel) {
  return readFileSync(new URL(rel, root), 'utf8');
}

describe('site polish honesty', () => {
  it('shipping page stays customer-facing and does not point at unpublished contact', () => {
    const src = read('app/shipping/page.jsx');
    assert.ok(!/contact form/i.test(src));
    assert.ok(!src.includes("'/contact'") && !src.includes('"/contact"'));
    assert.ok(!/it can be flipped if Emily/i.test(src));
    assert.ok(src.includes('hello@dewtheory.studio'));
    assert.ok(/standard transit window/i.test(src));
    assert.ok(src.includes('FREE_SHIPPING_THRESHOLD_USD'));
    assert.ok(src.includes('FLAT_SHIPPING_USD'));
  });

  it('privacy page distinguishes live handling from unpublished procedures', () => {
    const src = read('app/privacy/page.jsx');
    assert.ok(/Not published yet/i.test(src));
    assert.ok(/cookie-consent banner/i.test(src));
    assert.ok(!/What this page does not claim yet/i.test(src));
    assert.ok(!/forthcoming/i.test(src));
  });

  it('trust strip uses confirmed facts only — no reviews or ratings', () => {
    const src = read('components/TrustStrip.jsx');
    assert.ok(src.includes('FREE_SHIPPING_THRESHOLD_USD'));
    assert.ok(/Skin Script/i.test(src));
    assert.ok(/Emily/i.test(src));
    assert.ok(!/testimonial/i.test(src));
    assert.ok(!/star rating/i.test(src));
    assert.ok(!/\b[1-5]\s*\/\s*5\b/.test(src));
    assert.ok(!/licensed/i.test(src));
    const home = read('app/page.jsx');
    const shop = read('app/shop/page.jsx');
    assert.ok(home.includes('TrustStrip'));
    assert.ok(shop.includes('TrustStrip'));
  });

  it('footer Help stays the eight public legal routes and omits About', () => {
    const footer = read('components/Footer.jsx');
    assert.ok(footer.includes('getFooterLegalLinks'));
    assert.ok(!footer.includes("'/about'") && !footer.includes('"/about"'));
    assert.ok(!/About Emily/i.test(footer));
    const hrefs = getFooterLegalLinks().map((l) => l.href).sort();
    assert.deepEqual(hrefs, [
      '/accessibility',
      '/aesthetic-disclaimer',
      '/booking-policy',
      '/cookies',
      '/privacy',
      '/returns',
      '/shipping',
      '/terms'
    ]);
  });

  it('product cards request early images and keep a visible skeleton', () => {
    const card = read('components/ProductCard.jsx');
    const image = read('components/ProductImage.jsx');
    const grid = read('components/ShopGrid.jsx');
    const rail = read('components/ProductRail.jsx');
    const css = read('app/globals.css');
    assert.ok(card.includes('priority'));
    assert.ok(card.includes('product-card'));
    assert.ok(image.includes('product-image-skeleton'));
    assert.ok(grid.includes('priority={i < 4}'));
    assert.ok(rail.includes('priority={i < 4}'));
    assert.ok(css.includes('.product-image-skeleton'));
    assert.ok(css.includes('article.product-card[data-reveal]'));
  });

  it('empty bag still points to shop and shows the free-shipping meter', () => {
    const src = read('components/CartView.jsx');
    assert.ok(src.includes('href="/shop"'));
    assert.ok(src.includes('Shop Skin Script'));
    assert.ok(src.includes('<FreeShippingMeter subtotal={0} />'));
    assert.ok(src.includes('collectGuestCheckoutIssues'));
    assert.ok(src.includes('noValidate'));
    assert.ok(src.includes('checkout-field-summary'));
  });

  it('nav does not reintroduce unpublished About', () => {
    const nav = read('components/Nav.jsx');
    assert.ok(!nav.includes("'/about'") && !nav.includes('"/about"'));
  });
});
