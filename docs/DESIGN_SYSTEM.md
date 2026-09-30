# Dew Theory Design System

Canonical tokens for the editorial storefront. Source of truth for hex values:
`app/globals.css` (`:root`) and `tailwind.config.js`. Do **not** change the
authoritative brand five to “fix” contrast — change pairings instead.

---

## Palette

### Authoritative brand five (immutable)

| Token | Hex | Role |
|---|---|---|
| Forest | `#1E2B22` | Main text; inverse surfaces; primary CTAs; footer; category rail |
| Sage deep | `#5B7356` | Botanical accent, decorative rules, selected/hover accents |
| Sage | `#93A890` | Signature sage surfaces, editorial bands, `.btn-dew` fill |
| Ivory | `#EDEDE6` | Page ground; inverse text on forest |
| Stone | `#C9C4B8` | Warm alternate section surfaces |

### Classname aliases (preserve mappings)

| Alias | Maps to | Hex |
|---|---|---|
| `ink` / `graphite` / `charcoal` / `black` | Forest | `#1E2B22` |
| `dew` | Sage deep | `#5B7356` |
| `dew-mid` / `sage` | Sage | `#93A890` |
| `pearl` / `ivory` | Ivory | `#EDEDE6` |
| `stone` | Stone | `#C9C4B8` |

`ink` stays `#1E2B22`. Do **not** remap `ink` to `ink-true`.

### Directive expansion tokens

| Token | Hex | Role |
|---|---|---|
| Porcelain | `#F8F6F0` | Lifted warm ground above ivory |
| Botanical mist | `#E4EADD` | Soft botanical wash / mist sections |
| Mineral water | `#DCE7E7` | Cool mineral section band |
| Rose clay | `#D8BEB0` | Warm clay accent surface |
| Deep botanical | `#314238` | Deeper green between forest and sage-deep |
| Ink true | `#1B1D19` | Near-black ink key only (`ink-true`); separate from `ink` |

### Soft retunes

`ice`, `dew-soft`, and `sage.soft` resolve to botanical mist `#E4EADD`.

### Supporting tokens

| Token | Hex | Role |
|---|---|---|
| Surface / white | `#FFFFFF` | Product cards / lift only |
| Muted | `#5A655C` | Secondary text (AA on ivory) |
| Promo | `#8B3A3A` / dark `#6E2E2E` | Alerts only |

---

## Contrast rules

Safe defaults:

- Forest `#1E2B22` on ivory `#EDEDE6`, stone `#C9C4B8`, sage `#93A890`, mist `#E4EADD`, mineral `#DCE7E7`, porcelain `#F8F6F0`
- Ivory `#EDEDE6` on forest `#1E2B22` and deep botanical `#314238`
- Ivory (or porcelain) on forest sections and inverse CTAs

Avoid without verifying AA:

- Normal-size sage-deep `#5B7356` text on ivory / sage / mist
- Forest text on deep botanical (too close)
- Sage fill with ivory text at small sizes

Do not alter the brand-five hexes for contrast; choose a different pairing.

---

## Typography

| Role | Family | Token / utility | Use |
|---|---|---|---|
| Display | Bodoni Moda | `--font-display` / `font-display` / `.type-display` | H1–H3, editorial quotes, selected italics |
| Label | Jost | `--font-label` / `font-label` / `.type-label` | Uppercase tracked UI, nav, buttons |
| Body | Karla | `--font-body` / `font-body` / `.type-body` | Body, forms, policies |

Label pattern: small size, uppercase, wide tracking (`tracking-lockup` ≈ `0.22em`).

---

## Buttons

CSS classes in `app/globals.css`:

| Class | Surface | Text | Use |
|---|---|---|---|
| `.btn-primary` | Forest | Ivory | Primary CTA |
| `.btn-ghost` | White / border | Forest | Secondary |
| `.btn-dew` | Sage | Forest | Signature botanical CTA |
| `.btn-dew-outline` | Transparent / sage-deep border | Forest | Quiet botanical |
| `.btn-promo` | Promo | Ivory | Alerts / promo only |
| `.btn-inverse` | Transparent / ivory border | Ivory | CTAs on forest / dark bands |

Mobile targets keep `min-height: 44px` for primary/ghost/dew/promo/inverse.

Focus: sitewide `:focus-visible` uses sage-deep ring; dark CTAs (including `.btn-inverse`) use ivory outline + soft sage halo.

---

## Sections

| Class | Background | Text |
|---|---|---|
| `.section-ivory` | Ivory | Forest |
| `.section-sage` | Sage | Forest |
| `.section-stone` | Stone | Forest |
| `.section-forest` | Forest | Ivory |
| `.section-mineral` | Mineral water | Forest |
| `.section-mist` | Botanical mist | Forest |
| `.section-veil` | Soft white veil + borders | inherits |

Tailwind spacing for vertical rhythm:

- `py-section-y` → `4rem`
- `py-section-y-md` → `5.5rem`
- `py-section-y-lg` → `7.5rem`

Other utilities:

- `aspect-product` → `4 / 5` (product media frame)
- `shadow-band` → soft editorial band lift

---

## Motion & focus (preserve)

- `@media (prefers-reduced-motion: reduce)` short-circuits animations/transitions, forces scroll-reveal content visible, and disables decorative motion (orbs, sweep, hero dew, skeleton shimmer).
- Keyboard `:focus-visible` rings remain; mouse `:focus` alone does not show a ring.
- Skip link and dark-surface focus variants stay intact.

---

## File map

| File | Responsibility |
|---|---|
| `app/globals.css` | CSS variables, section/button classes, motion + focus |
| `tailwind.config.js` | Tailwind color/spacing/aspect/shadow tokens |
| `docs/DESIGN_SYSTEM.md` | This document |
