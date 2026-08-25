'use client';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Uses the real wordmark artwork when the file is present.
 * Falls back to live type if the asset is ever removed.
 */
export default function Wordmark({
  src = '/logo-dewtheory-20260825.webp',
  className = '',
  lit = false,
  alt = 'Dew Theory',
  priority = false
}) {
  const [failed, setFailed] = useState(false);

  const isMark = src.includes('mark') || src.includes('ivory');
  const width = isMark ? 900 : 1100;
  const height = isMark ? 228 : 279;

  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={isMark ? '(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px' : 'min(78vw, 680px)'}
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
