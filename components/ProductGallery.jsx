'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  PRODUCT_IMAGE_ASPECT,
  PRODUCT_IMAGE_HEIGHT,
  PRODUCT_IMAGE_WIDTH,
  isLocalImageSrc,
  isSvgSrc,
  productImageAlt,
  productImageSrc,
  preferWebpSrc
} from '@/lib/product-image';

/**
 * Accessible PDP gallery: primary + thumbnails, keyboard, swipe-friendly buttons.
 */
export default function ProductGallery({ product, priority = true }) {
  const reactId = useId();
  const labelId = `${reactId}-gallery-label`;
  const images = useMemo(() => {
    const raw = [];
    if (product?.image_webp) raw.push(preferWebpSrc(product.image_webp));
    for (const src of product?.images || []) {
      const v = preferWebpSrc(src);
      if (v && !raw.includes(v)) raw.push(v);
    }
    if (!raw.length) {
      const fallback = productImageSrc(product);
      if (fallback) raw.push(fallback);
    }
    return raw.slice(0, 8);
  }, [product]);

  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [product?.id]);

  const n = images.length;
  const current = images[Math.min(active, Math.max(n - 1, 0))] || productImageSrc(product);
  const alt = productImageAlt(product);
  const local = isLocalImageSrc(current);
  const svg = isSvgSrc(current);

  const go = useCallback(
    (dir) => {
      if (n < 2) return;
      setActive((i) => (i + dir + n) % n);
    },
    [n]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <div className="product-gallery" aria-labelledby={labelId} onKeyDown={onKeyDown}>
      <p id={labelId} className="sr-only">
        {product?.name || 'Product'} image gallery
      </p>
      <div
        className="relative overflow-hidden rounded-[2px] border border-border bg-surface-light"
        style={{ aspectRatio: PRODUCT_IMAGE_ASPECT }}
      >
        {local && !svg ? (
          <Image
            src={current}
            alt={alt}
            width={PRODUCT_IMAGE_WIDTH}
            height={PRODUCT_IMAGE_HEIGHT}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority={priority && active === 0}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        )}
        {n > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 z-[2] -translate-y-1/2 border border-border bg-white/90 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-ink"
              onClick={() => go(-1)}
              aria-label="Previous product image"
            >
              Prev
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 border border-border bg-white/90 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-ink"
              onClick={() => go(1)}
              aria-label="Next product image"
            >
              Next
            </button>
          </>
        ) : null}
      </div>
      {n > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Product image thumbnails">
          {images.map((src, i) => {
            const selected = i === active;
            return (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1} of ${n}`}
                  aria-current={selected ? 'true' : undefined}
                  className={`relative overflow-hidden rounded-[2px] border ${
                    selected ? 'border-ink' : 'border-border'
                  }`}
                  style={{ width: 64, height: Math.round(64 * (1232 / 832)) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {n > 1 ? (
        <p className="mt-2 font-label text-[0.58rem] uppercase tracking-lockup text-muted" aria-live="polite">
          Image {active + 1} of {n}
        </p>
      ) : null}
    </div>
  );
}
