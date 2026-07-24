# Sitewide motion background

**Updated:** 2026-07-24

## Goal

Every storefront page uses the **same** motion plane as the home hero (silent looped
`/hero.mp4` + `/hero-poster.webp`), not just the home fold.

## Implementation

| Piece | Role |
|---|---|
| `components/MotionBackground.jsx` | Fixed full-viewport video/poster + iridescent + glass + soft vignette |
| `app/layout.jsx` | Mounts MotionBackground before AmbientField |
| `components/Hero.jsx` | Content + fold vignette only (no second video) |
| `app/globals.css` | `.motion-bg*` styles; translucent `.ambient-field` so video shows through |

## Behavior

- **Storefront** (`/`, `/shop`, `/book`, …): motion background on.
- **Admin** (`/admin/*`): component returns `null` (solid admin chrome).
- **`prefers-reduced-motion`**: static poster only; video hidden via CSS + no autoplay path.
- **Opacity:** media at ~0.45 with glass wash for type readability (matches original home).

## Assets

- `public/hero.mp4` — silent ping-pong loop (~20s)
- `public/hero-poster.webp` — still frame / reduced-motion fallback
