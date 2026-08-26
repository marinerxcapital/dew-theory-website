'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Wordmark from './Wordmark';

/**
 * Full-bleed landing hero — brand-first composition with dew-field motion.
 * Motion is CSS + a lightweight canvas (no GSAP on the critical path).
 * Respects prefers-reduced-motion.
 */
export default function Hero() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    /** @type {{ x: number, y: number, r: number, vy: number, vx: number, a: number, life: number }[]} */
    let drops = [];

    const resize = () => {
      const { width, height } = section.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 640 ? 28 : width < 1024 ? 42 : 56;
      drops = Array.from({ length: count }, () => spawn(width, height, true));
    };

    const spawn = (w, h, randomY = false) => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + Math.random() * 40,
      r: 0.9 + Math.random() * 3.2,
      vy: -(0.14 + Math.random() * 0.42),
      vx: (Math.random() - 0.5) * 0.22,
      a: 0.18 + Math.random() * 0.42,
      life: 0.45 + Math.random() * 0.55
    });

    const draw = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i += 1) {
        const d = drops[i];
        d.y += d.vy;
        d.x += d.vx + Math.sin((d.y + i * 12) * 0.008) * 0.15;
        d.life -= 0.0008;

        if (d.y < -12 || d.life <= 0) {
          drops[i] = spawn(w, h, false);
          continue;
        }

        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3.2);
        g.addColorStop(0, `rgba(237,237,230,${d.a})`);
        g.addColorStop(0.45, `rgba(147,168,144,${d.a * 0.45})`);
        g.addColorStop(1, 'rgba(30,43,34,0)');
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(d.x, d.y, d.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, d.a + 0.25)})`;
        ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.4, d.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize, { passive: true });

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        draw();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-stage relative isolate min-h-[min(92svh,58rem)] overflow-hidden border-b border-border"
      aria-label="Dew Theory"
    >
      <canvas
        ref={canvasRef}
        className="hero-stage__dew pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      />

      <div className="relative z-[2] mx-auto flex min-h-[min(92svh,58rem)] w-full max-w-shell flex-col justify-end px-5 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:justify-center lg:px-10 lg:pb-20 lg:pt-24">
        <div className="hero-stage__copy max-w-xl lg:max-w-2xl">
          <Wordmark
            src="/logo-dewtheory-20260825.webp"
            priority
            className="hero-stage__brand-logo h-auto w-[min(78vw,42rem)] object-contain object-left"
          />

          <p className="hero-stage__rule mt-4 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew-dark sm:mt-5 sm:text-[0.68rem]">
            Skin — Care
          </p>

          <h1 className="hero-stage__headline mt-7 max-w-lg font-display text-[clamp(1.55rem,3.6vw,2.35rem)] font-normal leading-[1.15] tracking-[-0.01em] text-ink sm:mt-8">
            this and no stress
          </h1>

          <p className="hero-stage__lede mt-4 max-w-md font-body text-base font-normal leading-relaxed text-charcoal/90 sm:mt-5 sm:text-[1.05rem]">
            Professional Skin Script actives for home — and a barrier-first routine built around
            what your skin actually needs.
          </p>

          <div className="hero-stage__cta mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/shop"
              className="btn-primary w-full min-h-[48px] px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup sm:w-auto"
            >
              Shop Skin Script
            </Link>
            <Link
              href="/quiz"
              className="btn-dew-outline w-full min-h-[48px] bg-ivory/80 px-9 py-4 text-center font-label text-[0.72rem] font-normal uppercase tracking-lockup backdrop-blur-[2px] sm:w-auto"
            >
              Take the Skin Quiz
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-stage__scroll pointer-events-none absolute bottom-5 left-1/2 z-[2] hidden -translate-x-1/2 sm:block" aria-hidden="true">
        <span className="scroll-cue block h-8 w-px" />
      </div>
    </section>
  );
}
