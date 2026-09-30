#!/usr/bin/env node
/**
 * Pearl visual-regression capture.
 *
 * Renders the implemented routes at the approved mockup viewport (1672x941) and
 * at a mobile viewport, writing PNGs to reports/pearl-preview/ for side-by-side
 * comparison against mockups/approved/.
 *
 *   node scripts/_shot-pearl.mjs http://localhost:3000
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const OUT = resolve('reports', 'pearl-preview');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('no local Chrome/Edge found');
  process.exit(1);
}

const DESKTOP = { width: 1672, height: 941 };
const MOBILE = { width: 390, height: 844 };

const SHOTS = [
  ['DT-01-homepage-desktop', '/', DESKTOP],
  ['DT-02-shop-all-desktop', '/shop', DESKTOP],
  ['DT-03-collection-desktop', '/shop?type=Serum', DESKTOP],
  ['DT-04-skin-concerns-desktop', '/skin-concerns', DESKTOP],
  ['DT-05-skin-concern-detail-desktop', '/skin-concerns/breakouts-congestion', DESKTOP],
  ['DT-06-product-detail-desktop', '/shop/green-tea-citrus-cleanser', DESKTOP],
  ['DT-07-routines-desktop', '/routine', DESKTOP],
  ['DT-08-consultation-landing-desktop', '/virtual-consultation', DESKTOP],
  ['DT-11-skin-quiz-desktop', '/skin-quiz', DESKTOP],
  ['DT-12-journal-desktop', '/journal', DESKTOP],
  ['DT-13-journal-article-desktop', '/journal/order-of-operations', DESKTOP],
  ['DT-14-about-desktop', '/about', DESKTOP],
  ['DT-15-ingredients-desktop', '/ingredients', DESKTOP],
  ['DT-16-help-desktop', '/help', DESKTOP],
  ['DT-17-contact-desktop', '/contact', DESKTOP],
  ['DT-18-search-desktop', '/search?q=serum', DESKTOP],
  ['DT-19-cart-desktop', '/cart', DESKTOP],
  ['DT-20-checkout-via-cart-desktop', '/cart', DESKTOP],
  ['DT-21-account-login-desktop', '/account/login', DESKTOP],
  ['DT-22-account-desktop', '/account', DESKTOP],
  ['DT-23-shipping-desktop', '/shipping', DESKTOP],
  ['DT-24-legal-privacy-desktop', '/privacy', DESKTOP],
  ['DT-25-how-it-works-desktop', '/how-it-works', DESKTOP],
  ['DT-26-favorites-desktop', '/favorites', DESKTOP],
  ['DT-27-order-confirmation-desktop', '/cart/confirmation', DESKTOP],
  ['mobile-home-390', '/', MOBILE],
  ['mobile-shop-390', '/shop', MOBILE],
  ['mobile-concerns-390', '/skin-concerns', MOBILE],
  ['mobile-pdp-390', '/shop/green-tea-citrus-cleanser', MOBILE],
  ['mobile-account-login-390', '/account/login', MOBILE]
];

const browser = await chromium.launch({ executablePath, headless: true });
const findings = [];

for (const [name, path, viewport] of SHOTS) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));

  try {
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(500);

    const facts = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      const broken = [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src);
      const h1 = document.querySelector('h1');
      return {
        overflow,
        broken,
        title: document.title,
        h1: h1 ? h1.innerText.replace(/\s+/g, ' ').slice(0, 70) : null
      };
    });

    await page.screenshot({ path: OUT + '/' + name + '.png', fullPage: false });
    findings.push({ name, path, status: res ? res.status() : null, ...facts, errors: errors.slice(0, 3) });
  } catch (err) {
    findings.push({ name, path, status: 'ERROR', error: String(err).slice(0, 200) });
  }
  await context.close();
}

await browser.close();

let bad = 0;
for (const f of findings) {
  const problems = [];
  if (f.status !== 200) problems.push('status=' + f.status);
  if (f.overflow > 1) problems.push('overflow=' + f.overflow + 'px');
  if (f.broken && f.broken.length) problems.push('broken-images=' + f.broken.length);
  if (f.errors && f.errors.length) problems.push('console=' + f.errors.length);
  if (problems.length) bad += 1;
  const label = (problems.length ? 'FAIL' : 'ok  ') + '  ' + f.name.padEnd(30) + ' ' + f.path.padEnd(36);
  console.log(label + ' ' + f.status + '  h1=' + (f.h1 ? JSON.stringify(f.h1) : 'none') + '  ' + problems.join(' '));
}
console.log('\n' + (findings.length - bad) + '/' + findings.length + ' captures clean');
