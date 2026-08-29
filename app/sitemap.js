import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { getPublicLegalRoutes } from '@/lib/legal-documents';

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(
  /\/$/,
  ''
);

/** Public storefront routes. Extend here when new static pages ship. */
const STATIC = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/shop', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/virtual-consultation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/cart', changeFrequency: 'monthly', priority: 0.4 },
  ...getPublicLegalRoutes().map((path) => ({
    path,
    changeFrequency: 'yearly',
    priority: 0.3
  }))
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
