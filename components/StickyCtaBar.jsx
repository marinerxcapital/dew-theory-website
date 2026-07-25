'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Mobile sticky conversion bar — Book + secondary link.
 * Hidden on large screens and when scrolled near footer (optional simple show-after-scroll).
 */
export default function StickyCtaBar({
  primaryHref = '/book',
  primaryLabel = 'Book a facial',
  secondaryHref = '/virtual-consultation',
  secondaryLabel = 'Virtual consult'
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 280);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-chrome/25 bg-pearl/92 px-4 py-3 shadow-[0_-12px_40px_-20px_rgba(45,47,58,0.35)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-shell gap-2">
        <Link
          href={primaryHref}
          className="sweep btn-primary flex min-h-[44px] flex-1 items-center justify-center px-4 py-3 text-center font-label text-[0.66rem] font-light uppercase tracking-lockup"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="flex min-h-[44px] flex-1 items-center justify-center border border-graphite/25 px-4 py-3 text-center font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/50"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
