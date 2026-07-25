/**
 * Smoke: hit key public + admin login routes (dev server must be up).
 * Usage: node scripts/smoke-routes.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.SMOKE_BASE || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

// Public storefront + admin login (matches sitemap static set; no policy pages unless present).
const paths = [
  '/',
  '/shop',
  '/services',
  '/book',
  '/about',
  '/virtual-consultation',
  '/contact',
  '/cart',
  '/admin/login'
];

let failed = 0;
for (const p of paths) {
  const url = base + p;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const ok = res.status >= 200 && res.status < 400;
    console.log(ok ? 'OK ' : 'FAIL', res.status, p);
    if (!ok) failed += 1;
  } catch (e) {
    console.log('FAIL', p, e.message);
    failed += 1;
  }
}

if (failed) {
  console.error(`smoke-routes: ${failed} failed (is dev/start running at ${base}?)`);
  process.exit(1);
}
console.log('smoke-routes: all clear');
