const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/api',
          '/virtual-consultation/intake',
          '/virtual-consultation/intake/',
          '/virtual-consultation/plan',
          '/virtual-consultation/plan/',
          '/virtual-consultation/success'
        ]
      }
    ],
    sitemap: `${site.replace(/\/$/, '')}/sitemap.xml`
  };
}
