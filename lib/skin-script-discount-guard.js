/**
 * Skin Script policy: merchandise discounts must not reduce Skin Script
 * product unit price below official SRP.
 */

export function isSkinScriptCatalogProduct(product) {
  if (!product) return false;
  if (product.source && String(product.source).toLowerCase().includes('skin-script')) return true;
  if (product.skin_script_sku) return true;
  if (product.official_srp != null) return true;
  return false;
}

/**
 * @param {object} discount resolved discount code
 * @param {object[]} lineProducts products corresponding to cart lines
 * @returns {{ ok: true } | { ok: false, code: string, error: string }}
 */
export function assertDiscountAllowedForSkinScript(discount, lineProducts = []) {
  if (!discount || discount.active === false) return { ok: true };
  const hasSkinScript = (lineProducts || []).some(isSkinScriptCatalogProduct);
  if (!hasSkinScript) return { ok: true };

  const type = String(discount.type || discount.discount_type || '').toLowerCase();
  if (type === 'percentage' || type === 'percent' || type === 'fixed' || type === 'amount') {
    return {
      ok: false,
      code: 'skin_script_discount_blocked',
      error:
        'Skin Script products cannot be discounted below official suggested retail price. Remove the code or checkout Skin Script items separately.'
    };
  }
  return { ok: true };
}
