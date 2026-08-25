# Landing hero motion — 2026-08

**PR:** #6 (`cursor/landing-hero-motion-2e1c` → merge `1e56d6c`)  
**Deployed:** 2026-08-16, Worker `dew-theory` version `e6bc265f-97d8-4518-a96b-6f37a0983bca`

## What changed

The home hero was replaced from the split retail card layout with a brand-first, edge-to-edge
composition: a large Dew Theory wordmark lockup, a cinematic full-bleed product plane (single
`ageless-skin-hydrating-serum.webp`), and a lean CTA pair (`Shop Skin Script` + `Take the Skin Quiz`).

## Motion architecture

All motion is CSS + a lightweight 2D canvas. No GSAP runs on the critical hero path.

| Layer | Mechanism |
|---|---|
| Ken Burns | `.hero-stage__media` — `hero-ken` 28s alternate scale/translate |
| Caustic light | `.hero-stage__caustic` — soft-light gradient sweep, `hero-caustic` 11s alternate |
| Dew particles | `<canvas>` in `components/Hero.jsx` — rising radial-gradient droplets, DPR-capped (≤2), count scales 28/42/56 by viewport width |
| Text reveal | `.hero-stage__brand-logo` / `__headline` / `__lede` / `__cta` — staggered `hero-rise` blur+translate |
| Rule reveal | `.hero-stage__rule::after` — `hero-rule` scaleX |
| Fade-in | `.hero-stage__dew` — `hero-dew-fade` |

## Reduced motion

- `prefers-reduced-motion: no-preference` gates every animation (`@media`).
- `prefers-reduced-motion: reduce` hides the caustic and dew layers entirely.
- The canvas effect performs a `window.matchMedia('(prefers-reduced-motion: reduce)')` early return,
  so no animation loop starts for reduced-motion users.
- The canvas also pauses on `visibilitychange` (document hidden) and resumes on return.

## Scope note

`components/MotionRoot.jsx` remains the CSS/IntersectionObserver sitewide motion (scroll reveals,
staggering, nav frosting, route cross-fade). The new hero motion is local to `components/Hero.jsx`
and its `.hero-stage*` styles in `app/globals.css`.
