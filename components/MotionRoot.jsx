'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Elements already revealed.
 *
 * This used to be a `data-reveal-done` attribute on the node, which React owns:
 * writing it before a Suspense subtree finished hydrating made React see the
 * mutated DOM as the server output and report a hydration mismatch on every
 * product card. Bookkeeping lives outside the DOM instead, so the only thing
 * this controller mutates is the CSS class the stylesheet actually reads.
 */
const revealed = new WeakSet();

function markRevealed(el) {
  el.classList.add('is-inview');
  revealed.add(el);
}

/**
 * Lightweight site motion — no GSAP.
 * Nav frost + IntersectionObserver scroll reveals (CSS transitions only).
 * MutationObserver picks up late client-hydrated [data-reveal] nodes (e.g. ShopGrid).
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector('[data-nav]');
    const reduced = prefersReducedMotion();
    const isAdmin = pathname?.startsWith('/admin');

    const setNavState = () => {
      if (!nav) return;
      nav.dataset.state = 'frosted';
    };
    setNavState();

    const revealAll = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        markRevealed(el);
      });
    };

    if (isAdmin || reduced) {
      root.classList.remove('js-motion');
      /*
       * Deferred one frame. Under reduced motion the base state of
       * [data-reveal] is already visible (`js-motion` is never added), so
       * waiting a frame costs nothing visually and lets hydration finish
       * before any class is written into a React-owned subtree.
       */
      const raf = window.requestAnimationFrame(revealAll);
      return () => window.cancelAnimationFrame(raf);
    }

    root.classList.add('js-motion');

    if (typeof IntersectionObserver === 'undefined') {
      revealAll();
      return () => root.classList.remove('js-motion');
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          markRevealed(el);
          io.unobserve(el);
        }
      },
      { root: null, rootMargin: '180px 0px 20% 0px', threshold: 0.01 }
    );

    const arm = (el) => {
      if (!(el instanceof Element) || !el.hasAttribute('data-reveal')) return;
      if (revealed.has(el)) {
        el.classList.add('is-inview');
        return;
      }
      const rect = el.getBoundingClientRect();
      // Reveal near/in viewport immediately so shop grids never stay invisible
      if (rect.top < window.innerHeight * 1.05 && rect.bottom > 0) {
        markRevealed(el);
        return;
      }
      io.observe(el);
    };

    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach(arm);
    };

    scan();

    /*
     * Deterministic reveal sweep.
     *
     * IntersectionObserver is the primary driver, but it is a hint, not a
     * guarantee: nested scrollers, clip-path, and hydration timing can all
     * leave an element in view with no callback. Because the base state of
     * [data-reveal] is `opacity: 0`, a missed callback ships invisible content —
     * an unacceptable failure for a text-heavy page. This rAF-throttled sweep
     * re-checks geometry on every scroll and resize, so anything actually on
     * screen is always revealed regardless of what the observer decided.
     */
    let sweepFrame = 0;
    const sweep = () => {
      sweepFrame = 0;
      const vh = window.innerHeight;
      document.querySelectorAll('[data-reveal]:not(.is-inview)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 1.02 && rect.bottom > -40) {
          markRevealed(el);
        }
      });
    };
    const onSweep = () => {
      if (sweepFrame) return;
      sweepFrame = window.requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('resize', onSweep, { passive: true });
    sweep();

    const mo =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver((mutations) => {
            for (const m of mutations) {
              m.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) return;
                if (node.hasAttribute?.('data-reveal')) arm(node);
                node.querySelectorAll?.('[data-reveal]').forEach(arm);
              });
            }
          })
        : null;
    mo?.observe(document.body, { childList: true, subtree: true });

    // Second pass after layout/hydration settles (client ShopGrid, fonts, images)
    const t1 = window.setTimeout(scan, 50);
    const t2 = window.setTimeout(scan, 400);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      if (!mq.matches) return;
      root.classList.remove('js-motion');
      revealAll();
      io.disconnect();
      mo?.disconnect();
    };
    mq.addEventListener?.('change', onMq);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (sweepFrame) window.cancelAnimationFrame(sweepFrame);
      window.removeEventListener('scroll', onSweep);
      window.removeEventListener('resize', onSweep);
      mq.removeEventListener?.('change', onMq);
      io.disconnect();
      mo?.disconnect();
      root.classList.remove('js-motion');
    };
  }, [pathname]);

  return null;
}
