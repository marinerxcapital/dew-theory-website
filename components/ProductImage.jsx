import Image from 'next/image';
import { isLocalImageSrc, isSvgSrc, productImageSrc } from '@/lib/product-image';

/**
 * Product media with category placeholder fallback.
 * Iridescent underlay + soft zoom frame for empty / real photography.
 *
 * @param {{ product: object, priority?: boolean, className?: string, sizes?: string, framed?: boolean }} props
 */
export default function ProductImage({
  product,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, 33vw',
  framed = false
}) {
  const src = productImageSrc(product);
  const alt = product?.name ? `${product.name}` : 'Product';
  const unoptimized = isSvgSrc(src) || !isLocalImageSrc(src);

  return (
    <div
      className={`media-zoom relative aspect-[4/5] w-full overflow-hidden rounded-[3px] ${
        framed ? 'chrome-frame' : ''
      } ${className}`}
    >
      <div className="iridescent absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-pearl/25 via-transparent to-lavender/15"
        aria-hidden="true"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        className="media-zoom-target object-cover"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-graphite/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
