import path from 'path';
import { fileURLToPath } from 'url';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isolate QA builds from the running local server; production keeps the standard output.
  distDir: process.env.DEW_QA_DIST_DIR || '.next',
  // Parent home directory has another package-lock.json; pin tracing to this app.
  outputFileTracingRoot: path.join(__dirname),
  // QA artifacts and local fixtures must never enter the deployed server filesystem.
  outputFileTracingExcludes: {
    '/*': ['./docs/**/*', './tests/**/*', './.next-qa*/**/*', './.revamp-git-objects/**/*', './data/runtime/**/*', './.env*', './.dev.vars']
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Prefer slightly smaller encodes for retail cards (hero still uses quality default).
    qualities: [60, 70, 75, 85],
    /**
     * Local image patterns.
     *
     * Product media carries a `?v=<revision>` cache-busting token
     * (lib/product-image.js) because the assets are served `immutable` for a
     * year — without the token a replaced photograph never reaches a returning
     * visitor. Next 15 warns about query strings that are not declared here, and
     * Next 16 makes it an error, so allow the whole local namespace with any
     * search string rather than enumerating every path.
     */
    localPatterns: [{ pathname: '/**' }]
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
