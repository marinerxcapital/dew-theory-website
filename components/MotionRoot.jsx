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
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
      });
    };

    if (isAdmin || reduced) {
      root.classList.remove('js-motion');
      revealAll();
      return undefined;
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
          el.classList.add('is-inview');
          el.dataset.revealDone = '1';
          io.unobserve(el);
        }
      },
      { root: null, rootMargin: '0px 0px -4% 0px', threshold: 0.01 }
    );

    const arm = (el) => {
      if (!(el instanceof Element) || !el.hasAttribute('data-reveal')) return;
      if (el.dataset.revealDone === '1') {
        el.classList.add('is-inview');
        return;
      }
      const rect = el.getBoundingClientRect();
      // Reveal near/in viewport immediately so shop grids never stay invisible
      if (rect.top < window.innerHeight * 1.05 && rect.bottom > 0) {
        el.classList.add('is-inview');
        el.dataset.revealDone = '1';
        return;
      }
      io.observe(el);
    };

    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach(arm);
    };

    scan();

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
      mq.removeEventListener?.('change', onMq);
      io.disconnect();
      mo?.disconnect();
      root.classList.remove('js-motion');
    };
  }, [pathname]);

  return null;
}
