/** Complete route-specific metadata while preserving existing titles and descriptions. */
/** @param {string} route @param {import("next").Metadata} metadata @returns {import("next").Metadata} */
export function withPageMetadata(route, metadata) {
  const title = typeof metadata.title === 'string' ? metadata.title : 'Dew Theory';
  const description = metadata.description || 'Professional Skin Script skincare and personal guidance from Emily Mitchener, Licensed Aesthetician.';
  const images = [{ url: '/og-green.png', width: 1200, height: 630, alt: 'Dew Theory' }];
  return {
    ...metadata,
    description,
    alternates: { ...metadata.alternates, canonical: route },
    openGraph: { type: 'website', ...metadata.openGraph, url: route, title: metadata.openGraph?.title || title, description: metadata.openGraph?.description || description, images },
    twitter: { card: 'summary_large_image', ...metadata.twitter, title: metadata.twitter?.title || title, description: metadata.twitter?.description || description, images: ['/og-green.png'] }
  };
}
