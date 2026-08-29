import path from 'path';
import { fileURLToPath } from 'url';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Parent home directory has another package-lock.json; pin tracing to this app.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Prefer slightly smaller encodes for retail cards (hero still uses quality default).
    qualities: [60, 70, 75, 85]
  },
  compress: true,
  poweredByHeader: false,
  // Tree-shake large client packages when imported from barrel paths.
  experimental: {
    optimizePackageImports: ['gsap']
  },
  async redirects() {
    return [
      { source: '/studio', destination: '/', permanent: true },
      { source: '/studio/:path*', destination: '/', permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Hint browsers to preconnect less aggressively; keep DNS for same-origin only.
          { key: 'X-DNS-Prefetch-Control', value: 'on' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        source: '/:file(.*\\.(?:webp|png|jpg|jpeg|svg|mp4|woff2|avif))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      }
    ];
  }
};

export default nextConfig;

initOpenNextCloudflareForDev();
