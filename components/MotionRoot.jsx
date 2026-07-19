'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sitewide motion: route cross-fade, scroll reveals, nav frosting.
 * Under prefers-reduced-motion: no js-motion hide, no GSAP tweens, no ScrollTriggers.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = prefersReducedMotion();

    // Admin or reduced motion: never leave content at opacity 0
    if (pathname?.startsWith('/admin') || reduced) {
      document.documentElement.classList.remove('js-motion');
      gsap.set('[data-reveal]', { clearProps: 'all' });
      gsap.set('#main', { clearProps: 'opacity' });
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.dataset.revealDone = '1';
      });
      ScrollTrigger.getAll().forEach((st) => st.kill());

      if (pathname?.startsWith('/admin')) return undefined;

      // Still frost nav on scroll without animated threshold fuss
      const nav = document.querySelector('[data-nav]');
      const onScroll = () => {
        if (!nav) return;
        nav.dataset.state = window.scrollY > 48 ? 'frosted' : 'clear';
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    document.documentElement.classList.add('js-motion');

    const nav = document.querySelector('[data-nav]');
    const main = document.getElementById('main');

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

    const bindReveals = () => {
      if (prefersReducedMotion()) return;

      const nodes = document.querySelectorAll('[data-reveal]');
      const groups = new Map();
      nodes.forEach((el) => {
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
      if (ctx) ctx.revert();
      if (mm) mm.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());

      // User flipped OS setting mid-session
      if (prefersReducedMotion()) {
        document.documentElement.classList.remove('js-motion');
        gsap.set('[data-reveal]', { clearProps: 'all' });
        gsap.set('#main', { clearProps: 'opacity' });
        return;
      }

      ctx = gsap.context(() => {
        mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: reduce)', () => {
          document.documentElement.classList.remove('js-motion');
          gsap.set('[data-reveal]', { opacity: 1, y: 0, clearProps: 'transform' });
          gsap.set('#main', { clearProps: 'opacity' });
          document.querySelectorAll('[data-reveal]').forEach((el) => {
            el.dataset.revealDone = '1';
          });
        });

        mm.add('(prefers-reduced-motion: no-preference)', () => {
          document.documentElement.classList.add('js-motion');
          if (main) {
            gsap.fromTo(
              main,
              { opacity: 0 },
              { opacity: 1, duration: 0.45, ease: 'power1.out', overwrite: true }
            );
          }

          document.querySelectorAll('[data-reveal]').forEach((el) => {
            if (el.dataset.revealDone === '1') {
              gsap.set(el, { opacity: 1, y: 0 });
            } else {
              gsap.set(el, { opacity: 0, y: 18 });
            }
          });

          bindReveals();
        });
      }, main || undefined);

      raf = requestAnimationFrame(() => {
        t2 = window.setTimeout(() => {
          if (prefersReducedMotion()) return;
          bindReveals();
        }, 120);
      });
    };

    run();

    // Live toggle if user changes OS preference while tab is open
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      if (mq.matches) {
        document.documentElement.classList.remove('js-motion');
        ScrollTrigger.getAll().forEach((st) => st.kill());
        gsap.set('[data-reveal]', { clearProps: 'all' });
        gsap.set('#main', { clearProps: 'opacity' });
      } else {
        run();
      }
    };
    mq.addEventListener?.('change', onMq);

    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener?.('change', onMq);
      cancelAnimationFrame(raf);
      window.clearTimeout(t2);
      if (ctx) ctx.revert();
      if (mm) mm.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.set('[data-reveal]', { clearProps: 'all' });
      gsap.set('#main', { clearProps: 'opacity' });
    };
  }, [pathname]);

  return null;
}
