# Production Deploy Log — Dew Theory Logo Replacement

**Date:** 2026-09-28  
**Timestamp (UTC):** 2026-09-28T21:04:03Z  
**Signed:** Codex  
**Model:** Codex, GPT-5-based coding agent  
**Scope:** Replace the Dew Theory website logo with the newly supplied true-alpha glass/chrome wordmark, preserve transparent pixels, keep a restrained professional glow, and deploy to `dewtheoryco.com`.

## Source

- Worktree: `C:\Users\Skyler B. Brown\Desktop\DewTheory\working\dew-theory-wt-zero-touch`
- GitHub: not used.
- Git: unavailable in this orphaned local worktree.

## Implementation

- Installed the newly supplied true-alpha canonical logo:
  - `public/logo-dewtheory-glass-wordmark-transparent.png`
  - `public/logo-dewtheory-glass-wordmark-transparent.webp`
- Replaced legacy public logo aliases so stale direct paths use the new logo.
- Updated customer-facing logo paths:
  - `components/Wordmark.jsx`
  - `components/Nav.jsx`
  - `components/Footer.jsx`
  - `app/layout.jsx`
  - `app/page.jsx`
  - `app/shop/page.jsx`
  - `app/virtual-consultation/page.jsx`
  - `public/site.webmanifest`
  - `public/_headers`
- Added `.brand-wordmark` CSS glow/shimmer in `app/globals.css`.
- Preserved reduced-motion with a static fallback.

## Local Verification

- `npm test` passed: 374 pass / 0 fail.
- `npm run build` passed.
- Local browser QA passed for desktop/mobile clear nav, scrolled nav, footer, and reduced-motion.
- Canonical PNG alpha sanity passed: all corners alpha `0`; outer edge non-transparent pixel count `0`.

## Deployment

- Command: `npm run deploy`
- Wrangler: 4.141.0
- Worker: `dew-theory`
- Current Version ID: `2815c88a-6d37-4ead-b0e6-c6bbde9da72f`
- Domains:
  - `https://dewtheoryco.com`
  - `https://www.dewtheoryco.com`
  - `https://dew-theory.marinerx-capital.workers.dev`
- Schedule retained: `0 6 * * *`
- Production vars shown by deploy output remained:
  - `NEXT_PUBLIC_SITE_URL=https://dewtheoryco.com`
  - `SKIN_SCRIPT_MODE=mock`
  - `AUTO_FULFILL=false`

## Live Verification

- `npm run smoke:routes -- https://dewtheoryco.com` passed all checks.
- HEAD probes returned 200 for:
  - `https://dewtheoryco.com`
  - `https://www.dewtheoryco.com`
  - `https://dewtheoryco.com/logo-dewtheory-glass-wordmark-transparent.png`
  - `https://dewtheoryco.com/logo-dewtheory-glass-wordmark-transparent.webp`
  - `https://dewtheoryco.com/logo-dewtheory-glass-20260928.png`
  - `https://dewtheoryco.com/logo-dewtheory-20260825.webp`
  - `https://dewtheoryco.com/site.webmanifest`
- Canonical PNG served `Content-Type: image/png` and `Cache-Control: public, max-age=31536000, immutable`.
- Live Playwright QA confirmed:
  - Header/nav and footer resolve to `/logo-dewtheory-glass-wordmark-transparent.png`.
  - `.brand-wordmark` background is transparent.
  - Desktop and mobile clear nav render.
  - Scrolled nav enters `data-state="solid"`.
  - Reduced-motion mode disables the breathing animation.
  - Console warnings/errors: none.

## Residuals

- No live checkout, Stripe payment, RPA fulfillment, Skin Script portal, admin-authenticated workflow, or live order was executed.
- Existing OpenNext/Workers Durable Object warnings appeared during build/deploy; deployment still completed and live smoke passed.
