/**
 * Wave 4: deterministic Skin Script product image package from allowlisted studio assets.
 * Copies PNG/WebP only; does not scrape or alter label text.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const ALLOWLIST = path.join(REPO, 'public', 'images', 'products', 'skin-script');
const DIST = path.join(REPO, 'dist');
const PKG_NAME = 'skin-script-product-image-package';
const PKG_ROOT = path.join(DIST, PKG_NAME);
const ZIP_NAME = 'Dew-Theory-Skin-Script-Product-Images-2026-09-04.zip';
const ZIP_PATH = path.join(DIST, ZIP_NAME);
const PACKAGE_TS = '2026-09-04T10:00:00-04:00';
const WIDTH = 832;
const HEIGHT = 1232;

/** Mirrors lib/product-image.js SKIN_SCRIPT_IMAGE_BY_ID (fallback if seed images[] empty). */
const SKIN_SCRIPT_IMAGE_BY_ID = {
  'green-tea-citrus-cleanser':
    '/images/products/skin-script/00-green-tea-citrus-cleanser.webp',
  'mandelic-brightening-serum':
    '/images/products/skin-script/01-mandelic-brightening-serum.webp',
  'hydrating-skin-serum':
    '/images/products/skin-script/02-ageless-skin-hydrating-serum.webp',
  'ageless-moisturizer':
    '/images/products/skin-script/03-ageless-skin-moisturizer.webp',
  'botanical-bloom-hydrating-mask':
    '/images/products/skin-script/04-botanical-bloom-hydrating-mask.webp',
  'lip-treatment-peppermint-pomegranate':
    '/images/products/skin-script/05-ageless-lip-treatment.webp',
  'cucumber-hydration-toner':
    '/images/products/skin-script/06-cucumber-hydration-toner.webp',
  'sheer-protection-spf':
    '/images/products/skin-script/07-sheer-protection-spf-30.webp',
};

function sanitizeSegment(s) {
  return (
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'unknown'
  );
}

