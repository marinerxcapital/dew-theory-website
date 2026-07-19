/**
 * Pure checkout validation / pricing helpers (server-safe).
 * Never trust client unit_price — always re-price from catalog products.
 */

import { cartTotals } from '@/lib/discounts';

export const MAX_LINE_QTY = 20;
export const MAX_LINES = 30;

/**
 * @typedef {{ code: string, error: string, field?: string, product_id?: string }} CheckoutIssue
 */

/**
 * @param {unknown} rawItems
 * @param {Array} catalogProducts - full product list from store/seed
 * @returns {{ ok: true, items: Array } | { ok: false, status: number, error: string, code: string, details?: CheckoutIssue[] }}
 */
export function validateAndPriceItems(rawItems, catalogProducts) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Cart is empty',
      code: 'cart_empty'
    };
  }
  if (rawItems.length > MAX_LINES) {
    return {
      ok: false,
      status: 400,
      error: `Too many line items (max ${MAX_LINES})`,
      code: 'too_many_lines'
    };
  }

  const byId = new Map(catalogProducts.map((p) => [p.id, p]));
  const items = [];
  const details = [];

  for (let i = 0; i < rawItems.length; i++) {
    const li = rawItems[i] || {};
    const productId = String(li.product_id || '').trim();
    if (!productId) {
      details.push({
        code: 'missing_product_id',
        error: 'Line item missing product_id',
        field: `items[${i}].product_id`
      });
      continue;
    }

    const product = byId.get(productId);
    if (!product) {
      details.push({
        code: 'unknown_sku',
        error: `Unknown product: ${productId}`,
        product_id: productId,
        field: `items[${i}].product_id`
      });
      continue;
    }

    if (product.active === false || product.stock_status === 'discontinued') {
      details.push({
        code: 'product_unavailable',
        error: `${product.name} is not available`,
        product_id: product.id
      });
      continue;
    }

    if (product.stock_status === 'out_of_stock') {
      details.push({
        code: 'out_of_stock',
        error: `${product.name} is out of stock`,
        product_id: product.id
      });
      continue;
    }

    const variants = product.variants || [];
    let variant = li.variant != null && li.variant !== '' ? String(li.variant) : null;
    if (variants.length) {
      if (!variant) {
        details.push({
          code: 'variant_required',
          error: `Variant required for ${product.name}`,
          product_id: product.id,
          field: `items[${i}].variant`
        });
        continue;
      }
      if (!variants.includes(variant)) {
        details.push({
          code: 'invalid_variant',
          error: `Invalid variant for ${product.name}`,
          product_id: product.id,
          field: `items[${i}].variant`
        });
        continue;
      }
    } else {
      variant = null;
    }

    let quantity = Math.floor(Number(li.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) {
      details.push({
        code: 'invalid_quantity',
        error: `Invalid quantity for ${product.name}`,
        product_id: product.id,
        field: `items[${i}].quantity`
      });
      continue;
    }
    quantity = Math.min(MAX_LINE_QTY, quantity);

    // Always re-price from catalog retail — ignore client unit_price
    items.push({
      product_id: product.id,
      name: product.name,
      quantity,
      unit_price: Number(product.retail_price),
      variant
    });
  }

  if (details.length) {
    return {
      ok: false,
      status: 400,
      error: details[0].error,
      code: details[0].code,
      details
    };
  }

  if (!items.length) {
    return {
      ok: false,
      status: 400,
      error: 'Cart is empty',
      code: 'cart_empty'
    };
  }

  return { ok: true, items };
}

export function validateCustomer(customer) {
  const name = String(customer?.name || '')
    .trim()
    .slice(0, 200);
  const email = String(customer?.email || '')
    .trim()
    .toLowerCase()
    .slice(0, 320);
  const phone = String(customer?.phone || '')
    .trim()
    .slice(0, 40);

  if (!name) {
    return {
      ok: false,
      status: 400,
      error: 'Name is required',
      code: 'customer_name_required',
      field: 'customer.name'
    };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      status: 400,
      error: 'Valid email is required',
      code: 'customer_email_invalid',
      field: 'customer.email'
    };
  }
  return { ok: true, customer: { name, email, phone } };
}

export function validateShippingAddress(addr) {
  const a = addr || {};
  const shipping_address = {
    line1: String(a.line1 || '').trim().slice(0, 200),
    city: String(a.city || '').trim().slice(0, 100),
    state: String(a.state || '').trim().slice(0, 40),
    postal_code: String(a.postal_code || '').trim().slice(0, 20),
    country: String(a.country || 'US').trim().slice(0, 2).toUpperCase() || 'US'
  };
  const missing = [];
  if (!shipping_address.line1) missing.push('shipping_address.line1');
  if (!shipping_address.city) missing.push('shipping_address.city');
  if (!shipping_address.state) missing.push('shipping_address.state');
  if (!shipping_address.postal_code) missing.push('shipping_address.postal_code');
  if (missing.length) {
    return {
      ok: false,
      status: 400,
      error: 'Complete shipping address is required',
      code: 'shipping_incomplete',
      details: missing.map((field) => ({
        code: 'field_required',
        error: `${field} is required`,
        field
      }))
    };
  }
  return { ok: true, shipping_address };
}

export function priceCart(items, discountCode) {
  return cartTotals(items, discountCode);
}

export function normalizeIdempotencyKey(raw) {
  if (raw == null || raw === '') return null;
  const key = String(raw).trim().slice(0, 128);
  if (!key) return null;
  // Allow safe chars only
  if (!/^[a-zA-Z0-9._:-]+$/.test(key)) return null;
  return key;
}
