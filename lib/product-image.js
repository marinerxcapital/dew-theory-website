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
  'lip-treatment',
  'eye-treatment',
  'spot-treatment',
  'enzyme',
  'kit',
  'accessory'
]);

/**
 * Legacy fallback map when seed/store images[] is empty.
 * Prefer product.image_webp / images[] — do not expand this map as primary architecture.
 */
export const SKIN_SCRIPT_IMAGE_BY_ID = {
  'green-tea-citrus-cleanser':
    '/images/products/skin-script/green-tea-citrus-cleanser/green-tea-citrus-cleanser__01__primary.webp',
  'mandelic-brightening-serum':
    '/images/products/skin-script/mandelic-brightening-serum/mandelic-brightening-serum__01__primary.webp',
  'hydrating-skin-serum':
    '/images/products/skin-script/hydrating-skin-serum/hydrating-skin-serum__01__primary.webp',
  'ageless-moisturizer':
    '/images/products/skin-script/ageless-moisturizer/ageless-moisturizer__01__primary.webp',
  'botanical-bloom-hydrating-mask':
    '/images/products/skin-script/botanical-bloom-hydrating-mask/botanical-bloom-hydrating-mask__01__primary.webp',
  'lip-treatment-peppermint-pomegranate':
    '/images/products/skin-script/lip-treatment-peppermint-pomegranate/lip-treatment-peppermint-pomegranate__01__primary.webp',
  'cucumber-hydration-toner':
    '/images/products/skin-script/cucumber-hydration-toner/cucumber-hydration-toner__01__primary.webp',
  'sheer-protection-spf':
    '/images/products/skin-script/sheer-protection-spf/sheer-protection-spf__01__primary.webp'
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