function assertAllowlisted(absPath) {
  const resolved = path.resolve(absPath);
  const root = path.resolve(ALLOWLIST) + path.sep;
  if (!resolved.startsWith(root) && resolved !== path.resolve(ALLOWLIST)) {
    throw new Error('Path traversal / not allowlisted: ' + resolved);
  }
  const base = path.basename(resolved);
  if (base.includes('..') || /[\\/]/.test(base)) {
    throw new Error('Unsafe filename: ' + base);
  }
  if (!/\.(png|webp)$/i.test(base)) {
    throw new Error('Only png/webp allowed: ' + base);
  }
  return resolved;
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function countFiles(dir) {
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

const products = JSON.parse(
  fs.readFileSync(path.join(REPO, 'data', 'products.json'), 'utf8')
).products;
const portal = JSON.parse(
  fs.readFileSync(path.join(REPO, 'data', 'supplier', 'skin-script-portal-urls.json'), 'utf8')
);
const portalById = Object.fromEntries(portal.products.map((p) => [p.product_id, p]));

function resolveSources(product) {
  const webpPublic = product.image_webp || SKIN_SCRIPT_IMAGE_BY_ID[product.id];
  const pngPublic =
    (product.images && product.images[0]) ||
    (webpPublic ? webpPublic.replace(/\.webp$/i, '.png') : null);
  const sources = [];

  for (const pub of [webpPublic, pngPublic].filter(Boolean)) {
    const base = path.basename(pub);
    const abs = assertAllowlisted(path.join(ALLOWLIST, base));
    if (!fs.existsSync(abs)) continue;
    if (!sources.some((s) => s.abs === abs)) {
      sources.push({
        publicPath: pub.startsWith('/') ? pub : '/' + pub.replace(/^[/\\]+/, ''),
        abs,
        base,
      });
    }
  }

  if (sources.length) {
    const stem = sources[0].base.replace(/\.(png|webp)$/i, '');
    for (const ext of ['.webp', '.png']) {
      const base = stem + ext;
      const abs = path.join(ALLOWLIST, base);
      if (fs.existsSync(abs)) {
        assertAllowlisted(abs);
        if (!sources.some((s) => s.abs === abs)) {
          sources.push({
            publicPath: '/images/products/skin-script/' + base,
            abs,
            base,
          });
        }
      }
    }
  }

  sources.sort((a, b) => {
    const ae = path.extname(a.base).toLowerCase();
    const be = path.extname(b.base).toLowerCase();
    if (ae === be) return a.base.localeCompare(b.base);
    if (ae === '.webp') return -1;
    if (be === '.webp') return 1;
    return a.base.localeCompare(b.base);
  });
  return sources;
}

rmrf(PKG_ROOT);
if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
ensureDir(DIST);
ensureDir(PKG_ROOT);
ensureDir(path.join(PKG_ROOT, 'categories'));
ensureDir(path.join(PKG_ROOT, 'unmapped'));

const manifestRows = [];
const unmapped = [];
let fileCountImages = 0;

for (const product of products) {
  const catSlug = sanitizeSegment(product.category);
  const productSlug = sanitizeSegment(product.id);
  if (productSlug !== product.id) {
    console.warn('Sanitized product id differs:', product.id, '->', productSlug);
  }

  const sources = resolveSources(product);
  const portalRow = portalById[product.id];

  if (!sources.length) {
    unmapped.push({
      id: product.id,
      title: product.name,
      category: product.category,
      reason:
        'No allowlisted PNG/WebP found under public/images/products/skin-script/',
    });
    continue;
  }

  const productDir = path.join(PKG_ROOT, 'categories', catSlug, productSlug);
  const sourceDir = path.join(productDir, 'source');
  ensureDir(sourceDir);

  const imageEntries = [];
  for (const src of sources) {
    const destName = src.base;
    const dest = path.join(sourceDir, destName);
    fs.copyFileSync(src.abs, dest);
    const st = fs.statSync(dest);
    const sha = sha256File(dest);
    const isWebp = path.extname(destName).toLowerCase() === '.webp';
    const entry = {
      filename: destName,
      role: 'primary',
      format_role: isWebp ? 'primary-webp' : 'master-png',
      mime: mimeFor(dest),
      size_bytes: st.size,
      sha256: sha,
      width: WIDTH,
      height: HEIGHT,
      image_source_url: src.publicPath,
      local_path_in_package: path.posix.join(
        'categories',
        catSlug,
        productSlug,
        'source',
        destName
      ),
      intended_storefront_path: src.publicPath,
      transformation_status: 'SOURCE_ONLY',
    };
    imageEntries.push(entry);
    fileCountImages += 1;

    manifestRows.push({
      internal_product_id: product.id,
      vendor_product_id_sku: portalRow?.skin_script_sku || '',
      title: product.name,
      slug: product.id,
      category: product.category,
      source_url: portalRow?.supplier_product_url || '',
      image_source_url: src.publicPath,
      local_path_in_package: entry.local_path_in_package,
      mime: entry.mime,
      width: WIDTH,
      height: HEIGHT,
      size_bytes: st.size,
      sha256: sha,
      role: 'primary',
      download_package_timestamp: PACKAGE_TS,
      provenance_note: 'studio implementation package — authorized',
      transformation_status: 'SOURCE_ONLY',
      intended_storefront_path: src.publicPath,
      vendor_supplier_slug: portalRow?.supplier_slug || '',
      format_role: entry.format_role,
    });
  }

  const metadata = {
    internal_product_id: product.id,
    vendor_product_id_sku: portalRow?.skin_script_sku || null,
    vendor_supplier_slug: portalRow?.supplier_slug || null,
    title: product.name,
    slug: product.id,
    category: product.category,
    category_slug: catSlug,
    source_url: portalRow?.supplier_product_url || null,
    portal_verified: portalRow?.verified ?? null,
    image_alt: product.image_alt || null,
    dimensions: { width: WIDTH, height: HEIGHT, aspect_ratio: '52:77' },
    provenance_note: 'studio implementation package — authorized',
    transformation_status: 'SOURCE_ONLY',
    download_package_timestamp: PACKAGE_TS,
    images: imageEntries,
    intended_storefront_paths: imageEntries.map((e) => e.intended_storefront_path),
  };
  fs.writeFileSync(
    path.join(productDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2) + '\n'
  );

  const readme = [
    '# ' + product.name,
    '',
    '- **Internal product ID:** `' + product.id + '`',
    '- **Vendor SKU:** `' + (portalRow?.skin_script_sku || 'n/a') + '`',
    '- **Category:** ' + product.category,
    '- **Portal URL:** ' + (portalRow?.supplier_product_url || 'n/a'),
    '- **Provenance:** studio implementation package — authorized',
    '- **Transformation status:** SOURCE_ONLY (byte-for-byte copy; label text not altered)',
    '',
    '## Source assets',
    '',
    ...imageEntries.map(
      (e) =>
        '- `' +
        e.filename +
        '` — ' +
        e.mime +
        ', ' +
        e.width +
        'x' +
        e.height +
        ', ' +
        e.size_bytes +
        ' bytes, sha256 `' +
        e.sha256 +
        '`, storefront `' +
        e.intended_storefront_path +
        '`'
    ),
    '',
    'Copies only from allowlisted `public/images/products/skin-script/`. Do not scrape. Do not invent ingredients.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(productDir, 'README.md'), readme);
}

fs.writeFileSync(
  path.join(PKG_ROOT, 'unmapped', 'README.md'),
  [
    '# Unmapped',
    '',
    unmapped.length === 0
      ? 'This folder is empty by design: every commerce product in `data/products.json` maps to an authorized studio PNG/WebP under `public/images/products/skin-script/`.'
      : 'The following products lacked allowlisted studio assets:',
    '',
    ...(unmapped.length
      ? unmapped.map((u) => '- `' + u.id + '` (' + u.title + ') — ' + u.reason)
      : ['No unmapped products.']),
    '',
  ].join('\n')
);

const rootManifest = {
  schema_version: 1,
  package_name: PKG_NAME,
  zip_name: ZIP_NAME,
  generated_at: PACKAGE_TS,
  agent: 'Ecommerce / Catalog Agent',
  wave: 4,
  provenance_note: 'studio implementation package — authorized',
  transformation_status: 'SOURCE_ONLY',
  source_allowlist: 'public/images/products/skin-script/',
  production_dimensions: { width: WIDTH, height: HEIGHT, aspect_ratio: '52:77' },
  product_count: products.length,
  mapped_product_count: products.length - unmapped.length,
  unmapped_product_count: unmapped.length,
  image_file_count: fileCountImages,
  unmapped,
  products: manifestRows,
};
fs.writeFileSync(
  path.join(PKG_ROOT, 'manifest.json'),
  JSON.stringify(rootManifest, null, 2) + '\n'
);

const csvHeaders = [
  'internal_product_id',
  'vendor_product_id_sku',
  'title',
  'slug',
  'category',
  'source_url',
  'image_source_url',
  'local_path_in_package',
  'mime',
  'width',
  'height',
  'size_bytes',
  'sha256',
  'role',
  'download_package_timestamp',
  'provenance_note',
  'transformation_status',
  'intended_storefront_path',
  'vendor_supplier_slug',
  'format_role',
];
const csvLines = [csvHeaders.join(',')];
for (const row of manifestRows) {
  csvLines.push(csvHeaders.map((h) => csvEscape(row[h])).join(','));
}
fs.writeFileSync(path.join(PKG_ROOT, 'manifest.csv'), csvLines.join('\n') + '\n');

const rootReadme = [
  '# Dew Theory — Skin Script Product Image Package (Wave 4)',
  '',
  '**Generated:** ' + PACKAGE_TS,
  '**Agent:** Ecommerce / Catalog Agent',
  '**Provenance:** studio implementation package — authorized',
  '**Transformation:** SOURCE_ONLY (copies of existing PNG/WebP; no scraping; no label alteration)',
  '',
  '## Contents',
  '',
  '- `manifest.json` / `manifest.csv` — full inventory with SHA256, MIME, dimensions, portal SKUs',
  '- `categories/<category>/<commerce-product-id>/` — per-product `source/`, `metadata.json`, `README.md`',
  '- `unmapped/` — products without allowlisted assets (empty if all mapped)',
  '',
  '## Source of truth',
  '',
  '- Catalog: `data/products.json` (commerce IDs + categories)',
  '- Portal SKUs/URLs: `data/supplier/skin-script-portal-urls.json`',
  '- Image path map: `lib/product-image.js` + `public/images/products/skin-script/product-image-manifest.json`',
  '- Assets: allowlisted copies from `public/images/products/skin-script/` only',
  '',
  '## Safety',
  '',
  '- Filenames sanitized; path traversal blocked',
  '- Only `.png` / `.webp` from allowlisted directory',
  '- Storefront files under `public/` were not modified in place',
  '',
  '## Counts',
  '',
  '- Products in catalog: ' + products.length,
  '- Mapped: ' + (products.length - unmapped.length),
  '- Unmapped: ' + unmapped.length,
  '- Image files packaged: ' + fileCountImages,
  '',
].join('\n');
fs.writeFileSync(path.join(PKG_ROOT, 'README.md'), rootReadme);

execFileSync(
  'powershell.exe',
  [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path '${PKG_ROOT}' -DestinationPath '${ZIP_PATH}' -Force`,
  ],
  { stdio: 'inherit' }
);

const zipSha = sha256File(ZIP_PATH);
const zipStat = fs.statSync(ZIP_PATH);
const totalFiles = countFiles(PKG_ROOT);
const summary = {
  zip_path: ZIP_PATH,
  zip_sha256: zipSha,
  zip_size_bytes: zipStat.size,
  unpacked_path: PKG_ROOT,
  package_file_count: totalFiles,
  image_file_count: fileCountImages,
  unmapped,
  mapped_ids: products
    .filter((p) => !unmapped.some((u) => u.id === p.id))
    .map((p) => p.id),
};
fs.writeFileSync(
  path.join(DIST, 'skin-script-product-image-package-build-summary.json'),
  JSON.stringify(summary, null, 2) + '\n'
);
console.log(JSON.stringify(summary, null, 2));
