'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Sitewide motion plane — same hero footage as the home fold.
 * Fixed behind storefront routes; skipped on /admin and prefers-reduced-motion
 * (static poster only when reduced motion is on).
 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);
  return reduced;
}

export default function MotionBackground() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [hasVideo, setHasVideo] = useState(false);

  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!reduced) return;
    setHasVideo(false);
  }, [reduced]);

  if (isAdmin) return null;

  return (
    <div className="motion-bg" aria-hidden="true">
      <div className="iridescent motion-bg__iridescent" />

      {reduced ? (
        <Image
          src="/hero-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="motion-bg__media object-cover"
        />
      ) : (
        <video
          className={`motion-bg__media motion-bg__video ${
            hasVideo ? 'motion-bg__video--ready' : ''
          }`}
          src="/hero.mp4"
          poster="/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
        />
      )}

      <div className="glass-2 motion-bg__glass" />
      <div className="motion-bg__vignette" />
    </div>
  );
}
