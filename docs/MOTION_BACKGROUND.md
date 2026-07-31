# Sitewide motion background

**Updated:** 2026-07-30

## Goal

Every storefront page uses the **same** motion plane as the home hero (silent looped
`/hero.mp4` + `/hero-poster.webp`), not just the home fold.

## Implementation

| Piece | Role |
|---|---|
| `components/MotionBackground.jsx` | Fixed full-viewport video/poster + iridescent + glass + soft vignette |
| `app/layout.jsx` | Mounts MotionBackground before AmbientField; loads AIDesigner runtime once |
| `components/Hero.jsx` | Content + fold vignette + **Noise Shimmer** decorative plane (no second video) |
| `app/globals.css` | `.motion-bg*` styles; translucent `.ambient-field`; `.noise-shimmer-fallback` |

## Behavior

- **Storefront** (`/`, `/shop`, `/book`, …): motion background on.
- **Admin** (`/admin/*`): MotionBackground returns `null` (solid admin chrome). Runtime Script still loads once from root layout (harmless third-party byte cost).
- **`prefers-reduced-motion`**: static poster only; video hidden via CSS + no autoplay path. Noise Shimmer `data-aifx*` attrs omitted; canvas forced hidden; static gradient remains.
- **Opacity:** media at ~0.45 with glass wash for type readability (matches original home).

## Home hero — AIDesigner Noise Shimmer (2026-07-30)

| Item | Value |
|------|--------|
| Effect | `noise-shimmer` |
| Colors | `#6f7cff,#ff4fa3,#4fe3d1` |
| Background | `#7f84b8` |
| scale / shimmer / intensity / contrast / speed | `1.66` / `0.52` / `0.24` / `0.55` / `1.37` |
| Host | `components/Hero.jsx` — `relative isolate overflow-hidden`; layer `absolute inset-0 -z-10 pointer-events-none` |
| Runtime | `https://cdn.aidesigner.ai/effects/runtime/v1.js` via `next/script` in `app/layout.jsx` (`id="aidesigner-effects-runtime"`, `afterInteractive`) — **once per app** |
| Static fallback | `.noise-shimmer-fallback` layered radials (same palette) for first paint / CDN failure / no-JS |
| Readability | Existing `.hero-vignette` pearl wash slightly strengthened (`-z-[5]`); content `z-[1]` |
| CSP | None configured in project — no allowlist change required |
| Ship | Commit `3eeadca` on `main`; Cloudflare Worker version `527da30c-e938-463c-b3d8-0d6eb8c527dc`; live HTML confirmed on dewtheoryco.com |

Stacking on the home fold:

1. Noise Shimmer (`-z-10`) — effect + static fallback  
2. Hero vignette (`-z-[5]`) — soft readability wash  
3. Content (`z-[1]`) — copy, CTAs, portrait column  

Sitewide `MotionBackground` remains fixed behind the page shell (`layout` z stacking).

## Assets

- `public/hero.mp4` — silent ping-pong loop (~20s)
- `public/hero-poster.webp` — still frame / reduced-motion fallback
