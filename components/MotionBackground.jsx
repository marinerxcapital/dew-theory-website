'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Sitewide motion plane — same hero footage as the home fold.
 * Fixed behind storefront routes; skipped on /admin and prefers-reduced-motion
 * (static poster only when reduced motion is on).
 *
 * Performance:
 * - Poster-first paint via next/image; video mounts only when allowed.
 * - Home: mount video immediately (still poster underneath until canplay).
 * - Non-home: poster + iridescence first; video after idle (≤2s) to cut TBT.
 * - Data-saver / slow effectiveType on non-home: poster only (no video).
 * - Deferred video uses preload="none".
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

/** Network Information API — true when we should avoid background video bytes. */
function isConstrainedConnection() {
  if (typeof navigator === 'undefined') return false;
  const conn =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;
  if (conn.saveData) return true;
  const t = conn.effectiveType;
  return t === 'slow-2g' || t === '2g';
}

export default function MotionBackground() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [mountVideo, setMountVideo] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  const isAdmin = pathname?.startsWith('/admin');
  const isHome = pathname === '/';

  useEffect(() => {
    if (reduced || isAdmin) {
      setMountVideo(false);
      setHasVideo(false);
      return undefined;
    }

    // Video only when: not reduced-motion, and (home OR not constrained).
    // Non-home + data-saver/slow → poster + iridescent only.
    const constrained = isConstrainedConnection();
    if (!isHome && constrained) {
      setMountVideo(false);
      setHasVideo(false);
      return undefined;
    }

    // Home: mount immediately so motion starts ASAP; poster still paints first.
    if (isHome) {
      setMountVideo(true);
      return undefined;
    }

    // Non-home storefront: idle-defer video (keeps main thread free for conversion UI).
    // If already mounted (e.g. navigated from home), leave it — idle setState(true) is a no-op.
    let cancelled = false;
    let idleId;
    let timeoutId;

    const start = () => {
      if (!cancelled) setMountVideo(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(start, 2000);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [reduced, isAdmin, isHome, pathname]);

  useEffect(() => {
    if (!mountVideo) setHasVideo(false);
  }, [mountVideo]);

  if (isAdmin) return null;

  // Poster via next/image whenever video is not playing (reduced, deferred, or not ready).
  const showPoster = reduced || !hasVideo;
  // Home can use metadata; deferred non-home routes use none until idle mount.
  const videoPreload = isHome ? 'metadata' : 'none';

  // Quiet clinical: pearl field only on conversion paths; whisper media on browse routes.
  const isConversion =
    pathname === '/cart' ||
    pathname?.startsWith('/cart/') ||
    pathname === '/book' ||
    pathname?.startsWith('/book/') ||
    pathname === '/virtual-consultation' ||
    pathname?.startsWith('/virtual-consultation/');

  return (
    <div className="motion-bg" aria-hidden="true">
      {!isConversion ? <div className="iridescent motion-bg__iridescent" /> : null}

      {!isConversion && showPoster ? (
        <Image
          src="/hero-poster.webp"
          alt=""
          fill
          priority={isHome}
          sizes="100vw"
          className="motion-bg__media object-cover"
        />
      ) : null}

      {!isConversion && mountVideo && !reduced ? (
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
          preload={videoPreload}
          onCanPlay={() => setHasVideo(true)}
          onError={() => {
            setHasVideo(false);
            setMountVideo(false);
          }}
        />
      ) : null}

      <div className="motion-bg__glass" />
      <div className="motion-bg__vignette" />
    </div>
  );
}
