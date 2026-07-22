'use client';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Uses the real logo artwork when the file is present.
 * Falls back to live chrome type so the specular sweep can still animate
 * if the asset is ever removed.
 *
 * `src` defaults to the full lockup; the nav passes the wordmark-only crop,
 * because the SKIN — CARE line is illegible at nav scale.
 */
export default function Wordmark({
  src = '/logo.webp',
  className = '',
  lit = false,
  alt = 'Dew Theory',
  priority = false
}) {
  const [failed, setFailed] = useState(false);

  // logo-mark is a tight crop; full lockup is wider (higher intrinsic size keeps nav crisp when enlarged)
  const isMark = src.includes('logo-mark');
  const width = isMark ? 320 : 520;
  const height = isMark ? 80 : 200;

  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={isMark ? '(max-width: 640px) 176px, (max-width: 1024px) 216px, 240px' : '520px'}
        className={`${className} object-contain`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`font-display italic lowercase ${className}`}>
      <span className={`chrome-text ${lit ? 'is-lit' : ''}`}>dew theory</span>
    </span>
  );
}
