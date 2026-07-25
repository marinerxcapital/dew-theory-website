import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'docs', 'qa');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '375x812', width: 375, height: 812 },
  { name: '390x844', width: 390, height: 844 },
  { name: '393x852', width: 393, height: 852 },
  { name: '430x932', width: 430, height: 932 },
  { name: '1440x900', width: 1440, height: 900 }
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.width < 800,
    hasTouch: vp.width < 800
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/services', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await page.waitForTimeout(800);

  const audit = await page.evaluate(() => {
    const ambient = document.querySelector('[data-ambient]');
    const orbs = document.querySelectorAll('.ambient-orb');
    const list = document.querySelector('.services-menu-list');
    const firstLi = list?.querySelector('li');
    const firstH2 = firstLi?.querySelector('h2')?.textContent?.trim();
    const listStyle = list ? getComputedStyle(list) : null;
    const mesh = document.querySelector('.ambient-mesh');
    const meshAfter = mesh ? getComputedStyle(mesh, '::after') : null;
    const cardRect = firstLi?.getBoundingClientRect();
    return {
      firstH2,
      ambientData: ambient?.getAttribute('data-ambient'),
      ambientClass: ambient?.className || null,
      orbCount: orbs.length,
      listBg: listStyle?.backgroundColor,
      listOverflow: listStyle?.overflow,
      meshAfterContent: meshAfter?.content,
      cardTop: cardRect?.top,
      cardRight: cardRect?.right,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalScroll:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });

  const file = path.join(outDir, `services-after-${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  results.push({ viewport: vp.name, file, audit });
  await context.close();
}

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/services', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await page.waitForTimeout(800);
  await page.locator('.services-menu-list').screenshot({
    path: path.join(outDir, 'services-after-list-390x844.png')
  });
  await page.locator('.services-menu-list > li').first().screenshot({
    path: path.join(outDir, 'services-after-first-card-390x844.png')
  });
  await context.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
