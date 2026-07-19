/**
 * CSV import parser + row validation (G5). Pure, unit-testable.
 */

export const TARGET_FIELDS = [
  'name',
  'category',
  'size',
  'wholesale_price',
  'description',
  'ingredients',
  'sku'
];

const ALIASES = {
  name: ['name', 'product', 'product_name', 'title'],
  category: ['category', 'type', 'product_category'],
  size: ['size', 'volume', 'oz'],
  wholesale_price: ['wholesale_price', 'wholesale', 'cost', 'unit_cost', 'price_wholesale'],
  description: ['description', 'desc', 'description_short', 'short_description'],
  ingredients: ['ingredients', 'key_actives', 'actives'],
  sku: ['sku', 'skin_script_sku', 'product_sku', 'id']
};

export function parseCsv(text) {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };

  const split = (line) => {
    const cells = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cells.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const rows = lines.slice(1).map((line) => {
    const cells = split(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? '';
    });
    return obj;
  });
  return { headers, rows };
}

export function guessMap(headers) {
  const map = {};
  for (const field of TARGET_FIELDS) {
    const hit = (headers || []).find((h) => ALIASES[field].includes(h));
    if (hit) map[field] = hit;
  }
  return map;
}

export function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

/**
 * Map raw CSV rows → product payloads + bad-row report.
 * @returns {{ products: object[], bad: { row: number, reason: string, raw?: object }[] }}
 */
export function buildImportPreview(rows, map) {
  const products = [];
  const bad = [];
  (rows || []).forEach((row, i) => {
    const rowNum = i + 2; // 1-based + header
    const name = String(row[map.name] || '').trim();
    if (!name) {
      bad.push({ row: rowNum, reason: 'Missing name', raw: row });
      return;
    }
    const wholesaleRaw = row[map.wholesale_price];
    const wholesale = parseFloat(wholesaleRaw);
    if (wholesaleRaw === '' || wholesaleRaw == null || Number.isNaN(wholesale) || wholesale < 0) {
      bad.push({ row: rowNum, reason: 'Invalid wholesale_price', raw: row });
      return;
    }
    const idBase = slugify(row[map.sku] || name) || `import-${i}`;
    products.push({
      id: idBase,
      name,
      category: String(row[map.category] || 'Serum').trim() || 'Serum',
      size: String(row[map.size] || '').trim(),
      wholesale_price: Math.round(wholesale * 100) / 100,
      retail_price: Math.round(wholesale * 2 * 100) / 100,
      description_short: String(row[map.description] || '').trim(),
      key_actives: row[map.ingredients]
        ? String(row[map.ingredients])
            .split(/[;|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      skin_script_sku: row[map.sku] ? String(row[map.sku]).trim() : null,
      source: 'csv_import',
      stock_status: 'in_stock',
      active: true
    });
  });
  return { products, bad };
}

/**
 * Dry-run / commit plan against existing product ids.
 */
export function planImport(products, existingIds = []) {
  const set = new Set(existingIds);
  let wouldCreate = 0;
  let wouldUpdate = 0;
  for (const p of products || []) {
    if (set.has(p.id)) wouldUpdate += 1;
    else wouldCreate += 1;
  }
  return { wouldCreate, wouldUpdate, total: (products || []).length };
}
