/**
 * Install Dew Theory sage WebP media for storefront products from compact pack.
 * Does NOT recompress. Maps by product name → dew product id.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const EXTRACT =
  process.env.SAGE_EXTRACT ||
  path.join(REPO, '.artifacts/final-catalog/sage-extract/SkinScript_Product_Image_Pack_DewTheory_Sage');
const OUT = path.join(REPO, 'public/images/products/skin-script');
const MANIFEST_IN = path.join(EXTRACT, '00_INVENTORY/dewtheory_image_manifest.csv');

/** Dew product_id → source product_name as in sage manifest */
const NAME_BY_ID = {
  'green-tea-citrus-cleanser': 'Green Tea Citrus Cleanser',
  'mandelic-brightening-serum': 'Mandelic Brightening Serum',
  'hydrating-skin-serum': 'Ageless Skin Hydrating Serum',
  'ageless-moisturizer': 'Ageless Skin Moisturizer',
  'botanical-bloom-hydrating-mask': 'Botanical Bloom Hydrating Mask',
  'lip-treatment-peppermint-pomegranate': 'Ageless Lip Treatment',
  'cucumber-hydration-toner': 'Cucumber Hydration Toner',
  'sheer-protection-spf': 'Sheer Protection SPF 30'
};

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function roleRank(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'front') return 0;
  if (r === 'back') return 1;
  if (r.startsWith('gallery')) return 2;
  if (r === 'swatch') return 3;
  if (r === 'pump') return 4;
  if (r === 'sample') return 90; // deprioritize samples
  return 50;
}

function isMisleading(row) {
  const role = String(row.image_role || '').toLowerCase();
  const p = String(row.output_relative_path || row.saved_relative_path || '').toLowerCase();
  if (role === 'sample' || p.includes('sample')) return true;
  if (/\b16oz\b|\b16_oz\b/.test(p)) return true;
  return false;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  if (!fs.existsSync(MANIFEST_IN)) {
    throw new Error('Missing dewtheory manifest at ' + MANIFEST_IN);
  }
  const rows = parseCsv(fs.readFileSync(MANIFEST_IN, 'utf8'));
  ensureDir(OUT);
  const report = [];

  for (const [id, name] of Object.entries(NAME_BY_ID)) {
    const destDir = path.join(OUT, id);
    ensureDir(destDir);
    let candidates = rows.filter((r) => (r.product_name || '') === name);
    candidates = candidates
      .filter((r) => !isMisleading(r))
      .sort((a, b) => roleRank(a.image_role) - roleRank(b.image_role));
    // Prefer retail tree if both exist
    const retail = candidates.filter((r) =>
      String(r.output_relative_path || '').includes('01_RETAIL')
    );
    if (retail.length) candidates = retail;

    const chosen = candidates.slice(0, 8);
    if (!chosen.length) {
      report.push({ id, name, error: 'no_images' });
      continue;
    }

    const installed = [];
    chosen.forEach((row, i) => {
      const rel = row.output_relative_path || row.saved_relative_path;
      const src = path.join(EXTRACT, rel);
      if (!fs.existsSync(src)) {
        report.push({ id, name, error: 'missing_src', rel });
        return;
      }
      const role = String(row.image_role || 'gallery').toLowerCase().replace(/\s+/g, '');
      const fname =
        i === 0
          ? `${id}__01__primary.webp`
          : `${id}__${String(i + 1).padStart(2, '0')}__${role || 'gallery'}.webp`;
      const dest = path.join(destDir, fname);
      fs.copyFileSync(src, dest);
      installed.push(`/images/products/skin-script/${id}/${fname}`);
    });
    report.push({ id, name, count: installed.length, images: installed });
  }

  const outReport = path.join(REPO, '.artifacts/final-catalog/media-install-report.json');
  ensureDir(path.dirname(outReport));
  fs.writeFileSync(outReport, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
