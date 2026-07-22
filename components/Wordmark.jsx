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

  // logo-mark is a tight crop; full lockup is wider
  const isMark = src.includes('logo-mark');
  const width = isMark ? 160 : 520;
  const height = isMark ? 40 : 200;

  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`${className} h-auto w-auto object-contain`}
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
