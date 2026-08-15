/**
 * Shop PLP filtering + sorting — driven by real product metadata only.
 */

import { CATEGORIES } from './products.js';
import { isShopVisible } from './shop.js';
import { ROUTINE_ORDER } from './routine.js';

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A–Z' }
];

/** Normalized concern labels derived from catalog conditions_addressed. */
export const CONCERN_ALIASES = {
  'excess oil': 'Excess oil',
  'congestion / buildup': 'Congestion',
  congestion: 'Congestion',
  dullness: 'Dullness',
  dryness: 'Dryness',
  dehydration: 'Dehydration',
  'dryness / dehydration': 'Dryness',
  sensitivity: 'Sensitivity',
  'barrier support': 'Barrier support',
  texture: 'Texture',
  hyperpigmentation: 'Uneven tone',
  'uneven tone': 'Uneven tone',
  'enlarged pores': 'Texture',
  'mild breakouts': 'Congestion',
  'lip hydration': 'Lip hydration',
  'sun protection': 'SPF / protection',
  spf: 'SPF / protection'
};

/**
 * @param {object[]} products
 * @returns {string[]}
 */
export function collectConcerns(products) {
  const set = new Set();
  for (const p of products) {
    for (const raw of p.conditions_addressed || []) {
      const key = String(raw).toLowerCase().trim();
      const label = CONCERN_ALIASES[key] || titleCase(raw);
      set.add(label);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {object[]} products
 * @returns {string[]}
 */
export function collectSkinTypes(products) {
  const set = new Set();
  for (const p of products) {
    for (const raw of p.skin_types || []) {
      const s = String(raw).toLowerCase();
      if (s.includes('all')) {
        set.add('All skin types');
        continue;
      }
      // Take first token before em-dash notes
      const base = s.split(/[—–-]/)[0].trim();
      if (base) set.add(titleCase(base));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {object[]} products
 * @returns {string[]}
 */
export function presentCategories(products) {
  return CATEGORIES.filter((c) => products.some((p) => p.category === c));
}

/**
 * @param {object[]} products
 * @returns {string[]}
 */
export function presentRoutineSteps(products) {
  return ROUTINE_ORDER.filter((c) => products.some((p) => p.category === c));
}

function titleCase(s) {
  return String(s)
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function productMatchesConcern(product, concern) {
  const target = String(concern).toLowerCase();
  return (product.conditions_addressed || []).some((c) => {
    const raw = String(c).toLowerCase();
    const mapped = (CONCERN_ALIASES[raw] || c).toLowerCase();
    return mapped === target || raw.includes(target) || target.includes(raw);
  });
}

function productMatchesSkin(product, skin) {
  const target = String(skin).toLowerCase();
  if (target === 'all skin types') {
    return (product.skin_types || []).some((s) => String(s).toLowerCase().includes('all'));
  }
  return (product.skin_types || []).some((s) => {
    const base = String(s).toLowerCase().split(/[—–-]/)[0].trim();
    return base === target || base.includes(target);
  });
}

/**
 * @typedef {{
 *   type?: string,
 *   concern?: string,
 *   skin?: string,
 *   step?: string,
 *   time?: 'am' | 'pm' | '',
 *   minPrice?: number | null,
 *   maxPrice?: number | null,
 *   sort?: string
 * }} ShopFilterState
 */

/**
 * @param {object[]} products
 * @param {ShopFilterState} filters
 */
export function filterProducts(products, filters = {}) {
  const visible = products.filter(isShopVisible);
  return visible.filter((p) => {
    if (filters.type && filters.type !== 'all' && p.category !== filters.type) return false;
    if (filters.step && p.category !== filters.step) return false;
    if (filters.concern && !productMatchesConcern(p, filters.concern)) return false;
    if (filters.skin && !productMatchesSkin(p, filters.skin)) return false;
    if (filters.time === 'am') {
      // SPF is AM-only; exfoliants often PM-preferred but still allowed AM per catalog copy
      // Prefer products that are not exclusively evening (heuristic: SPF required for AM filter emphasis)
      if (p.category === 'Mask') return false;
    }
    if (filters.time === 'pm') {
      if (p.category === 'SPF') return false;
    }
    const price = Number(p.retail_price) || 0;
    if (filters.minPrice != null && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice != null && price > Number(filters.maxPrice)) return false;
    return true;
  });
}

/**
 * @param {object[]} products
 * @param {string} sortId
 * @param {string[]} [featuredIds] - stable featured order by catalog sequence when omitted
 */
export function sortProducts(products, sortId = 'featured', featuredIds) {
  const list = [...products];
  if (sortId === 'price-asc') {
    return list.sort(
      (a, b) =>
        (Number(a.retail_price) || 0) - (Number(b.retail_price) || 0) ||
        a.name.localeCompare(b.name)
    );
  }
  if (sortId === 'price-desc') {
    return list.sort(
      (a, b) =>
        (Number(b.retail_price) || 0) - (Number(a.retail_price) || 0) ||
        a.name.localeCompare(b.name)
    );
  }
  if (sortId === 'name-asc') {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Featured: preserve catalog / featured id order
  if (featuredIds?.length) {
    const rank = new Map(featuredIds.map((id, i) => [id, i]));
    return list.sort((a, b) => {
      const ra = rank.has(a.id) ? rank.get(a.id) : 999;
      const rb = rank.has(b.id) ? rank.get(b.id) : 999;
      return ra - rb || a.name.localeCompare(b.name);
    });
  }
  return list;
}

/**
 * Parse URL search params into filter state (client or server).
 * @param {URLSearchParams | Record<string, string | string[] | undefined>} params
 * @returns {ShopFilterState}
 */
export function parseShopParams(params) {
  const get = (key) => {
    if (typeof params.get === 'function') return params.get(key) || '';
    const v = params[key];
    return Array.isArray(v) ? v[0] || '' : v || '';
  };
  const type = get('type') || get('category') || '';
  const concern = get('concern') || '';
  const skin = get('skin') || '';
  const step = get('step') || '';
  const timeRaw = get('time') || '';
  const time = timeRaw === 'am' || timeRaw === 'pm' ? timeRaw : '';
  const sort = get('sort') || 'featured';
  const minPrice = get('min') ? Number(get('min')) : null;
  const maxPrice = get('max') ? Number(get('max')) : null;
  return {
    type: type && type !== 'all' ? type : '',
    concern,
    skin,
    step,
    time,
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    sort: SORT_OPTIONS.some((o) => o.id === sort) ? sort : 'featured'
  };
}

/**
 * @param {ShopFilterState} state
 * @returns {URLSearchParams}
 */
export function shopStateToParams(state) {
  const p = new URLSearchParams();
  if (state.type) p.set('type', state.type);
  if (state.concern) p.set('concern', state.concern);
  if (state.skin) p.set('skin', state.skin);
  if (state.step) p.set('step', state.step);
  if (state.time) p.set('time', state.time);
  if (state.minPrice != null) p.set('min', String(state.minPrice));
  if (state.maxPrice != null) p.set('max', String(state.maxPrice));
  if (state.sort && state.sort !== 'featured') p.set('sort', state.sort);
  return p;
}

/**
 * Count active filter dimensions (excludes sort).
 * @param {ShopFilterState} state
 */
export function countActiveFilters(state) {
  let n = 0;
  if (state.type) n += 1;
  if (state.concern) n += 1;
  if (state.skin) n += 1;
  if (state.step) n += 1;
  if (state.time) n += 1;
  if (state.minPrice != null || state.maxPrice != null) n += 1;
  return n;
}
