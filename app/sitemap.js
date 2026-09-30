import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { getPublicLegalRoutes } from '@/lib/legal-documents';
import { CONCERN_FAMILIES } from '@/lib/concerns';
import { getAllJournalEntries } from '@/lib/journal';

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(
  /\/$/,
  ''
);

/** Public storefront routes. Extend here when new static pages ship. */
const STATIC = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/shop', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/skin-concerns', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/virtual-consultation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/skin-quiz', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/routine', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/journal', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/ingredients', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/about', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/help', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
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

  const concernEntries = CONCERN_FAMILIES.map((family) => ({
    url: `${site}/skin-concerns/${family.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  const journalEntries = getAllJournalEntries().map((entry) => ({
    url: `${site}/journal/${entry.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5
  }));

  return [...staticEntries, ...productEntries, ...concernEntries, ...journalEntries];
}
