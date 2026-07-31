'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Load AIDesigner effects runtime only on the homepage (Noise Shimmer hero).
 * Avoids third-party JS cost on conversion + admin routes.
 */
export default function AidesignerRuntime() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <Script
      id="aidesigner-effects-runtime"
      src="https://cdn.aidesigner.ai/effects/runtime/v1.js"
      strategy="afterInteractive"
    />
  );
}
