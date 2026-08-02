import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(
  /\/$/,
  ''
);

/** Public storefront routes. Extend here when new static pages ship. */
const STATIC = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/shop', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/quiz', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/routine', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/book', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/membership', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/virtual-consultation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/cart', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/shipping', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/returns', changeFrequency: 'yearly', priority: 0.3 }
];

export default function sitemap() {
  const now = new Date();

  const staticEntries = STATIC.map(({ path, changeFrequency, priority }) => ({
    url: `${site}${path || '/'}`,
    lastModified: now,
    changeFrequency,
    priority
  }));

  // Active storefront products only (same visibility as /shop).
  const productEntries = getProducts()
    .filter(isShopVisible)
    .map((product) => ({
      url: `${site}/shop/${product.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    }));

  return [...staticEntries, ...productEntries];
}
