/**
 * Expand products.json + allowlist + portal registry from Agent D crosswalk.
 * Only includes consumer skincare/kits with verified SKUs. Excludes accessories/mists.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CROSS = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.artifacts/final-catalog/verified-variant-crosswalk.json'), 'utf8')
);
const productsPath = path.join(ROOT, 'data/products.json');
const allowPath = path.join(ROOT, 'data/catalog-allowlist.json');
const portalPath = path.join(ROOT, 'data/supplier/skin-script-portal-urls.json');
const catalog = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const allow = JSON.parse(fs.readFileSync(allowPath, 'utf8'));
const portal = JSON.parse(fs.readFileSync(portalPath, 'utf8'));

const EXCLUDE_IDS = new Set([
  'fan-brush',
  'retail-cleanser-pump',
  'retail-shopping-bags',
  'desert-collection-sensory-mists'
]);

const CATEGORY_BY_ID = {
  'acai-berry-moisturizer': 'Moisturizer',
  'advanced-renewal-serum': 'Serum',
  'barrier-balancing-moisturizer': 'Moisturizer',
  'blemish-spot-treatment': 'Spot Treatment',
  'charcoal-clay-cleanser': 'Cleanser',
  'citrus-c-nourishing-cream': 'Serum',
  'clarifying-toner-pads': 'Exfoliant',
  'discovery-kit': 'Kit',
  'everyday-balance-travel-kit': 'Kit',
  'fresh-face-travel-kit': 'Kit',
  'fully-quenched-travel-kit': 'Kit',
  'glycolic-and-retinol-pads': 'Exfoliant',
  'glycolic-cleanser': 'Cleanser',
  'honey-brightening-cleanser': 'Cleanser',
  'hydrating-moisturizer': 'Moisturizer',
  'light-aloe-moisturizer': 'Moisturizer',
  'lip-balm-with-spf-15': 'Lip Treatment',
  'mint-refining-toner': 'Toner',
  'peptide-eye-serum': 'Eye Treatment',
  'peptide-moisturizer': 'Moisturizer',
  'pomegranate-antioxidant-cleanser': 'Cleanser',
  'raspberry-refining-cleanser': 'Cleanser',
  'raspberry-scrub': 'Exfoliant',
  'retinol-exfoliating-scrub': 'Exfoliant',
  'revitalizing-cucumber-treatment': 'Exfoliant',
  'tri-peptide-eye-cream': 'Eye Treatment',
  'triple-c-serum': 'Serum'
};

const NAME_TO_MANIFEST = {
  // for media install later
};

function money2(n) {
  return Math.round(Number(n) * 100) / 100;
}

const existingIds = new Set(catalog.products.map((p) => p.id));
const added = [];

for (const row of CROSS.products || []) {
  if (row.status !== 'VERIFIED') continue;
  const id = row.dew_product_id;
  if (!id || existingIds.has(id) || EXCLUDE_IDS.has(id)) continue;
  if (!CATEGORY_BY_ID[id]) continue;
  const v = row.chosen_retail_variant || {};
  if (!v.sku || v.wholesale == null) continue;

  const wholesale = money2(v.wholesale);
  const retail = money2(wholesale * 2);
  const stock =
    String(v.stock || '').toLowerCase().includes('out') || v.is_in_stock === false
      ? 'out_of_stock'
      : 'in_stock';

  const product = {
    id,
    name: row.canonical_name,
    category: CATEGORY_BY_ID[id],
    size: v.size || '',
    size_confirmed: Boolean(v.size),
    wholesale_price: wholesale,
    retail_price: retail,
    retail_price_confirmed: false,
    retail_price_note: 'Computed as verified Skin Script wholesale × 2; Emily confirmation pending.',
    skin_types: [],
    key_actives: [],
    how_to_use: '',
    conditions_addressed: [],
    description_short: `${row.canonical_name} — Skin Script professional formula, sold retail at Dew Theory.`,
    stock_status: stock,
    skin_script_sku: String(v.sku),
    active: true,
    images: [],
    image_webp: '',
    image_alt: `Skin Script ${row.canonical_name} on Dew Theory sage background`,
    source: 'skin-script-portal-verified-2026-09-20'
  };
  catalog.products.push(product);
  existingIds.add(id);
  added.push({ id, sku: v.sku, wholesale, retail, url: row.product_url, size: v.size || '' });

  allow.products.push({
    product_id: id,
    skin_script_sku: String(v.sku),
    supplier_product_url: row.product_url,
    sync_enabled: true
  });

  portal.products.push({
    product_id: id,
    skin_script_sku: String(v.sku),
    supplier_product_url: row.product_url,
    supplier_product_name: row.canonical_name,
    supplier_size: v.size || null,
    variant: v.size || null,
    expected_wholesale_price: wholesale,
    verified: true,
    verified_at: '2026-09-20',
    notes: 'Verified via authenticated WC Store variation product endpoint (Agent D).'
  });
}

// Expand categories list
const cats = new Set(catalog.categories || []);
for (const p of catalog.products) cats.add(p.category);
catalog.categories = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Exfoliant',
  'Mask',
  'Eye Treatment',
  'Lip Treatment',
  'Spot Treatment',
  'SPF',
  'Kit'
].filter((c) => cats.has(c) || ['Cleanser', 'Serum', 'Moisturizer', 'SPF', 'Toner', 'Exfoliant', 'Mask', 'Lip Treatment'].includes(c));

// sort allowlist/portal
allow.products.sort((a, b) => a.product_id.localeCompare(b.product_id));
portal.products.sort((a, b) => a.product_id.localeCompare(b.product_id));
if (allow._meta) {
  allow._meta.note = `Expanded curated allowlist ${allow.products.length} SKUs (2026-09-20). Sync-enabled only for verified retail variants.`;
}
if (portal._meta) {
  portal._meta.note = `Verified portal registry ${portal.products.length} products (2026-09-20).`;
}

fs.writeFileSync(productsPath, JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(allowPath, JSON.stringify(allow, null, 2) + '\n');
fs.writeFileSync(portalPath, JSON.stringify(portal, null, 2) + '\n');
fs.writeFileSync(
  path.join(ROOT, '.artifacts/final-catalog/catalog-expansion-report.json'),
  JSON.stringify({ added_count: added.length, added, total_products: catalog.products.length }, null, 2)
);
console.log(JSON.stringify({ added: added.length, total: catalog.products.length }, null, 2));
