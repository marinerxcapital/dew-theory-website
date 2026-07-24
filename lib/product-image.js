/**
 * Resolve product media src — real Skin Script studio photos first,
 * then category placeholder SVG.
 *
 * Production paths: /images/products/skin-script/* (832×1232, 52:77).
 */

const KNOWN = new Set([
  'cleanser',
  'serum',
  'moisturizer',
  'mask',
  'exfoliant',
  'spf',
  'toner',
  'lip-treatment'
]);

/** Fallback map when seed/store images[] is empty (id → primary PNG). */
export const SKIN_SCRIPT_IMAGE_BY_ID = {
  'green-tea-citrus-cleanser': '/images/products/skin-script/00-green-tea-citrus-cleanser.png',
  'mandelic-brightening-serum': '/images/products/skin-script/01-mandelic-brightening-serum.png',
  'hydrating-skin-serum': '/images/products/skin-script/02-ageless-skin-hydrating-serum.png',
  'ageless-moisturizer': '/images/products/skin-script/03-ageless-skin-moisturizer.png',
  'botanical-bloom-hydrating-mask': '/images/products/skin-script/04-botanical-bloom-hydrating-mask.png',
  'lip-treatment-peppermint-pomegranate': '/images/products/skin-script/05-ageless-lip-treatment.png',
  'cucumber-hydration-toner': '/images/products/skin-script/06-cucumber-hydration-toner.png',
  'sheer-protection-spf': '/images/products/skin-script/07-sheer-protection-spf-30.png'
};

export const PRODUCT_IMAGE_ASPECT = '52 / 77';
export const PRODUCT_IMAGE_WIDTH = 832;
export const PRODUCT_IMAGE_HEIGHT = 1232;

export function productImageSrc(product) {
  if (product?.images?.[0]) return product.images[0];
  if (product?.id && SKIN_SCRIPT_IMAGE_BY_ID[product.id]) {
    return SKIN_SCRIPT_IMAGE_BY_ID[product.id];
  }
  const cat = String(product?.category || 'default')
    .toLowerCase()
    .replace(/\s+/g, '-');
  return `/products/placeholders/${KNOWN.has(cat) ? cat : 'default'}.svg`;
}

/** Prefer explicit image_alt, then product-specific studio alt, then name. */
export function productImageAlt(product) {
  if (product?.image_alt) return product.image_alt;
  if (product?.name) {
    return `Skin Script ${product.name} on a pastel iridescent studio background`;
  }
  return 'Skin Script product';
}

export function isLocalImageSrc(src) {
  return typeof src === 'string' && src.startsWith('/');
}

export function isSvgSrc(src) {
  return typeof src === 'string' && /\.svg(\?|$)/i.test(src);
}

/** True when src is a real product photo (not category placeholder). */
export function isProductPhotoSrc(src) {
  return typeof src === 'string' && !isSvgSrc(src) && src.length > 0;
}
