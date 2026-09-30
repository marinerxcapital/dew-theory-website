import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DOCUMENT_PANEL_SOURCES } from '../lib/product-image.js';

/*
 * Product imagery + alt text guards.
 *
 * The catalog photography is a transparent cut-out of the real Skin Script
 * packaging (see scripts/pearl_product_imagery.py). These assertions catch the
 * two ways that silently regressed before: alt text left over from the retired
 * dark art direction, and image references that no longer resolve.
 */

const root = new URL('../', import.meta.url);
const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, root), 'utf8'));
const catalog = readJson('data/products.json');
const runtime = readJson('data/runtime/store.json');

const NOIR_ALT = /black studio|hot pink|rim light|\bvoid\b/i;

/** Parse the WebP container header: extended (VP8X) alpha flag, or plain VP8. */
function webpShape(rel) {
  const abs = fileURLToPath(new URL('public' + rel, root));
  const head = readFileSync(abs).subarray(0, 32);
  assert.equal(head.subarray(0, 4).toString('ascii'), 'RIFF', rel + ' is not a RIFF container');
  assert.equal(head.subarray(8, 12).toString('ascii'), 'WEBP', rel + ' is not a WebP');
  const fourcc = head.subarray(12, 16).toString('ascii');
  if (fourcc !== 'VP8X') return { fourcc, alpha: false, anim: false };
  const flags = head[20];
  return {
    fourcc,
    alpha: Boolean(flags & 0x10),
    anim: Boolean(flags & 0x02)
  };
}

function referencedImages(products) {
  const out = new Set();
  for (const p of products) {
    for (const src of p.images || []) out.add(src.split('?')[0]);
    if (p.image_webp) out.add(p.image_webp.split('?')[0]);
  }
  return [...out];
}

describe('product alt text', () => {
  it('never describes the retired dark art direction', () => {
    for (const [label, products] of [
      ['data/products.json', catalog.products],
      ['data/runtime/store.json', runtime.products]
    ]) {
      const offenders = products.filter((p) => NOIR_ALT.test(p.image_alt || ''));
      assert.equal(
        offenders.length,
        0,
        label + ' still describes a black background or pink rim: ' + offenders[0]?.image_alt
      );
    }
  });

  it('gives every product a non-empty, name-bearing alt', () => {
    for (const product of catalog.products) {
      assert.ok(product.image_alt && product.image_alt.length > 10, product.id + ' has weak alt text');
      assert.ok(
        product.image_alt.includes(product.name),
        product.id + ' alt text does not name the product'
      );
    }
  });
});

describe('product imagery', () => {
  it('resolves every referenced image on disk', () => {
    const missing = referencedImages(catalog.products).filter(
      (src) => !existsSync(fileURLToPath(new URL('public' + src, root)))
    );
    assert.deepEqual(missing, [], 'referenced product images missing from public/');
  });

  it('ships real packaging as alpha cut-outs, not plates', () => {
    for (const src of referencedImages(catalog.products)) {
      if (!src.startsWith('/images/products/skin-script/')) continue;
      const shape = webpShape(src);
      if (DOCUMENT_PANEL_SOURCES.has(src)) {
        // Manufacturer label panels are deliberately left on their own surface
        // and are not keyed, so they carry no alpha channel.
        assert.equal(shape.alpha, false, src + ' should not have been keyed');
        continue;
      }
      assert.equal(
        shape.alpha,
        true,
        src + ' has no alpha channel — the studio plate was not removed'
      );
      assert.equal(shape.anim, false, src + ' is flagged as an animation');
    }
  });

  it('has no unreferenced leftovers at the skin-script root', () => {
    // The flat 00-..07- duplicates were removed; keep the directory tidy.
    const rootDir = fileURLToPath(new URL('public/images/products/skin-script/', root));
    const strayFiles = readdirSync(rootDir, { withFileTypes: true })
      .filter((e) => e.isFile() && /^0\d-/.test(e.name))
      .map((e) => e.name);
    assert.deepEqual(strayFiles, [], 'flat duplicate product images were reintroduced');
  });
});
