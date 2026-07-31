/**
 * Membership packages — structure only.
 * Prices stay null unless MEMBERSHIP_PACKAGES_JSON is provided by the owner.
 * Never invent Emily’s tiers.
 */

/**
 * @typedef {{ id: string, name: string, description: string, price_cents: number|null, interval: string|null, perks: string[] }} MembershipPackage
 */

/** Directional skeletons — price_cents null until env override */
export const DEFAULT_MEMBERSHIP_PACKAGES = [
  {
    id: 'rhythm-care',
    name: 'Rhythm of care',
    description: 'A steady cadence of facials when Emily opens membership.',
    price_cents: null,
    interval: null,
    perks: ['Priority booking windows', 'Facial cadence set with Emily', 'Restock notices']
  },
  {
    id: 'home-clinical',
    name: 'Home + clinical',
    description: 'In-studio visits paired with home care guidance — terms TBD.',
    price_cents: null,
    interval: null,
    perks: ['Facial allotment (TBD)', 'Routine check-ins', 'Shop guidance between visits']
  }
];

/**
 * @returns {MembershipPackage[]}
 */
export function getMembershipPackages() {
  const raw = process.env.MEMBERSHIP_PACKAGES_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map(normalizePackage).filter(Boolean);
      }
    } catch {
      // fall through to defaults
    }
  }
  return DEFAULT_MEMBERSHIP_PACKAGES.map((p) => ({ ...p }));
}

function normalizePackage(p) {
  if (!p || typeof p !== 'object' || !p.id || !p.name) return null;
  const price =
    p.price_cents == null || p.price_cents === ''
      ? null
      : Number(p.price_cents);
  return {
    id: String(p.id).slice(0, 64),
    name: String(p.name).slice(0, 120),
    description: String(p.description || '').slice(0, 500),
    price_cents: Number.isFinite(price) && price > 0 ? Math.round(price) : null,
    interval: p.interval ? String(p.interval).slice(0, 32) : null,
    perks: Array.isArray(p.perks)
      ? p.perks.map((x) => String(x).slice(0, 200)).slice(0, 12)
      : []
  };
}

export function formatPackagePrice(pkg) {
  if (!pkg?.price_cents) return 'Price set by Emily';
  const dollars = (pkg.price_cents / 100).toFixed(pkg.price_cents % 100 === 0 ? 0 : 2);
  const interval = pkg.interval ? ` / ${pkg.interval}` : '';
  return `$${dollars}${interval}`;
}

export function membershipCheckoutEnabled() {
  return getMembershipPackages().some((p) => p.price_cents != null && p.price_cents > 0);
}
