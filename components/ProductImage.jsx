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
 * Photos are 832×1232 (52:77) — full bottle/tube, no crop, no extra background.
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
  const alt = productImageAlt(product);
  const photo = isProductPhotoSrc(src);
  const unoptimized = isSvgSrc(src) || !isLocalImageSrc(src);

  return (
    <div
      data-product-image-frame
      className={`media-zoom relative aspect-[52/77] w-full overflow-hidden ${
        framed ? 'rounded-[2px] border border-chrome/15 bg-surface' : 'bg-pearl'
      } ${className}`}
    >
      {/* Placeholders only: soft pearl field (no iridescent rainbow) */}
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
        unoptimized={unoptimized}
        className={`media-zoom-target ${photo ? 'object-cover object-center' : 'object-cover'}`}
      />
    </div>
  );
}
