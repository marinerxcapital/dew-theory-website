import Image from 'next/image';
import {
  isLocalImageSrc,
  isProductPhotoSrc,
  isSvgSrc,
  productImageAlt,
  productImageSrc
} from '@/lib/product-image';

/**
 * Product media with Skin Script studio photography (or category placeholder).
 * Photos are 832×1232 (52:77). Primary path is WebP (~40KB).
 *
 * @param {{ product: object, priority?: boolean, className?: string, sizes?: string, framed?: boolean, quality?: number }} props
 */
export default function ProductImage({
  product,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px',
  framed = false,
  quality = 75
}) {
  const src = productImageSrc(product);
  const alt = productImageAlt(product);
  const photo = isProductPhotoSrc(src);
  const unoptimized = isSvgSrc(src) || !isLocalImageSrc(src);

  const hasCustomSize = className.includes('h-full') || className.includes('aspect-auto');

  return (
    <div
      data-product-image-frame
      className={`media-zoom relative w-full overflow-hidden ${
        hasCustomSize ? '' : 'aspect-[52/77]'
      } ${framed ? 'rounded-[2px] border border-chrome/15 bg-surface' : 'bg-pearl'} ${className}`}
    >
      {!photo && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-pearl via-ivory/80 to-pearl"
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        unoptimized={unoptimized}
        className={`media-zoom-target ${photo ? 'object-cover object-center' : 'object-cover'}`}
      />
    </div>
  );
}
