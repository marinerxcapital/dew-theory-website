'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Mobile sticky conversion bar — Book + secondary link.
 */
export default function StickyCtaBar({
  primaryHref = '/book',
  primaryLabel = 'Book a facial',
  secondaryHref = '/shop',
  secondaryLabel = 'Shop'
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-18px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-shell gap-2">
        <Link
          href={primaryHref}
          className="btn-primary flex min-h-[44px] flex-1 items-center justify-center px-4 py-3 text-center font-label text-[0.66rem] font-normal uppercase tracking-lockup"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="btn-ghost flex min-h-[44px] flex-1 items-center justify-center px-4 py-3 text-center font-label text-[0.66rem] font-normal uppercase tracking-lockup"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
