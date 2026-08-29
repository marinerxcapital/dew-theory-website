/**
 * Client-safe local search index for Dew Theory public storefront entities.
 * No fake trending queries; results only from real catalog + known routes.
 */

import { PRODUCTS, CATEGORIES } from './products.js';
import { isShopVisible } from './shop.js';

/** @typedef {'product' | 'service' | 'guide' | 'page'} SearchKind */

/**
 * @typedef {{
 *   id: string,
 *   kind: SearchKind,
 *   title: string,
 *   subtitle?: string,
 *   href: string,
 *   keywords: string[]
 * }} SearchItem
 */

/** @type {SearchItem[]} */
const STATIC_PAGES = [
  {
    id: 'page-shop',
    kind: 'page',
    title: 'Shop Skin Script',
    subtitle: 'Full collection',
    href: '/shop',
    keywords: ['shop', 'products', 'skincare', 'skin script', 'collection']
  },
  {
    id: 'page-vc',
    kind: 'guide',
    title: 'Virtual Consultation',
    subtitle: 'Zoom visit with Emily',
    href: '/virtual-consultation',
    keywords: ['virtual', 'consultation', 'zoom', 'online', 'intake', 'photos']
  },
  {
    id: 'page-shipping',
    kind: 'page',
    title: 'Shipping',
    subtitle: 'Free at $49+ product subtotal',
    href: '/shipping',
    keywords: ['shipping', 'delivery', 'free shipping']
  },
  {
    id: 'page-returns',
    kind: 'page',
    title: 'Returns',
    subtitle: 'Return policy',
    href: '/returns',
    keywords: ['returns', 'refund', 'exchange']
  },
  {
    id: 'page-privacy',
    kind: 'page',
    title: 'Privacy',
    subtitle: 'Privacy policy',
    href: '/privacy',
    keywords: ['privacy', 'data', 'policy']
  },
  {
    id: 'page-terms',
    kind: 'page',
    title: 'Terms',
    subtitle: 'Terms of use and sale',
    href: '/terms',
    keywords: ['terms', 'sale', 'legal']
  },
  {
    id: 'page-booking-policy',
    kind: 'page',
    title: 'Booking policy',
    subtitle: 'Cancellation and no-show',
    href: '/booking-policy',
    keywords: ['booking', 'cancellation', 'no-show', 'policy']
  },
  {
    id: 'page-accessibility',
    kind: 'page',
    title: 'Accessibility',
    subtitle: 'Accessibility statement',
    href: '/accessibility',
    keywords: ['accessibility', 'a11y', 'access']
  },
  {
    id: 'page-cookies',
    kind: 'page',
    title: 'Cookies',
    subtitle: 'Cookie and tracking notice',
    href: '/cookies',
    keywords: ['cookies', 'tracking', 'privacy']
  }
];

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s/+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {object[]} [catalog]
 * @returns {SearchItem[]}
 */
export function buildSearchIndex(catalog = PRODUCTS) {
  /** @type {SearchItem[]} */
  const items = [];

  for (const p of catalog) {
    if (!isShopVisible(p)) continue;
    const concerns = Array.isArray(p.conditions_addressed) ? p.conditions_addressed : [];
    const skin = Array.isArray(p.skin_types) ? p.skin_types : [];
    const actives = Array.isArray(p.key_actives)
      ? p.key_actives.map((a) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
      : [];
    items.push({
      id: `product-${p.id}`,
      kind: 'product',
      title: p.name,
      subtitle: [p.category, p.size].filter(Boolean).join(' · '),
      href: `/shop/${p.id}`,
      keywords: [
        p.name,
        p.category,
        p.description_short,
        ...concerns,
        ...skin,
        ...actives,
        'skin script',
        'product'
      ].filter(Boolean)
    });
  }

  for (const cat of CATEGORIES) {
    if (!catalog.some((p) => p.category === cat && isShopVisible(p))) continue;
    items.push({
      id: `cat-${cat}`,
      kind: 'page',
      title: cat,
      subtitle: 'Shop by type',
      href: `/shop?type=${encodeURIComponent(cat)}`,
      keywords: [cat, 'category', 'shop', 'type']
    });
  }

  items.push(...STATIC_PAGES);
  return items;
}

/**
 * Score a query against an item (higher is better).
 * @param {SearchItem} item
 * @param {string} query
 */
function scoreItem(item, query) {
  const q = normalize(query);
  if (!q) return 0;
  const tokens = q.split(' ').filter(Boolean);
  const title = normalize(item.title);
  const subtitle = normalize(item.subtitle || '');
  const hay = normalize([item.title, item.subtitle, ...(item.keywords || [])].join(' '));

  let score = 0;
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 60;
  if (title.includes(q)) score += 40;
  if (subtitle.includes(q)) score += 20;
  if (hay.includes(q)) score += 10;

  for (const t of tokens) {
    if (title.includes(t)) score += 12;
    else if (hay.includes(t)) score += 4;
    else return 0;
  }

  // Prefer products slightly for commerce discovery
  if (item.kind === 'product') score += 2;
  if (item.kind === 'guide') score += 1;
  return score;
}

/**
 * @param {string} query
 * @param {{ limit?: number, catalog?: object[], index?: SearchItem[] }} [opts]
 * @returns {{ groups: Record<string, SearchItem[]>, flat: SearchItem[], total: number }}
 */
export function searchStorefront(query, opts = {}) {
  const limit = opts.limit ?? 12;
  const index = opts.index || buildSearchIndex(opts.catalog);
  const q = String(query || '').trim();
  if (!q) {
    return { groups: {}, flat: [], total: 0 };
  }

  const scored = index
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  const flat = scored.slice(0, limit).map((r) => r.item);
  /** @type {Record<string, SearchItem[]>} */
  const groups = { Products: [], Services: [], Guides: [], Pages: [] };
  for (const item of flat) {
    if (item.kind === 'product') groups.Products.push(item);
    else if (item.kind === 'service') groups.Services.push(item);
    else if (item.kind === 'guide') groups.Guides.push(item);
    else groups.Pages.push(item);
  }

  // Drop empty groups
  for (const key of Object.keys(groups)) {
    if (!groups[key].length) delete groups[key];
  }

  return { groups, flat, total: scored.length };
}

export const SEARCH_GROUP_ORDER = ['Products', 'Services', 'Guides', 'Pages'];
