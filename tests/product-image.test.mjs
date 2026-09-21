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

describe('product-image mapping', () => {
  it('maps all catalog products to sage WebP paths via image_webp/images', () => {
    assert.ok(catalog.products.length >= 8);
    for (const p of catalog.products) {
      const src = productImageSrc(p);
      assert.ok(isProductPhotoSrc(src), `missing photo for ${p.id}`);
      assert.equal(isSvgSrc(src), false);
      assert.match(src, /\.webp$/);
      assert.match(src, /\/images\/products\/skin-script\//);
      assert.ok(p.image_webp, `${p.id} missing image_webp`);
      assert.ok(Array.isArray(p.images) && p.images.length >= 1, `${p.id} needs gallery images`);
      assert.ok(p.images.length <= 8, `${p.id} gallery exceeds 8`);
      assert.match(p.image_alt || '', /sage background/i);
    }
  });

  it('prefers image_webp and converts PNG paths to WebP', () => {
    assert.equal(
      preferWebpSrc('/images/products/skin-script/demo/demo.png'),
      '/images/products/skin-script/demo/demo.webp'
    );
    assert.equal(
      productImageSrc({
        images: ['/images/products/skin-script/demo/demo.png']
      }),
      '/images/products/skin-script/demo/demo.webp'
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
