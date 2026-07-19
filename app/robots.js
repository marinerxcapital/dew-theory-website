const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/api']
      }
    ],
    sitemap: `${site.replace(/\/$/, '')}/sitemap.xml`
  };
}
