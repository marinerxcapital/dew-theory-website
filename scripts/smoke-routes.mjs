/**
 * Smoke: hit key public + admin login routes (dev server must be up).
 * Usage: node scripts/smoke-routes.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.SMOKE_BASE || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

// Public storefront + policies + admin login.
const paths = [
  '/',
  '/shop',
  '/virtual-consultation',
  '/cart',
  '/privacy',
  '/terms',
  '/shipping',
  '/returns',
  '/booking-policy',
  '/aesthetic-disclaimer',
  '/cookies',
  '/accessibility',
  '/admin/login',
  // Public FIXED V2 PDFs
  '/legal/pdfs/DEW_THEORY_PRIVACY_POLICY.pdf',
  '/legal/pdfs/DEW_THEORY_TERMS_OF_USE_AND_SALE.pdf',
  '/legal/pdfs/DEW_THEORY_SHIPPING_AND_DELIVERY_POLICY.pdf',
  '/legal/pdfs/DEW_THEORY_RETURNS_REFUNDS_AND_EXCHANGES_POLICY.pdf',
  '/legal/pdfs/DEW_THEORY_BOOKING_CANCELLATION_AND_NO_SHOW_POLICY.pdf',
  '/legal/pdfs/DEW_THEORY_AESTHETIC_SERVICES_AND_SKINCARE_DISCLAIMER.pdf',
  '/legal/pdfs/DEW_THEORY_COOKIE_AND_TRACKING_TECHNOLOGIES_NOTICE.pdf',
  '/legal/pdfs/DEW_THEORY_ACCESSIBILITY_STATEMENT.pdf'
];

let failed = 0;
for (const p of paths) {
  const url = base + p;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const ok = res.status >= 200 && res.status < 400;
    const isPdf = p.endsWith('.pdf');
    const typeOk =
      !isPdf ||
      (res.headers.get('content-type') || '').toLowerCase().includes('application/pdf') ||
      (res.headers.get('content-type') || '').toLowerCase().includes('octet-stream');
    console.log(
      ok && typeOk ? 'OK ' : 'FAIL',
      res.status,
      p,
      isPdf ? res.headers.get('content-type') || '' : ''
    );
    if (!ok || !typeOk) failed += 1;
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
