'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor-reactive ambient glow.
 *
 * A soft hot-pink radial follows the pointer across the void. The position is
 * written to CSS custom properties on the element itself (never inline React
 * state) so the browser composites on the GPU and React never re-renders.
 * Work is throttled to one write per animation frame and coalesced, and the
 * listener is skipped entirely for coarse pointers and reduced-motion users —
 * CSS also hides the layer in those cases, so nothing depends on JS.
 */
export default function AmbientGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof window === 'undefined') return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
    if (reduce.matches || coarse.matches) return undefined;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;
    let seen = false;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--glow-x', `${nextX}px`);
      el.style.setProperty('--glow-y', `${nextY}px`);
      if (!seen) {
        seen = true;
        el.dataset.active = 'true';
      }
    };

    const onMove = (event) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onLeave = () => {
      el.dataset.active = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={ref} className="ambient-glow" aria-hidden="true" />;
}
