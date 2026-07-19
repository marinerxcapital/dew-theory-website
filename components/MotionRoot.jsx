'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('js-motion');
    const mm = gsap.matchMedia();

    // Reduced motion: everything arrives, nothing moves.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-reveal]', { opacity: 1, y: 0, clearProps: 'all' });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Soft cross-fade on route entry.
      gsap.fromTo('#main', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' });

      // Elements inside a [data-reveal-group] stagger together; others arrive alone.
      const groups = new Map();
      document.querySelectorAll('[data-reveal]').forEach((el) => {
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
          scrollTrigger: { trigger: els[0], start: 'top 88%', once: true }
        });
      });

      ScrollTrigger.refresh();
    });

    // Nav: transparent until the hero is behind us.
    const nav = document.querySelector('[data-nav]');
    const onScroll = () => {
      if (!nav) return;
      nav.dataset.state = window.scrollY > window.innerHeight * 0.72 ? 'frosted' : 'clear';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
