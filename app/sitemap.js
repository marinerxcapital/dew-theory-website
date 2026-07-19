const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const STATIC = [
  '',
  '/shop',
  '/services',
  '/book',
  '/about',
  '/studio',
  '/membership',
  '/contact',
  '/cart'
];

export default function sitemap() {
  const now = new Date();
  return STATIC.map((path) => ({
    url: `${site}${path || '/'}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/shop' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/shop' || path === '/book' ? 0.9 : 0.6
  }));
}
