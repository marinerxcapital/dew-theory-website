'use client';

import { usePathname } from 'next/navigation';

/**
 * Quiet pearl field only — no full-bleed video.
 * Hero video was ~1.4MB and barely visible under the clinical redesign wash;
 * removing it cuts mobile data, LCP contention, and main-thread decode cost.
 * Admin routes skip the layer entirely.
 */
export default function MotionBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="motion-bg" aria-hidden="true">
      <div className="motion-bg__glass" />
      <div className="motion-bg__vignette" />
    </div>
  );
}
