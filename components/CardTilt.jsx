'use client';

import { useEffect, useRef } from 'react';

/**
 * One delegated pointer-following tilt controller for the whole page.
 *
 * The first version of this effect put a client component inside every product
 * card, which meant a React boundary and a hydration pass per card — measurable
 * main-thread cost on a grid of thirty products for a purely visual flourish.
 * This is a single listener mounted once in the layout: it finds the hovered
 * `[data-tilt]` element, writes its rotation to CSS custom properties, and
 * clears them on the way out. Cards stay server components.
 *
 * Skipped entirely for coarse pointers and reduced-motion users, and the CSS
 * also hard-disables the transform in those cases.
 */
export default function CardTilt() {
  const activeRef = useRef(null);
  const frameRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
    const sync = () => {
      enabledRef.current = !reduce.matches && !coarse.matches;
    };
    sync();
    reduce.addEventListener?.('change', sync);
    coarse.addEventListener?.('change', sync);

    const clear = (el) => {
      if (!el) return;
      el.style.removeProperty('--tilt-rx');
      el.style.removeProperty('--tilt-ry');
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
    };

    const onMove = (event) => {
      if (!enabledRef.current) return;
      const el =
        event.target instanceof Element ? event.target.closest('[data-tilt]') : null;

      if (el !== activeRef.current) {
        clear(activeRef.current);
        activeRef.current = el;
      }
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        // 3–5deg is the whole budget: enough to read as weight, not a gimmick.
        el.style.setProperty('--tilt-ry', `${((px - 0.5) * 4.4).toFixed(2)}deg`);
        el.style.setProperty('--tilt-rx', `${((0.5 - py) * 4.4).toFixed(2)}deg`);
        el.style.setProperty('--tilt-x', `${((px - 0.5) * 3).toFixed(2)}px`);
        el.style.setProperty('--tilt-y', `${((py - 0.5) * 2).toFixed(2)}px`);
      });
    };

    const onLeave = () => {
      clear(activeRef.current);
      activeRef.current = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      clear(activeRef.current);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      reduce.removeEventListener?.('change', sync);
      coarse.removeEventListener?.('change', sync);
    };
  }, []);

  return null;
}
