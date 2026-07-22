/**
 * Product admin validation + normalization (G2).
 * Pure helpers for create/update — unit-testable.
 */

export const STOCK_STATUSES = ['in_stock', 'out_of_stock', 'discontinued'];
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {unknown} body
 * @param {{ isNew?: boolean, existingIds?: string[] }} [opts]
 * @returns {{ ok: true, product: object } | { ok: false, status: number, error: string, code: string, field?: string }}
 */
export function validateAndNormalizeProduct(body, opts = {}) {
  const b = body && typeof body === 'object' ? body : {};
  const isNew = opts.isNew !== false;

  let id = String(b.id || '')
    .trim()
    .toLowerCase();
  if (isNew) {
    if (!id) {
      return { ok: false, status: 400, error: 'Product id is required', code: 'id_required', field: 'id' };
    }
    if (id.length > 80 || !ID_PATTERN.test(id)) {
      return {
        ok: false,
        status: 400,
        error: 'Id must be a lowercase slug (letters, numbers, hyphens)',
        code: 'id_invalid',
        field: 'id'
      };
    }
    if ((opts.existingIds || []).includes(id)) {
      return { ok: false, status: 409, error: 'Product id already exists', code: 'id_exists', field: 'id' };
    }
  }

  const name = String(b.name || '').trim().slice(0, 200);
  if (!name) {
    return {
      ok: false,
      status: 400,
      error: 'Name is required',
      code: 'name_required',
      field: 'name'
    };
  }

  const wholesaleRaw = b.wholesale_price;
  const wholesale = Number(wholesaleRaw);
  if (wholesaleRaw === '' || wholesaleRaw == null || Number.isNaN(wholesale) || wholesale < 0) {
    return {
      ok: false,
      status: 400,
      error: 'Wholesale price must be a number ≥ 0',
      code: 'wholesale_invalid',
      field: 'wholesale_price'
    };
  }

  let retail;
  if (b.retail_price != null && b.retail_price !== '') {
    retail = Number(b.retail_price);
    if (Number.isNaN(retail) || retail < 0) {
      return {
        ok: false,
        status: 400,
        error: 'Retail price must be a number ≥ 0',
        code: 'retail_invalid',
        field: 'retail_price'
      };
    }
  } else {
    // Default: wholesale × 2
    retail = Math.round(wholesale * 2 * 100) / 100;
  }

  const stock_status = String(b.stock_status || 'in_stock');
  if (!STOCK_STATUSES.includes(stock_status)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid stock status',
      code: 'stock_invalid',
      field: 'stock_status'
    };
  }

  const active = b.active !== false && b.active !== 'false' && b.active !== 0;

  const product = {
    id: isNew ? id : undefined,
    name,
    category: String(b.category || 'Serum').slice(0, 80),
    size: String(b.size || '').slice(0, 80),
    wholesale_price: Math.round(wholesale * 100) / 100,
    retail_price: Math.round(retail * 100) / 100,
    retail_price_confirmed: true,
    description_short: String(b.description_short || '').slice(0, 2000),
    how_to_use: String(b.how_to_use || '').slice(0, 4000),
    key_actives: Array.isArray(b.key_actives) ? b.key_actives : b.key_actives || [],
    skin_types: Array.isArray(b.skin_types) ? b.skin_types : [],
    conditions_addressed: Array.isArray(b.conditions_addressed) ? b.conditions_addressed : [],
    stock_status,
    skin_script_sku: b.skin_script_sku ? String(b.skin_script_sku).slice(0, 80) : null,
    active,
    images: Array.isArray(b.images)
      ? b.images.map(String).filter(Boolean).slice(0, 8)
      : [],
    variants: b.variants ?? null
  };

  const src = String(b.source || '');
  if (['manual', 'csv_import', 'sync'].includes(src)) {
    product.source = src;
  }
  if (b.ai_assisted === true) {
    product.ai_assisted = true;
  }

  return { ok: true, product };
}

/** Default retail from wholesale (×2). */
export function defaultRetailFromWholesale(wholesale) {
  const w = Number(wholesale);
  if (Number.isNaN(w) || w < 0) return null;
  return Math.round(w * 2 * 100) / 100;
}
