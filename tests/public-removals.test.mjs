import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

function read(rel) {
  return readFileSync(new URL(rel, root), 'utf8');
}

const UNPUBLISHED_ROUTES = ['/routine', '/services', '/membership', '/book'];

const UNPUBLISHED_PAGES = [
  'app/routine/page.jsx',
  'app/services/page.jsx',
  'app/membership/page.jsx',
  'app/book/page.jsx'
];

describe('owner-removal regression', () => {
  it('removed route page files no longer exist', () => {
    for (const rel of UNPUBLISHED_PAGES) {
      const abs = fileURLToPath(new URL(rel, root));
      assert.ok(!existsSync(abs), `route page should be unpublished: ${rel}`);
    }
  });

  it('navigation and footer do not link removed routes', () => {
    for (const rel of ['components/Nav.jsx', 'components/Footer.jsx']) {
      const src = read(rel);
      for (const path of UNPUBLISHED_ROUTES) {
        assert.ok(
          !src.includes(`'${path}'`) && !src.includes(`"${path}"`),
          `${rel} should not reference ${path}`
        );
      }
    }
  });

  it('sitemap omits removed routes', () => {
    const src = read('app/sitemap.js');
    for (const path of UNPUBLISHED_ROUTES) {
      assert.ok(!src.includes(`'${path}'`), `sitemap should not include ${path}`);
    }
  });

  it('sticky CTA is a single Shop action without booking', () => {
    const src = read('components/StickyCtaBar.jsx');
    assert.ok(src.includes(`'/shop'`), 'sticky CTA should default to Shop');
    assert.ok(!/Book a Facial/i.test(src), 'sticky CTA must not mention Book a Facial');
    assert.ok(!src.includes(`'/book'`), 'sticky CTA must not link /book');
  });
});
