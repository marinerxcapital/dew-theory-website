/**
 * Apply official August 2026 SRP + shipping policy + lip split.
 * NO GitHub. Wholesale integrity check vs 2x.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(ROOT, 'data/products.json');
const allowPath = path.join(ROOT, 'data/catalog-allowlist.json');
const portalPath = path.join(ROOT, 'data/supplier/skin-script-portal-urls.json');

const SRP_BY_ID = {
  'charcoal-clay-cleanser': 36,
  'glycolic-cleanser': 40,
  'green-tea-citrus-cleanser': 36,
  'honey-brightening-cleanser': 42,
  'pomegranate-antioxidant-cleanser': 36,
  'raspberry-refining-cleanser': 37,
  'clarifying-toner-pads': 28,
  'glycolic-and-retinol-pads': 36,
  'raspberry-scrub': 36,
  'retinol-exfoliating-scrub': 49,
  'revitalizing-cucumber-treatment': 52,
  'cucumber-hydration-toner': 28,
  'mint-refining-toner': 28,
  'botanical-bloom-hydrating-mask': 48,
  'sheer-protection-spf': 34,
  'lip-balm-with-spf-15': 6.5,
  'advanced-renewal-serum': 70,
  'hydrating-skin-serum': 45, // Ageless Skin Hydrating Serum
  'blemish-spot-treatment': 28,
  'citrus-c-nourishing-cream': 52,
  'mandelic-brightening-serum': 48,
  'peptide-eye-serum': 40,
  'tri-peptide-eye-cream': 40,
  'triple-c-serum': 48,
  'acai-berry-moisturizer': 41,
  'ageless-moisturizer': 30,
  'barrier-balancing-moisturizer': 36,
  'hydrating-moisturizer': 36,
  'light-aloe-moisturizer': 26,
  'peptide-moisturizer': 61,
  'everyday-balance-travel-kit': 65,
  'fresh-face-travel-kit': 62,
  'fully-quenched-travel-kit': 70,
  'lip-treatment-peppermint': 16,
  'lip-treatment-pomegranate': 16,
  // legacy combined id retired after split
  'lip-treatment-peppermint-pomegranate': 16,
  'discovery-kit': null // no official SRP in list — leave computed/block
};

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const allow = JSON.parse(fs.readFileSync(allowPath, 'utf8'));
const portal = JSON.parse(fs.readFileSync(portalPath, 'utf8'));

function money(n) {
  return Math.round(Number(n) * 100) / 100;
}

// Split lip treatment into two products if combined exists
const combinedIdx = catalog.products.findIndex((p) => p.id === 'lip-treatment-peppermint-pomegranate');
if (combinedIdx >= 0) {
  const base = catalog.products[combinedIdx];
  const pep = {
    ...structuredClone(base),
    id: 'lip-treatment-peppermint',
    name: 'Ageless Lip Treatment — Peppermint',
    skin_script_sku: '1410240',
    variants: ['Peppermint'],
    retail_price: 16,
    wholesale_price: 8,
    retail_price_confirmed: true,
    retail_price_note: 'Official Skin Script Suggested Retail Price List August 2026',
    manufacturer_name_note: 'Split from combined Peppermint/Pomegranate listing per official SRP SKUs 1410240 / 1410340.'
  };
  const pom = {
    ...structuredClone(base),
    id: 'lip-treatment-pomegranate',
    name: 'Ageless Lip Treatment — Pomegranate',
    skin_script_sku: '1410340',
    variants: ['Pomegranate'],
    retail_price: 16,
    wholesale_price: 8,
    retail_price_confirmed: true,
    retail_price_note: 'Official Skin Script Suggested Retail Price List August 2026',
    manufacturer_name_note: 'Split from combined Peppermint/Pomegranate listing per official SRP SKUs 1410240 / 1410340.',
    image_alt: 'Skin Script Ageless Lip Treatment Pomegranate on Dew Theory sage background'
  };
  // reuse media paths under peppermint id folders if needed — keep same gallery for both (same formula imagery)
  catalog.products.splice(combinedIdx, 1, pep, pom);
  // update allowlist/portal
  allow.products = allow.products.filter((p) => p.product_id !== 'lip-treatment-peppermint-pomegranate');
  portal.products = portal.products.filter((p) => p.product_id !== 'lip-treatment-peppermint-pomegranate');
  for (const row of [
    {
      product_id: 'lip-treatment-peppermint',
      skin_script_sku: '1410240',
      supplier_product_url: 'https://skinscript.com/product/new-ageless-lip-treatment/',
      sync_enabled: true
    },
    {
      product_id: 'lip-treatment-pomegranate',
      skin_script_sku: '1410340',
      supplier_product_url: 'https://skinscript.com/product/new-ageless-lip-treatment/',
      sync_enabled: true
    }
  ]) {
    allow.products.push(row);
  }
  for (const row of [
    {
      product_id: 'lip-treatment-peppermint',
      skin_script_sku: '1410240',
      supplier_product_url: 'https://skinscript.com/product/new-ageless-lip-treatment/',
      supplier_product_name: 'Ageless Lip Treatment — Peppermint',
      supplier_size: null,
      variant: 'Peppermint',
      expected_wholesale_price: 8,
      verified: true,
      verified_at: '2026-09-20',
      notes: 'Official SRP August 2026; exact SKU 1410240'
    },
    {
      product_id: 'lip-treatment-pomegranate',
      skin_script_sku: '1410340',
      supplier_product_url: 'https://skinscript.com/product/new-ageless-lip-treatment/',
      supplier_product_name: 'Ageless Lip Treatment — Pomegranate',
      supplier_size: null,
      variant: 'Pomegranate',
      expected_wholesale_price: 8,
      verified: true,
      verified_at: '2026-09-20',
      notes: 'Official SRP August 2026; exact SKU 1410340'
    }
  ]) {
    portal.products.push(row);
  }
}

const conflicts = [];
for (const p of catalog.products) {
  const srp = SRP_BY_ID[p.id];
  if (srp == null) {
    if (p.id === 'discovery-kit') {
      p.checkout_eligible = false;
      p.active = false;
      p.publish_status = 'BLOCKED_MISSING_OFFICIAL_SRP';
      p.retail_price_note = 'Discovery Kit not on official August 2026 SRP list — blocked from checkout until official SRP confirmed.';
    }
    continue;
  }
  const wholesale = Number(p.wholesale_price);
  const twoX = money(wholesale * 2);
  p.retail_price = money(srp);
  p.retail_price_confirmed = true;
  p.retail_price_note = 'Official Skin Script Suggested Retail Price List August 2026';
  p.official_srp = money(srp);
  p.computed_2x_wholesale = twoX;
  p.price_reconciled = Math.abs(twoX - money(srp)) < 0.001;
  if (!p.price_reconciled) {
    conflicts.push({
      id: p.id,
      wholesale,
      twoX,
      srp: money(srp),
      note: 'SRP vs 2× wholesale mismatch — kept official SRP; investigate wholesale/SKU'
    });
  }
  // shipping meta
  p.shipping_policy = 'dropship_standard_12_under_49';
}

catalog._meta.pricing_rule =
  'Customer price = official Skin Script Suggested Retail Price (August 2026). Integrity check: official SRP should equal exact verified wholesale × 2.';
catalog._meta.shipping_rule = {
  flat_rate_usd: 12,
  free_shipping_threshold_usd: 49,
  applies_to: 'order subtotal before discount codes (Skin Script drop-ship policy)',
  source: 'Skin Script Training Manual / Drop Ship Policy — re-verified 2026-09-20'
};

allow.products.sort((a, b) => a.product_id.localeCompare(b.product_id));
portal.products.sort((a, b) => a.product_id.localeCompare(b.product_id));

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(allowPath, JSON.stringify(allow, null, 2) + '\n');
fs.writeFileSync(portalPath, JSON.stringify(portal, null, 2) + '\n');
fs.mkdirSync(path.join(ROOT, '.artifacts/final-catalog'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, '.artifacts/final-catalog/srp-wholesale-conflicts.json'),
  JSON.stringify(conflicts, null, 2)
);
console.log(
  JSON.stringify(
    {
      products: catalog.products.length,
      conflicts: conflicts.length,
      conflict_ids: conflicts.map((c) => c.id),
      lips: catalog.products.filter((p) => p.category === 'Lip Treatment').map((p) => p.id)
    },
    null,
    2
  )
);
