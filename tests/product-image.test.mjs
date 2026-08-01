import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import catalog from '../data/products.json' with { type: 'json' };
import {
  isProductPhotoSrc,
  isSvgSrc,
  preferWebpSrc,
  productImageAlt,
  productImageSrc,
  SKIN_SCRIPT_IMAGE_BY_ID
} from '../lib/product-image.js';

const EXPECTED = {
  'green-tea-citrus-cleanser':
    '/images/products/skin-script/00-green-tea-citrus-cleanser.webp',
  'mandelic-brightening-serum':
    '/images/products/skin-script/01-mandelic-brightening-serum.webp',
  'hydrating-skin-serum':
    '/images/products/skin-script/02-ageless-skin-hydrating-serum.webp',
  'ageless-moisturizer':
    '/images/products/skin-script/03-ageless-skin-moisturizer.webp',
  'botanical-bloom-hydrating-mask':
    '/images/products/skin-script/04-botanical-bloom-hydrating-mask.webp',
  'lip-treatment-peppermint-pomegranate':
    '/images/products/skin-script/05-ageless-lip-treatment.webp',
  'cucumber-hydration-toner':
    '/images/products/skin-script/06-cucumber-hydration-toner.webp',
  'sheer-protection-spf':
    '/images/products/skin-script/07-sheer-protection-spf-30.webp'
};

describe('product-image mapping', () => {
  it('maps all eight catalog products to WebP Skin Script paths', () => {
    assert.equal(catalog.products.length, 8);
    for (const p of catalog.products) {
      const expected = EXPECTED[p.id];
      assert.ok(expected, `unexpected product id ${p.id}`);
      assert.equal(productImageSrc(p), expected);
      assert.ok(isProductPhotoSrc(productImageSrc(p)));
      assert.equal(isSvgSrc(productImageSrc(p)), false);
      assert.match(productImageSrc(p), /\.webp$/);
    }
  });

  it('prefers image_webp and converts PNG paths to WebP', () => {
    assert.equal(
      preferWebpSrc('/images/products/skin-script/00-green-tea-citrus-cleanser.png'),
      '/images/products/skin-script/00-green-tea-citrus-cleanser.webp'
    );
    assert.equal(
      productImageSrc({
        images: ['/images/products/skin-script/00-green-tea-citrus-cleanser.png']
      }),
      '/images/products/skin-script/00-green-tea-citrus-cleanser.webp'
    );
  });

  it('falls back by id when images[] empty', () => {
    for (const [id, path] of Object.entries(SKIN_SCRIPT_IMAGE_BY_ID)) {
      assert.equal(productImageSrc({ id, name: 'X', images: [] }), path);
    }
  });

  it('uses category placeholder when unknown product', () => {
    const src = productImageSrc({ category: 'Serum', images: [] });
    assert.equal(src, '/products/placeholders/serum.svg');
    assert.ok(isSvgSrc(src));
  });

  it('prefers explicit image_alt', () => {
    assert.equal(
      productImageAlt({ name: 'Test', image_alt: 'Custom alt' }),
      'Custom alt'
    );
  });
});
