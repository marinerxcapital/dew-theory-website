#!/usr/bin/env node
/**
 * End-to-end proof of the customer identity subsystem.
 *
 * Drives the real UI against a running server:
 *   register -> save a favorite -> see it on /favorites -> sign out
 *   -> protected route redirects -> second account sees an empty list
 *
 * Usage: node scripts/_e2e-customer.mjs http://localhost:3000
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('no local Chrome/Edge found');
  process.exit(1);
}

const stamp = Date.now().toString(36);
const A = { email: 'e2e.a.' + stamp + '@example.com', password: 'e2e-account-A-pass' };
const B = { email: 'e2e.b.' + stamp + '@example.com', password: 'e2e-account-B-pass' };

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
}

async function register(page, account) {
  await page.goto(BASE + '/account/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Create account' }).first().click();
  /* Attribute selectors rather than label text: the password label carries a
     visible hint, so its accessible name is longer than the word "Password". */
  await page.locator('input[autocomplete="name"]').fill('E2E ' + account.email.slice(0, 6));
  await page.locator('input[type="email"]').fill(account.email);
  const newPasswords = page.locator('input[autocomplete="new-password"]');
  await newPasswords.nth(0).fill(account.password);
  await newPasswords.nth(1).fill(account.password);
  await page.getByRole('button', { name: 'Create account' }).last().click();
  /* The sign-in page navigates client-side after the session cookie is set, so
     poll the URL rather than waiting on a load event that never fires. */
  for (let i = 0; i < 40; i += 1) {
    if (page.url().endsWith('/account')) return;
    await page.waitForTimeout(500);
  }
  throw new Error('registration did not land on /account (url=' + page.url() + ')');
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await register(page, A);
  check('A registers and lands on /account', page.url().endsWith('/account'), page.url());
  check('A account page shows own email', (await page.content()).includes(A.email));

  await page.goto(BASE + '/shop/green-tea-citrus-cleanser', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Save to favorites' }).click();
  await page.waitForTimeout(1200);
  const savedIds = await page.evaluate(async () => {
    const res = await fetch('/api/customer/favorites', { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    return data.productIds || [];
  });
  check(
    'A can save a product (persisted server-side)',
    savedIds.includes('green-tea-citrus-cleanser'),
    'saved=' + JSON.stringify(savedIds)
  );

  await page.goto(BASE + '/favorites', { waitUntil: 'domcontentloaded' });
  const favHtml = await page.content();
  check('A favorites page lists the saved product', favHtml.includes('Green Tea Citrus Cleanser'));

  await page.goto(BASE + '/account', { waitUntil: 'domcontentloaded' });
  /* Assert on the computed accessible name, not raw HTML: React separates the
     label and the interpolated count with comment nodes in the server output. */
  const favLink = page.getByRole('link', { name: 'Favorites (1)' });
  check('A account page shows the favorites count', (await favLink.count()) === 1);

  await page.goto(BASE + '/account', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(1200);
  await page.goto(BASE + '/favorites', { waitUntil: 'domcontentloaded' });
  check('signed-out /favorites redirects to sign-in', page.url().includes('/account/login'), page.url());

  const apiStatus = await page.evaluate(async () => {
    const res = await fetch('/api/customer/favorites', { headers: { Accept: 'application/json' } });
    return res.status;
  });
  check('signed-out favorites API returns 401', apiStatus === 401, 'status=' + apiStatus);

  await register(page, B);
  await page.goto(BASE + '/favorites', { waitUntil: 'domcontentloaded' });
  const bHtml = await page.content();
  check('B favorites list is empty (cross-account isolation)', bHtml.includes('No favorites yet.'));
  check('B never sees A saved product', !bHtml.includes('Green Tea Citrus Cleanser'));

  await ctx.close();
} catch (err) {
  check('script completed without exception', false, String(err).slice(0, 220));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' customer E2E checks passed');
process.exit(failed.length ? 1 : 0);
