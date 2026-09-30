import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  SPECTRAL_FAMILIES,
  spectralFamilyForProduct,
  NEUTRAL_FAMILY
} from '../lib/spectral.js';
import { isShopVisible } from '../lib/shop.js';

const root = new URL('../', import.meta.url);

function read(rel) {
  return readFileSync(new URL(rel, root), 'utf8');
}

function readJson(rel) {
  return JSON.parse(read(rel));
}

const home = read('app/page.jsx');
const catalog = readJson('data/products.json');

describe('homepage hierarchy', () => {
  it('composes the consultation-led section order', () => {
    // 2026-09-26: the approved pearl/editorial handoff (DT-01) puts the
    // shop-by-concern shelf immediately after the hero and trust strip, ahead of
    // the ways-to-start band. Order updated to match the mockup.
    const order = [
      "<Hero product={heroProduct} />",
      '<StickyCtaBar />',
      '<TrustStrip />',
      '<ShopByConcern />',
      '<WaysToStart />',
      '<FeaturedProductStory product={featuredProduct} />',
      '<PersonalizationHub />',
      '<MeetEmily />',
      '<BestSellers products={emilyPicks} />',
      'id="journal-teaser"',
      '<Education />',
      '<FinalConsultationCta />'
    ];

    let cursor = -1;
    for (const marker of order) {
      const at = home.indexOf(marker);
      assert.ok(at > -1, `homepage is missing ${marker}`);
      assert.ok(at > cursor, `homepage renders ${marker} out of order`);
      cursor = at;
    }
  });

  it('drives hero, featured story, and picks from the live catalog', () => {
    assert.ok(home.includes('getProducts()'), 'homepage must read the catalog');
    assert.ok(home.includes('isShopVisible'), 'homepage must filter unpublished products');
    assert.ok(
      home.includes('.filter(Boolean)'),
      "Emily's picks must drop ids missing from the catalog"
    );
  });

  it('states no reviews, ratings, or invented credentials', () => {
    const surfaces = [
      'app/page.jsx',
      'components/Hero.jsx',
      'components/home/WaysToStart.jsx',
      'components/home/ShopByConcern.jsx',
      'components/home/FeaturedProductStory.jsx',
      'components/home/PersonalizationHub.jsx',
      'components/home/MeetEmily.jsx',
      'components/home/BestSellers.jsx',
      'components/home/Education.jsx',
      'components/home/FinalConsultationCta.jsx'
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      // Tailwind aspect ratios look like "4/5" and are not ratings.
      const scrubbed = src.replace(/aspect-\[[^\]]*\]/g, '');
      assert.ok(!/testimonial/i.test(src), `${rel} must not claim testimonials`);
      assert.ok(!/star rating/i.test(src), `${rel} must not claim star ratings`);
      assert.ok(
        !/\b[1-5]\s*\/\s*5\b/.test(scrubbed),
        `${rel} must not show a rating out of five`
      );
      assert.ok(!/certified|accredited|award-winning/i.test(src), `${rel} must not invent credentials`);
    }
  });
});

describe('spectral family system', () => {
  it('maps only to concerns that exist in the real catalog', () => {
    const present = new Set();
    for (const product of catalog.products) {
      for (const concern of product.conditions_addressed || []) {
        const value = String(concern).toLowerCase();
        present.add(value);
        // Alias-style raw values ("congestion / buildup") must still be reachable
        // by the shorter concern tokens used in families.
        for (const token of value.split(/[^a-z]+/)) {
          if (token) present.add(token);
        }
      }
    }

    for (const family of SPECTRAL_FAMILIES) {
      assert.ok(family.concerns.length > 0, `${family.key} must map at least one concern`);
      const reachable = family.concerns.some((concern) => {
        const c = concern.toLowerCase();
        if (present.has(c)) return true;
        for (const value of present) {
          if (value.includes(c) || c.includes(value)) return true;
        }
        return false;
      });
      assert.ok(reachable, `${family.key} maps to no real catalog concern`);
    }
  });

  it('resolves a family for every shop-visible product', () => {
    const visible = catalog.products.filter(isShopVisible);
    assert.ok(visible.length > 0, 'catalog must expose visible products');
    for (const product of visible) {
      const family = spectralFamilyForProduct(product);
      assert.ok(family?.key, `${product.id} has no spectral family`);
      assert.ok(
        family === NEUTRAL_FAMILY || family.accent.startsWith('var(--dt-green-'),
        `${product.id} family is missing an accent`
      );
    }
  });
});

describe('virtual consultation page', () => {
  const page = read('app/virtual-consultation/page.jsx');

  it('keeps the existing payment, intake, and disclaimer path intact', () => {
    assert.ok(page.includes('VirtualConsultationCheckout'), 'booking UI must stay wired');
    assert.ok(page.includes('getPublicConsultationConfig'), 'price/duration come from config');
    assert.ok(page.includes("sp?.cancelled === '1'"), 'cancelled checkout state must survive');
    assert.ok(page.includes('does not replace'), 'scope disclaimer must remain');
    assert.ok(page.includes('hello@dewtheory.studio'), 'contact path must remain');
  });

  it('presents guidance before paperwork', () => {
    const order = [
      'vc-hero',
      'vc-benefits',
      '<HowConsultationWorks />',
      'vc-cover',
      'vc-receive',
      '<MeetEmily />',
      'id="book"',
      'vc-prep',
      'vc-faq',
      'vc-final'
    ];
    let cursor = -1;
    for (const marker of order) {
      const at = page.indexOf(marker);
      assert.ok(at > -1, `consultation page is missing ${marker}`);
      assert.ok(at > cursor, `consultation page renders ${marker} out of order`);
      cursor = at;
    }
  });
});

describe('next/image quality allowlist', () => {
  /**
   * Next 15 rejects any `quality` outside next.config.mjs `images.qualities`
   * with a 400 from /_next/image, which renders as a broken product image.
   */
  it('every rendered quality is inside the configured allowlist', () => {
    const config = read('next.config.mjs');
    const match = config.match(/qualities:\s*\[([^\]]*)\]/);
    assert.ok(match, 'next.config.mjs must declare images.qualities');
    const allowed = match[1]
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n));
    assert.ok(allowed.length > 0, 'qualities allowlist must not be empty');

    const roots = ['app', 'components'];
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), {
        withFileTypes: true
      })) {
        const rel = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(rel);
        else if (/\.jsx?$/.test(entry.name)) files.push(rel);
      }
    };
    for (const root of roots) walk(root);

    const offenders = [];
    for (const rel of files) {
      const src = read(rel);
      for (const hit of src.matchAll(/quality=\{(\d+)\}/g)) {
        const value = Number(hit[1]);
        if (!allowed.includes(value)) offenders.push(`${rel}: quality={${value}}`);
      }
      for (const hit of src.matchAll(/quality="(\d+)"/g)) {
        const value = Number(hit[1]);
        if (!allowed.includes(value)) offenders.push(`${rel}: quality="${value}"`);
      }
    }

    assert.deepEqual(offenders, [], `quality outside allowlist [${allowed.join(', ')}]`);
  });
});
