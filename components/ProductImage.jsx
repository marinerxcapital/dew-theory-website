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
      className={`media-zoom relative aspect-[52/77] w-full overflow-hidden rounded-[3px] ${
        framed ? 'chrome-frame' : ''
      } ${photo ? 'bg-pearl' : ''} ${className}`}
    >
      {/* Placeholders only: iridescent underlay. Real photos already include studio bg. */}
      {!photo && (
        <>
          <div className="iridescent absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-pearl/25 via-transparent to-lavender/15"
            aria-hidden="true"
          />
        </>
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
      {!photo && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-graphite/10 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
