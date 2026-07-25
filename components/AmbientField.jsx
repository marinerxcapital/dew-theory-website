'use client';

import { usePathname } from 'next/navigation';

/**
 * Fixed soft-chrome fields behind the whole site.
 * Gives .glass-1 / .glass-2 something textured to blur against.
 *
 * Quiet orb mode (no large circular orbs) on:
 * - /services — orbs bled through transparent service rows as pale ovals
 * - /cart, /book, /virtual-consultation* — conversion paths; cut paint cost
 * Quiet mode also softens circular field/mesh paint; iridescent MotionBackground stays.
 * Mesh + linear-ish field remain in quiet mode.
 */
function isQuietOrbPath(pathname) {
  if (!pathname) return false;
  return (
    pathname === '/services' ||
    pathname.startsWith('/services/') ||
    pathname === '/cart' ||
    pathname.startsWith('/cart/') ||
    pathname === '/book' ||
    pathname.startsWith('/book/') ||
    pathname === '/virtual-consultation' ||
    pathname.startsWith('/virtual-consultation/')
  );
}

export default function AmbientField() {
  const pathname = usePathname();
  const quietOrbs = isQuietOrbPath(pathname);

  return (
    <div
      className={`ambient-field${quietOrbs ? ' ambient-field--quiet' : ''}`}
      aria-hidden="true"
      data-ambient={quietOrbs ? 'quiet' : 'full'}
      data-services-ambient={
        pathname === '/services' || pathname?.startsWith('/services/')
          ? '1'
          : undefined
      }
    >
      {!quietOrbs ? (
        <>
          <span className="ambient-orb ambient-orb--ice" />
          <span className="ambient-orb ambient-orb--lavender" />
          <span className="ambient-orb ambient-orb--blush" />
          <span className="ambient-orb ambient-orb--chrome" />
        </>
      ) : null}
      <span className="ambient-mesh" />
    </div>
  );
}
