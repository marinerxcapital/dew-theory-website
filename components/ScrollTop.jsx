'use client';

import { useEffect, useState } from 'react';

export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-4 z-30 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center border border-chrome/25 bg-surface/95 font-label text-[0.58rem] font-normal uppercase tracking-lockup text-charcoal shadow-card transition-opacity hover:border-graphite/40 lg:bottom-8 lg:right-8"
      aria-label="Back to top"
    >
      Top
    </button>
  );
}
