/**
 * Resolve product media src — prefer Skin Script WebP (tiny vs PNG),
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

/** Fallback map when seed/store images[] is empty (id → primary WebP). */
export const SKIN_SCRIPT_IMAGE_BY_ID = {
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
    '/images/products/skin-script/07-sheer-protection-spf-30.webp'
};

export const PRODUCT_IMAGE_ASPECT = '52 / 77';
export const PRODUCT_IMAGE_WIDTH = 832;
export const PRODUCT_IMAGE_HEIGHT = 1232;

/**
 * Prefer WebP for Skin Script studio packshots (~40KB vs ~1MB PNG).
 * Accepts explicit image_webp, images[], or known id map.
 */
export function preferWebpSrc(src) {
  if (typeof src !== 'string' || !src) return src;
  if (src.includes('/images/products/skin-script/') && /\.png(\?|$)/i.test(src)) {
    return src.replace(/\.png(\?|$)/i, '.webp$1');
  }
  return src;
}

export function productImageSrc(product) {
  if (product?.image_webp) return preferWebpSrc(product.image_webp);
  if (product?.images?.[0]) return preferWebpSrc(product.images[0]);
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
    return `Skin Script ${product.name} professional skincare product photo`;
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
