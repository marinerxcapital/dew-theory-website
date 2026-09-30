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
  'lip-treatment-peppermint':
    '/images/products/skin-script/lip-treatment-peppermint/lip-treatment-peppermint__01__primary.webp',
  'lip-treatment-pomegranate':
    '/images/products/skin-script/lip-treatment-pomegranate/lip-treatment-pomegranate__01__primary.webp',
  'cucumber-hydration-toner':
    '/images/products/skin-script/cucumber-hydration-toner/cucumber-hydration-toner__01__primary.webp',
  'sheer-protection-spf':
    '/images/products/skin-script/sheer-protection-spf/sheer-protection-spf__01__primary.webp'
};

export const PRODUCT_IMAGE_ASPECT = '52 / 77';
export const PRODUCT_IMAGE_WIDTH = 832;
export const PRODUCT_IMAGE_HEIGHT = 1232;

/**
 * Manufacturer label panels (Drug Facts / directions), not studio packshots.
 *
 * These three assets are photographs of the printed regulatory panel on the
 * original flat plate. Their fill sits within ~14 RGB of the plate colour, so the
 * noir background key cannot separate panel from background without blackening
 * the label text — they were deliberately skipped by the re-lighting pass. They
 * are rendered on a light document surface instead, and are given their own alt
 * text so a screen reader is not told they show a black studio background.
 *
 * Paths are stored without the `?v=` cache token.
 */
export const DOCUMENT_PANEL_SOURCES = new Set([
  '/images/products/skin-script/blemish-spot-treatment/blemish-spot-treatment__02__gallery02.webp',
  '/images/products/skin-script/lip-balm-with-spf-15/lip-balm-with-spf-15__03__gallery02.webp',
  '/images/products/skin-script/sheer-protection-spf/sheer-protection-spf__02__gallery03.webp'
]);

/** True when the src is a manufacturer label panel rather than a studio packshot. */
export function isDocumentPanel(src) {
  if (typeof src !== 'string' || !src) return false;
  return DOCUMENT_PANEL_SOURCES.has(src.split('?')[0]);
}

/** Alt text for a label panel — states what it actually shows. */
export function documentPanelAlt(product) {
  const name = product?.name || 'Product';
  return `Manufacturer label panel for Skin Script ${name} — ingredients and directions`;
}

/**
 * Imagery revision token.
 *
 * Product assets are served with `Cache-Control: public, max-age=31536000,
 * immutable`, which is the right call for a static catalog — but it means that
 * replacing the bytes behind a stable filename never reaches a returning
 * visitor or the CDN edge. Bump this token whenever the photography changes so
 * the URL changes with it and the new render is fetched.
 *
 * pearl-20260926: catalog keyed off the studio plate onto a transparent ground
 * with a synthesised warm contact shadow, for the pearl/ivory editorial system
 * (see scripts/pearl_product_imagery.py).
 */
export const PRODUCT_IMAGE_REVISION = 'green-20260929';

/** Append the imagery revision to local product media URLs only. */
export function withImageRevision(src) {
  if (typeof src !== 'string' || !src) return src;
  if (!src.startsWith('/images/products/')) return src;
  if (/[?&]v=/.test(src)) return src;
  return `${src}${src.includes('?') ? '&' : '?'}v=${PRODUCT_IMAGE_REVISION}`;
}

/**
 * Prefer WebP for Skin Script studio packshots (~40KB vs ~1MB PNG).
 * Accepts explicit image_webp, images[], or known id map.
 */
export function preferWebpSrc(src) {
  if (typeof src !== 'string' || !src) return src;
  if (src.includes('/images/products/skin-script/') && /\.png(\?|$)/i.test(src)) {
    return withImageRevision(src.replace(/\.png(\?|$)/i, '.webp$1'));
  }
  return withImageRevision(src);
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
    return `Skin Script ${product.name} product photo`;
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
