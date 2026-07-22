/**
 * Resolve product media src — real images first, then category placeholder SVG.
 * Brand-abstract placeholders only (no product bottle photography).
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

export function productImageSrc(product) {
  if (product?.images?.[0]) return product.images[0];
  const cat = String(product?.category || 'default')
    .toLowerCase()
    .replace(/\s+/g, '-');
  return `/products/placeholders/${KNOWN.has(cat) ? cat : 'default'}.svg`;
}

export function isLocalImageSrc(src) {
  return typeof src === 'string' && src.startsWith('/');
}

export function isSvgSrc(src) {
  return typeof src === 'string' && /\.svg(\?|$)/i.test(src);
}
