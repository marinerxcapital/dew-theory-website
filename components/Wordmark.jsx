'use client';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Uses the real wordmark artwork when the file is present.
 * Falls back to live type if the asset is ever removed.
 */
export default function Wordmark({
  src = '/logo-dewtheory-glass-wordmark-transparent.png',
  className = '',
  lit = false,
  alt = 'Dew Theory',
  priority = false,
  sizes = '(max-width: 640px) 160px, (max-width: 1024px) 188px, 215px',
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  const isMark = !src.includes('wordmark') && (src.includes('mark') || src.includes('ivory'));
  const isGlass = src.includes('glass-wordmark-transparent') || src.includes('glass-20260928');
  const width = isGlass ? 3000 : isMark ? 900 : 1100;
  const height = isGlass ? 1000 : isMark ? 228 : 279;

  if (!failed) {
    return (
      <span className={`brand-wordmark ${className}`} {...rest}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="relative z-[1] block h-full w-full object-contain object-left"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={`font-display italic lowercase ${className}`} {...rest}>
      <span className={`chrome-text ${lit ? 'is-lit' : ''}`}>dew theory</span>
    </span>
  );
}
