'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll-linked product stage for the PDP hero.
 *
 * As the top viewport scrolls, the product turns through a slow, small arc and
 * drifts — a deliberate rotation tied to scroll position, not a generic fade.
 * The rotation is derived from how far the stage has travelled through the
 * viewport and written to CSS custom properties, so there is no per-frame React
 * render. With reduced motion the stage is completely static.
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function PdpMediaStage({ children, className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;
    let ticking = false;

    const paint = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // 0 when the stage enters from the bottom, 1 once it has left the top.
      const travelled = (viewport - rect.top) / (viewport + rect.height);
      const p = Math.min(1, Math.max(0, travelled));

      const rotate = (p - 0.5) * 9; // ±4.5deg across the whole pass
      const lift = (0.5 - p) * 26; // ±13px
      el.style.setProperty('--stage-ry', `${rotate.toFixed(2)}deg`);
      el.style.setProperty('--stage-y', `${lift.toFixed(2)}px`);
      el.style.setProperty('--stage-shadow', (0.35 + p * 0.4).toFixed(3));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`pdp-stage ${className}`}
      style={{ perspective: '1400px' }}
    >
      {children}
    </div>
  );
}
