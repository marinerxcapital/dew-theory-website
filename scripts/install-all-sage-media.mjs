import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXTRACT = path.join(
  ROOT,
  '.artifacts/final-catalog/sage-extract/SkinScript_Product_Image_Pack_DewTheory_Sage'
);
const MANIFEST = path.join(EXTRACT, '00_INVENTORY/dewtheory_image_manifest.csv');
const OUT = path.join(ROOT, 'public/images/products/skin-script');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));
const allow = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalog-allowlist.json'), 'utf8'));
const allowById = Object.fromEntries(allow.products.map((p) => [p.product_id, p]));

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = split(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}
function split(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
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
  if (r === 'sample') return 90;
  return 50;
}
function bad(row) {
  const role = String(row.image_role || '').toLowerCase();
  const p = String(row.output_relative_path || '').toLowerCase();
  return role === 'sample' || p.includes('sample');
}

const rows = parseCsv(fs.readFileSync(MANIFEST, 'utf8'));
const report = [];
for (const p of catalog.products) {
  if (allowById[p.id]) p.skin_script_sku = allowById[p.id].skin_script_sku;
  let cands = rows.filter((r) => (r.product_name || '') === p.name).filter((r) => !bad(r));
  const preferred = cands.filter((r) => {
    const rel = String(r.output_relative_path || '');
    return rel.includes('01_RETAIL') || rel.includes('03_KITS');
  });
  if (preferred.length) cands = preferred;
  cands.sort((a, b) => roleRank(a.image_role) - roleRank(b.image_role));
  const chosen = cands.slice(0, 8);
  const destDir = path.join(OUT, p.id);
  fs.mkdirSync(destDir, { recursive: true });
  const installed = [];
  chosen.forEach((row, i) => {
    const rel = row.output_relative_path;
    const src = path.join(EXTRACT, rel);
    if (!fs.existsSync(src)) return;
    const role = String(row.image_role || 'gallery').toLowerCase().replace(/\s+/g, '');
    const fname =
      i === 0
        ? `${p.id}__01__primary.webp`
        : `${p.id}__${String(i + 1).padStart(2, '0')}__${role || 'gallery'}.webp`;
    fs.copyFileSync(src, path.join(destDir, fname));
    installed.push(`/images/products/skin-script/${p.id}/${fname}`);
  });
  if (installed.length) {
    p.images = installed;
    p.image_webp = installed[0];
    p.image_alt = `Skin Script ${p.name} on Dew Theory sage background`;
  }
  report.push({ id: p.id, count: installed.length });
}
fs.writeFileSync(path.join(ROOT, 'data/products.json'), JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(
  path.join(ROOT, '.artifacts/final-catalog/media-install-report.json'),
  JSON.stringify(report, null, 2)
);
console.log(
  'installed',
  report.filter((r) => r.count > 0).length,
  '/',
  report.length,
  'missing',
  report.filter((r) => !r.count).map((r) => r.id)
);
