const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(
  /\/$/,
  ''
);

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/virtual-consultation/intake',
          '/virtual-consultation/intake/',
          '/virtual-consultation/plan',
          '/virtual-consultation/plan/',
          '/virtual-consultation/success',
          '/cart/confirmation',
          '/cart/confirmation/'
        ]
      }
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site
  };
}
