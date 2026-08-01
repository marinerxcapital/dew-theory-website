'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Lightweight site motion — no GSAP.
 * Nav frost + IntersectionObserver scroll reveals (CSS transitions only).
 * Keeps ~70KB+ of animation library off the critical path (TBT / mobile).
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
      // Always frosted in clinical redesign; keep attribute for CSS compatibility
      nav.dataset.state = 'frosted';
    };
    setNavState();

    if (isAdmin || reduced) {
      root.classList.remove('js-motion');
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
      });
      return undefined;
    }

    root.classList.add('js-motion');

    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => {
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
      });
      return () => root.classList.remove('js-motion');
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          el.classList.add('is-inview');
          el.dataset.revealDone = '1';
          io.unobserve(el);
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    nodes.forEach((el) => {
      if (el.dataset.revealDone === '1') {
        el.classList.add('is-inview');
        return;
      }
      // Above-the-fold: reveal immediately to avoid LCP/text delay
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
      } else {
        io.observe(el);
      }
    });

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      if (!mq.matches) return;
      root.classList.remove('js-motion');
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
      });
      io.disconnect();
    };
    mq.addEventListener?.('change', onMq);

    return () => {
      mq.removeEventListener?.('change', onMq);
      io.disconnect();
      root.classList.remove('js-motion');
    };
  }, [pathname]);

  return null;
}
