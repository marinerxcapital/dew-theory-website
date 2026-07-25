'use client';

import { usePathname } from 'next/navigation';

/**
 * Fixed soft-chrome fields behind the whole site.
 * Gives .glass-1 / .glass-2 something textured to blur against.
 *
 * On the treatment menu (/services), large circular orbs are not mounted —
 * they bled through transparent service rows as pale oval artifacts
 * (lavender top-right on Signature Dew Facial was the reported mobile bug).
 * Quiet mode also drops circular field/mesh paint; iridescent MotionBackground stays.
 */
export default function AmbientField() {
  const pathname = usePathname();
  const quietOrbs =
    pathname === '/services' || pathname?.startsWith('/services/');

  return (
    <div
      className={`ambient-field${quietOrbs ? ' ambient-field--quiet' : ''}`}
      aria-hidden="true"
      data-ambient={quietOrbs ? 'quiet' : 'full'}
      data-services-ambient={quietOrbs ? '1' : undefined}
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
