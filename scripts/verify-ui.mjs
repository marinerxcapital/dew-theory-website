#!/usr/bin/env node
/**
 * UI verification — real device emulation against a live or local base URL.
 *
 * Reports horizontal overflow per viewport, the widest offending elements,
 * accessibility facts (heading order, alt coverage, broken images, console
 * errors), and writes screenshots for visual review.
 *
 *   node scripts/verify-ui.mjs https://dewtheoryco.com
 *
 * Requires playwright-core plus a local Chrome/Edge install. Not part of the
 * production dependency set.
 */

import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BASE = (process.argv[2] || process.env.VERIFY_BASE || 'https://dewtheoryco.com').replace(
  /\/$/,
  ''
);

const OUT = resolve('reports', 'ui-verify');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));

const VIEWPORTS = [
  { name: '320', width: 320, height: 720, mobile: true },
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '430', width: 430, height: 932, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: false },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1280', width: 1280, height: 800, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false }
];

const PAGES = [
  { path: '/', shot: 'home' },
  { path: '/shop', shot: 'shop' },
  { path: '/virtual-consultation', shot: 'consult' },
  { path: '/shop/hydrating-skin-serum', shot: 'pdp' },
  { path: '/skin-quiz', shot: 'skin-quiz' },
  { path: '/routine', shot: 'routine' }
];

/** Runs in the page: measure horizontal overflow and name the offenders. */
function measureOverflow() {
  const docW = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') {
      continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const over = Math.round(r.right - docW);
    if (over > 1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 80),
        right: Math.round(r.right),
        over
      });
    }
  }
  offenders.sort((a, b) => b.over - a.over);
  return {
    clientWidth: docW,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 6)
  };
}

/** Runs in the page: heading order, images, labels, landmarks. */
function measureA11y() {
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
    level: Number(h.tagName[1]),
    text: (h.textContent || '').trim().slice(0, 70)
  }));
  let previous = 0;
  const jumps = [];
  for (const h of headings) {
    if (previous && h.level > previous + 1) jumps.push(`${previous}->${h.level}: ${h.text}`);
    previous = h.level;
  }
  const imgs = [...document.images];
  const inputs = [...document.querySelectorAll('input,select,textarea')];
  const unlabelled = inputs.filter((el) => {
    if (el.type === 'hidden') return false;
    const id = el.getAttribute('id');
    if (id && document.querySelector(`label[for="${id}"]`)) return false;
    if (el.closest('label')) return false;
    return !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby');
  }).length;

  return {
    h1Count: headings.filter((h) => h.level === 1).length,
    headingJumps: jumps,
    headings: headings.slice(0, 14),
    images: imgs.length,
    missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    broken: imgs
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
    unlabelledInputs: unlabelled,
    hasMain: Boolean(document.querySelector('main')),
    hasSkipLink: Boolean(document.querySelector('.skip-link')),
    lang: document.documentElement.lang
  };
}

const results = [];
const problems = [];

const browser = await chromium.launch({ executablePath, headless: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile
  });

  for (const page of PAGES) {
    const tab = await context.newPage();
    const consoleErrors = [];
    tab.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160));
    });
    tab.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`.slice(0, 160)));

    let status = 0;
    try {
      const res = await tab.goto(`${BASE}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      status = res?.status() ?? 0;
    } catch (e) {
      problems.push(`${vp.name} ${page.path} navigation failed: ${e.message}`);
      await tab.close();
      continue;
    }

    await tab.waitForTimeout(500);
    const overflow = await tab.evaluate(measureOverflow);
    const a11y = vp.name === '390' || vp.name === '1440' ? await tab.evaluate(measureA11y) : null;

    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      problems.push(
        `${vp.name} ${page.path} horizontal overflow: ${overflow.scrollWidth} > ${overflow.clientWidth}` +
          (overflow.offenders.length
            ? ` | widest: ${overflow.offenders
                .map((o) => `${o.tag}.${o.cls.split(' ')[0]}(+${o.over}px)`)
                .join(', ')}`
            : '')
      );
    }
    if (a11y?.broken?.length) {
      problems.push(`${vp.name} ${page.path} broken images: ${a11y.broken.slice(0, 3).join(', ')}`);
    }
    if (a11y?.headingJumps?.length) {
      problems.push(
        `${vp.name} ${page.path} heading jumps: ${a11y.headingJumps.slice(0, 3).join(' | ')}`
      );
    }
    if (a11y && a11y.h1Count !== 1) {
      problems.push(`${vp.name} ${page.path} h1 count = ${a11y.h1Count}`);
    }
    if (consoleErrors.length) {
      problems.push(
        `${vp.name} ${page.path} console errors: ${consoleErrors.slice(0, 2).join(' || ')}`
      );
    }

    results.push({ viewport: vp.name, path: page.path, status, overflow, a11y, consoleErrors });
    await tab.screenshot({ path: join(OUT, `${page.shot}-${vp.name}.png`), fullPage: false });
    await tab.close();
  }

  await context.close();
}

await browser.close();

console.log(`Verified ${BASE} across ${VIEWPORTS.length} viewports / ${PAGES.length} pages`);
console.log(`Screenshots: ${OUT}`);
console.table(
  results.map((r) => ({
    viewport: r.viewport,
    path: r.path,
    status: r.status,
    scrollWidth: r.overflow.scrollWidth,
    clientWidth: r.overflow.clientWidth,
    errors: r.consoleErrors.length
  }))
);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log('\nNo overflow, broken-image, heading-order, or console-error problems found.');
