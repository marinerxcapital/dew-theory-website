'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sitewide motion: route cross-fade, scroll reveals, nav frosting.
 * Re-inits on every pathname change; gsap.context + ScrollTrigger.kill ensure no double-init leaks.
 * Skipped on /admin (utility UI, no brand motion).
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    // Admin: ensure reveals are never stuck at opacity 0 from a prior storefront visit
    if (pathname?.startsWith('/admin')) {
      document.documentElement.classList.remove('js-motion');
      gsap.set('[data-reveal]', { clearProps: 'all' });
      gsap.set('#main', { clearProps: 'opacity' });
      return undefined;
    }

    document.documentElement.classList.add('js-motion');

    const nav = document.querySelector('[data-nav]');
    const main = document.getElementById('main');

    // Frost earlier on non-home pages (no full-viewport hero)
    const frostThreshold = () => {
      if (pathname === '/') return window.innerHeight * 0.72;
      return 48;
    };
    const onScroll = () => {
      if (!nav) return;
      nav.dataset.state = window.scrollY > frostThreshold() ? 'frosted' : 'clear';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let ctx;
    let mm;
    let raf = 0;
    let t2 = 0;

    const bindReveals = (scope) => {
      const root = scope || document;
      const nodes = root.querySelectorAll
        ? root.querySelectorAll('[data-reveal]')
        : document.querySelectorAll('[data-reveal]');

      const groups = new Map();
      nodes.forEach((el) => {
        // Skip already-played marks so re-bind (hydration) doesn't re-hide
        if (el.dataset.revealDone === '1') return;
        const key = el.closest('[data-reveal-group]') || el;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(el);
      });

      groups.forEach((els) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power2.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: els[0],
            start: 'top 90%',
            once: true,
            onEnter: () => {
              els.forEach((el) => {
                el.dataset.revealDone = '1';
              });
            }
          }
        });
      });

      ScrollTrigger.refresh();
    };

    const run = () => {
      // Tear previous page animations completely
      if (ctx) ctx.revert();
      if (mm) mm.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());

      ctx = gsap.context(() => {
        mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: reduce)', () => {
          gsap.set('[data-reveal]', { opacity: 1, y: 0, clearProps: 'transform' });
          gsap.set('#main', { clearProps: 'opacity' });
          document.querySelectorAll('[data-reveal]').forEach((el) => {
            el.dataset.revealDone = '1';
          });
        });

        mm.add('(prefers-reduced-motion: no-preference)', () => {
          if (main) {
            gsap.fromTo(
              main,
              { opacity: 0 },
              { opacity: 1, duration: 0.45, ease: 'power1.out', overwrite: true }
            );
          }

          // Reset unfinished reveals for this page
          document.querySelectorAll('[data-reveal]').forEach((el) => {
            if (el.dataset.revealDone === '1') {
              gsap.set(el, { opacity: 1, y: 0 });
            } else {
              gsap.set(el, { opacity: 0, y: 18 });
            }
          });

          bindReveals(main || document);
        });
      }, main || undefined);

      // Client components (cart, shop grid) hydrate a beat later — rebind once
      raf = requestAnimationFrame(() => {
        t2 = window.setTimeout(() => {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          bindReveals(main || document);
        }, 120);
      });
    };

    run();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(t2);
      if (ctx) ctx.revert();
      if (mm) mm.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      // Leave elements visible if user navigates mid-animation
      gsap.set('[data-reveal]', { clearProps: 'all' });
      gsap.set('#main', { clearProps: 'opacity' });
    };
  }, [pathname]);

  return null;
}
