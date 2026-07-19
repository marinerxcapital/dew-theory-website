'use client';
import { useEffect, useState } from 'react';

/**
 * Uses the real logo artwork when the file is present.
 * Falls back to live chrome type so the specular sweep can still animate
 * if the asset is ever removed.
 *
 * `src` defaults to the full lockup; the nav passes the wordmark-only crop,
 * because the SKIN — CARE line is illegible at nav scale.
 */
export default function Wordmark({ src = '/logo.webp', className = '', lit = false, alt = 'Dew Theory' }) {
  const [hasArt, setHasArt] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasArt(true);
    img.src = src;
  }, [src]);

  if (hasArt) {
    return <img src={src} alt={alt} className={`${className} w-auto object-contain`} />;
  }

  return (
    <span className={`font-display italic lowercase ${className}`}>
      <span className={`chrome-text ${lit ? 'is-lit' : ''}`}>dew theory</span>
    </span>
  );
}
