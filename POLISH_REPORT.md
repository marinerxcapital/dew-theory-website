# Overnight Polish Report — Dew Theory

> **2026-08-16 — production deploy note.** The 2026-08 Sephora-inspired redesign (PR #1), FIXED V2
> legal PDFs (PR #5), and full-bleed landing hero motion (PR #6) are merged and deployed to
> `https://dewtheoryco.com`. Deployed main SHA `1e56d6c96d0075811e806af952673e1d6a09e4ba`,
> Worker `dew-theory` version `e6bc265f-97d8-4518-a96b-6f37a0983bca`. See
> `docs/PRODUCTION_DEPLOY_LOG_2026-08-16.md`. This report is historical (2026-07-19).

**Date:** 2026-07-19  
**Mode:** Autonomous polish loop (`/loop`)  
**Result:** Queue A1–N4 complete

---

## Summary

Engineering polish pass over the full storefront + admin portal. No business facts were invented; unresolved client decisions remain in `OPEN_ITEMS.md`. Skin Script was not scraped (CSV import only). Git commits are local only.

### Gate results

| Check | Result |
|-------|--------|
| `npm test` | **113 pass**, 0 fail |
| `npm run build` | **OK** — Next.js 15.5.20, 44 routes |
| `npm run smoke:routes` | **OK** — `/` `/shop` `/cart` `/book` `/admin/login` `/services` `/contact` → 200 |
| Checkout mock path | **OK** under `next start` |
| Admin login under `next start` | **Expected 401** with default password (production rejects defaults). Use non-default `ADMIN_*` env for production smoke of admin mutations. `npm run dev` accepts local defaults. |

---

## Manual QA checklist

| Area | Pass/Fail | Notes |
|------|-----------|--------|
| Home / brand motion | pass | Hero, reduced-motion path present |
| Shop browse | pass | force-dynamic store; inactive/discontinued hidden |
| PDP / cart | pass | variant required; re-price server-side |
| Checkout mock | pass | smoke created order + free ship / promo math |
| Book flow | pass | availability API + mock fallback; double-book guard |
| Admin login (dev) | pass | defaults + middleware gate |
| Admin products | pass | CRUD, retail ×2, stock/active toggles |
| Admin orders | pass | status filters; Skin Script mark (manual) |
| Admin appointments | pass | confirmed → terminal only |
| Admin discounts | pass | create/edit/deactivate; redemptions + referrer |
| CSV import | pass | dry-run + sample-import.csv |
| Analytics | pass | date range; empty states; no hard-coded fake KPIs |
| SEO | pass | robots, sitemap, not-found, route metadata |
| Security | pass | prod default password rejected; origin checks; rate limit |

---

## Major work by section

### A–C Foundation / design / motion
Already completed earlier in the loop: deps, admin middleware, tokens, type, glass, a11y, GSAP lifecycle, reduced-motion.

### D–E Storefront + commerce
Shop store integration, cart, booking UX, checkout validation, shipping/discount tests, Stripe webhook stub, order-path docs.

### F Booking backend
- **F1** Validation + slot uniqueness  
- **F2** `lib/availability.js` adapters + `/api/availability`  
- **F3** Appointment status machine  

### G Admin
Auth policy, products CRUD, order filters + `submitted_to_skin_script`, discounts UI, CSV dry-run, analytics range, UX consistency.

### H Data layer
Atomic store writes, corrupt recovery, `data/SCHEMA.md`, adapter seam notes, dynamic shop.

### I–J Observability / SEO
Events API, structured log helper, robots/sitemap/404.

### K–M Performance / tests / docs
next/font + poster path, `npm test` / smoke scripts, README + ENV + OPEN_ITEMS hygiene.

### O Performance optimization pass (2026-07-20)

Full write-up: **`docs/OPTIMIZATION_REPORT.md`**. Highlights:

| Item | Result |
|------|--------|
| O1 Lighthouse | Home perf 60 · Shop 58 · PDP 88; A11y 95–96; BP/SEO 100. Artifacts in `docs/lighthouse/` |
| O2 next/image | Wordmark, hero poster, ProductCard/PDP/home via `ProductImage`; one hero video |
| O3 next.config | AVIF/WebP, compress, security + static cache headers |
| O4 ISR | `revalidate = 60` on `/`, `/shop`, `/shop/[id]`; admin `revalidateProductSurfaces` |
| O5 Product media | `images[]` + category SVG placeholders (not real bottle photos) |
| O6 Edge | OpenNext R2 + DO queue + D1 tag cache in config; provision via `docs/EDGE_CACHE.md` |
| P1 Hero media | New motion cut installed 2026-07-21: `generated_video (1).mp4` → `hero-original.mp4`; web `hero.mp4` ~20s ping-pong silent H.264; fresh `hero-poster.webp` |

Gates after O-pass: **113 tests pass**, production build OK (ISR 1m on catalog routes).

---

## Still open (business — not engineering)

See `OPEN_ITEMS.md`, including:

- Confirm SPF retail if not wholesale×2  
- Real launch promo % / referral economics  
- Studio hours, deposit %, cancellation policy  
- Google Calendar OAuth for live availability  
- Supabase swap when project keys land  
- Shipping threshold pre- vs post-discount client call  
- Emily portrait / studio photos  
- Final privacy/returns legal language (scaffolds live)  
- Stripe / Resend / VC Price ID / Zoom scheduler secrets  

---

## Engineering pass 2026-07-25 (5 parallel agents → main)

| Workstream | Outcome |
|---|---|
| Perf | Poster-first motion; idle-defer video off-home; quiet ambient on cart/book/VC/services |
| SEO | `metadataBase` → dewtheoryco.com; product sitemap; tighter robots |
| Policies | `/privacy` `/shipping` `/returns` + footer; honest scaffolds |
| Trust UI | Cart/booking/VC/contact trust strips + error recovery |
| Photos + debt | R2/FS/memory photo storage; ENV dedupe; photo unit tests |

Production: **https://dewtheoryco.com** (Worker `dew-theory`). Business facts still unconfirmed stay in OPEN_ITEMS — none invented this pass.

---

## How to run after this pass

```bash
npm install
npm test
npm run build
npm run dev          # admin defaults: admin@dewtheory.local / dew-admin-dev
# production:
# set ADMIN_EMAIL, ADMIN_PASSWORD (≠ dew-admin-dev), ADMIN_SESSION_SECRET
npm run start
npm run smoke:routes
npm run deploy       # OpenNext → Cloudflare (dewtheoryco.com)
```

CSV: `/admin/import` + `data/sample-import.csv`.

Optional private photo R2:

```bash
npx wrangler r2 bucket create dew-theory-consultation-photos
```

---

## Commits (this session tail)

Local `master` includes sequential `polish F2` … `polish G4` and a final overnight pass commit covering G5–N4.

**2026-07-25:** Autonomous engineering pass (perf/SEO/policies/trust/photos) + memory file refresh; pushed to `main`.

---

## 2026-07-30 — Noise Shimmer hero background

| Item | Detail |
|------|--------|
| Task | Replace homepage hero decorative plane with AIDesigner **Noise Shimmer** |
| Effect | `noise-shimmer` |
| Colors | `#6f7cff,#ff4fa3,#4fe3d1` · bg `#7f84b8` |
| Params | scale `1.66`, shimmer `0.52`, intensity `0.24`, contrast `0.55`, speed `1.37` |
| Files | `components/Hero.jsx`, `app/layout.jsx` (runtime Script once), `app/globals.css` (fallback + reduced-motion) |
| Fallback | `.noise-shimmer-fallback` radial gradients (same palette) |
| CSP | No CSP in project — no change |
| Tests | `npm test` **148 pass**; `npm run build` **pass**; no lint/typecheck scripts |
| Commit | `3eeadca00a2e7cd614d170445f603ca944a5334a` — `feat(home): add vibrant Noise Shimmer hero background` |
| Branch | local `master` → remote `main` (`origin/main` @ marinerxcapital/dew-theory-website) |
| Provider | Cloudflare Workers via OpenNext (`npm run deploy`) · Worker `dew-theory` |
| Deploy ID | Worker Version `527da30c-e938-463c-b3d8-0d6eb8c527dc` · workers.dev + custom domains |
| Live | https://dewtheoryco.com — **verified 2026-07-30** (HTTP 200) |
| Live checks | `data-aifx="noise-shimmer"` + full color/params attrs; CDN `cdn.aidesigner.ai/effects/runtime/v1.js`; `.noise-shimmer-fallback`; CTAs "Book a facial" / "Shop the collection"; brand copy intact |
| Docs | `docs/MOTION_BACKGROUND.md`, this file, `POLISH_PROGRESS.md` V1 |

Homepage content, nav, CTAs, and sections preserved. Runtime loads once via `next/script` `id="aidesigner-effects-runtime"`.

---

## 2026-07-30 — Header logo contrast (Noise Shimmer)

| Item | Detail |
|------|--------|
| Task | Improve iridescent “dew theory” logo visibility over Noise Shimmer without changing artwork |
| Asset | `/logo-mark.webp` — **unchanged** (full opacity, no recolor/redraw) |
| Treatment | `.nav-logo::before` feathered radial halo `rgba(32, 27, 42, 0.06–0.30)` + blur; img `drop-shadow` tight + wide soft lift; light contrast/saturate only on filter |
| Frosted nav | Halo opacity 0.5 so pearl glass doesn’t double-darken |
| Files | `app/globals.css`, `components/Nav.jsx` (removed weak Tailwind drop-shadow; CSS owns legibility) |
| Lint / typecheck | N/A (not configured) |
| Tests | `npm test` **148 pass**; `npm run build` **pass** |
| Commit | `904ffc6` — `fix(nav): improve logo contrast over Noise Shimmer` |
| Deploy | Cloudflare Worker `dew-theory` version `a53c3568-c230-448d-97d3-44f69b78eb70` |
| Live | https://dewtheoryco.com — logo-mark + `.nav-logo` halo/drop-shadow CSS verified on production CSS bundle |

---

## 2026-07-31 — Full non-Stripe product completion pass

| Area | Status |
|------|--------|
| Google Calendar | freebusy + event create in `lib/availability.js`; env-gated; mock fallback |
| Email | `lib/email.js` + booking/order/VC/membership; admin `/admin/emails` |
| Admin 2FA | TOTP via `lib/totp.js` when `ADMIN_TOTP_SECRET` set |
| Conversion | Home sticky CTA; starter kits (`lib/routine-kits.js`); post-book/post-order prep |
| Membership | Live `/membership` + `POST /api/membership/interest`; no fake prices |
| Analytics | 7-day first-party weekly strip |
| Perf | AIDesigner runtime homepage-only |
| Stripe | **Not connected** (owner); mock checkout + full Stripe code path remain |
| Tests | **164 pass** |
| Build | **pass** (membership + membership interest routes) |
| Commit | `30a8a8d` — `feat: complete non-Stripe product paths for production readiness` |
| Deploy | Cloudflare Worker `dew-theory` version **`de081377-4005-4270-84d9-d28df73e6d81`** |
| Live | dewtheoryco.com — home kits, membership page, book/services/shop 200 |
| Remaining owner secrets | `STRIPE_*`, optional `GOOGLE_CALENDAR_*`, `RESEND_*`, `ADMIN_TOTP_SECRET`, Emily menu/prices |
