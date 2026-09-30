import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import catalog from '../data/products.json' with { type: 'json' };
import {
  DOCUMENT_PANEL_SOURCES,
  documentPanelAlt,
  isDocumentPanel,
  isProductPhotoSrc,
  isSvgSrc,
  preferWebpSrc,
  productImageAlt,
  productImageSrc,
  PRODUCT_IMAGE_REVISION,
  withImageRevision,
  SKIN_SCRIPT_IMAGE_BY_ID
} from '../lib/product-image.js';

describe('product-image mapping', () => {
  it('maps all catalog products to pearl WebP paths via image_webp/images', () => {
    assert.ok(catalog.products.length >= 8);
    for (const p of catalog.products) {
      const src = productImageSrc(p);
      assert.ok(isProductPhotoSrc(src), `missing photo for ${p.id}`);
      assert.equal(isSvgSrc(src), false);
      // WebP, optionally carrying the imagery revision query.
      assert.match(src, /\.webp(\?v=[\w.-]+)?$/);
      assert.match(src, /\/images\/products\/skin-script\//);
      assert.ok(p.image_webp, `${p.id} missing image_webp`);
      assert.ok(Array.isArray(p.images) && p.images.length >= 1, `${p.id} needs gallery images`);
      assert.ok(p.images.length <= 8, `${p.id} gallery exceeds 8`);
      // Alt text must describe the imagery that actually ships. The photography
      // is a transparent cut-out of the real packaging, so it must not describe
      // the retired dark studio treatment.
      assert.match(p.image_alt || '', /product photo$/i);
      assert.doesNotMatch(p.image_alt || '', /black studio|hot pink|rim light/i);
    }
  });

  it('prefers image_webp, converts PNG paths to WebP, and stamps the imagery revision', () => {
    assert.equal(
      preferWebpSrc('/images/products/skin-script/demo/demo.png'),
      `/images/products/skin-script/demo/demo.webp?v=${PRODUCT_IMAGE_REVISION}`
    );
    assert.equal(
      productImageSrc({
        images: ['/images/products/skin-script/demo/demo.png']
      }),
      `/images/products/skin-script/demo/demo.webp?v=${PRODUCT_IMAGE_REVISION}`
    );
  });

  /**
   * Product photography is served immutable for a year, so a re-lit catalog
   * would otherwise never reach a returning visitor. The revision token has to
   * ride on every local product URL, and must not be doubled up or applied to
   * remote/placeholder sources.
   */
  it('cache-busts local product media exactly once and leaves other sources alone', () => {
    assert.equal(
      withImageRevision('/images/products/skin-script/demo/demo.webp'),
      `/images/products/skin-script/demo/demo.webp?v=${PRODUCT_IMAGE_REVISION}`
    );
    assert.equal(
      withImageRevision(`/images/products/skin-script/demo/demo.webp?v=${PRODUCT_IMAGE_REVISION}`),
      `/images/products/skin-script/demo/demo.webp?v=${PRODUCT_IMAGE_REVISION}`
    );
    assert.equal(
      withImageRevision('/products/placeholders/serum.svg'),
      '/products/placeholders/serum.svg'
    );
    assert.equal(
      withImageRevision('https://cdn.example.com/a.webp'),
      'https://cdn.example.com/a.webp'
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

/**
 * Label panels are printed regulatory artwork on the original plate, not studio
 * packshots. They cannot be background-keyed onto the void without destroying the
 * small print, so they render on a light document surface and carry their own alt.
 */
describe('manufacturer label panels', () => {
  it('flags exactly the documented panel assets, with or without the cache token', () => {
    assert.equal(DOCUMENT_PANEL_SOURCES.size, 3);
    for (const src of DOCUMENT_PANEL_SOURCES) {
      assert.ok(isDocumentPanel(src), `${src} should be a document panel`);
      assert.ok(
        isDocumentPanel(`${src}?v=${PRODUCT_IMAGE_REVISION}`),
        `${src} must still be detected with the revision query`
      );
    }
    assert.equal(isDocumentPanel('/images/products/skin-script/demo/demo.webp'), false);
    assert.equal(isDocumentPanel(''), false);
    assert.equal(isDocumentPanel(undefined), false);
  });

  it('every documented panel is a real gallery image in the catalog', () => {
    const gallery = new Set();
    for (const p of catalog.products) {
      for (const src of p.images || []) gallery.add(src);
    }
    for (const src of DOCUMENT_PANEL_SOURCES) {
      assert.ok(gallery.has(src), `${src} is not referenced by any catalog product`);
    }
  });

  it('describes the panel instead of claiming a studio background', () => {
    const alt = documentPanelAlt({ name: 'Sheer Protection SPF' });
    assert.match(alt, /label panel/i);
    assert.match(alt, /Sheer Protection SPF/);
    assert.doesNotMatch(alt, /black studio background/i);
  });
});
