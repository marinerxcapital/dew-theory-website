# Website optimization report — Dew Theory

**Date:** 2026-07-20  
**Scope:** Items 1–6 from the post-polish performance backlog  
**Environment:** `next build` + `next start` on localhost:3456, Lighthouse 13.4.0 (Chrome headless)

---

## Summary

| # | Workstream | Status |
|---|------------|--------|
| 1 | Lighthouse / Core Web Vitals baseline | **Done** — reports in `docs/lighthouse/` |
| 2 | `next/image` pipeline (logos, hero poster, products) | **Done** |
| 3 | `next.config.mjs` images, compress, security + cache headers | **Done** |
| 4 | Shop caching: ISR 60s + admin `revalidatePath` | **Done** |
| 5 | Product image path + brand abstract placeholders | **Done** — Skin Script studio photos installed 2026-07-24 |
| 6 | Edge/CDN OpenNext (R2 + DO queue + D1 tag cache) | **Done config**; CF resources need `wrangler login` |

**Gates:** `npm test` **113 pass** · `npm run build` **OK** · home/shop/PDP **HTTP 200** under `next start`

---

## 1. Lighthouse / Core Web Vitals

Audited mobile simulation (Lighthouse default) against production server.

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | SI |
|------|------|------|----------------|-----|-----|-----|-----|-----|-----|
| `/` home | **60** | 96 | 100 | 100 | 1.4s | **4.0s** | **1.4s** | 0.009 | 3.9s |
| `/shop` | **58** | 95 | 100 | 100 | 1.7s | **3.9s** | **2.2s** | 0.001 | 3.3s |
| `/shop/mandelic-…` PDP | **88** | 96 | 100 | 100 | 1.7s | **2.9s** | 0.3s | 0 | 1.8s |

### Rating notes

- **CLS:** good on all three (layout stable after image/placeholder dimensions).
- **LCP:** home/shop need improvement (hero video + large client hydration); PDP near “good” threshold.
- **TBT:** primary perf drag on home/shop — main-thread JS (CartProvider, Nav, GSAP after dynamic import still parses, ShopGrid client filter, fonts).
- **SEO / BP / A11y:** strong; small a11y headroom remains.

### Artifact files

- `docs/lighthouse/home.report.html` (+ `.json`)
- `docs/lighthouse/shop.report.html` (+ `.json`)
- `docs/lighthouse/pdp.report.html` (+ `.json`)

Re-run (server on :3456):

```bash
npm run build && npm run start -- -p 3456
npx lighthouse http://localhost:3456/ --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=docs/lighthouse/home
```

---

## 2. `next/image` pipeline

| Surface | Change |
|---------|--------|
| `components/Wordmark.jsx` | `next/image` + `onError` text fallback; optional `priority` |
| `components/Hero.jsx` | Poster via `next/image` (`fill`, `priority`); **single** background video; side column poster-only |
| `components/ProductImage.jsx` | New: fill + sizes, iridescent underlay, SVG/`unoptimized` for placeholders & remote URLs |
| `components/ProductCard.jsx` | Uses `ProductImage` |
| PDP + home featured | Use `ProductImage` / `productImageSrc` for OG where product-specific |
| `components/MotionRoot.jsx` | Dynamic `import('gsap')` + ScrollTrigger (cuts eager main-bundle GSAP) |

---

## 3. `next.config.mjs`

- `images.formats`: AVIF + WebP  
- `deviceSizes` / `imageSizes` / `minimumCacheTTL` (30d)  
- `compress: true`, `poweredByHeader: false`  
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`  
- Cache-Control for `/_next/static` and static media extensions  

Note: on Cloudflare Static Assets, `public/_headers` is authoritative for public files (worker does not sit in front of them). See OpenNext caching docs.

---

## 4. Shop / catalog caching

| Before | After |
|--------|--------|
| `force-dynamic` on `/shop` and `/shop/[id]` | `export const revalidate = 60` |
| Home featured from seed `featured()` only | `getFeaturedProducts()` from runtime store + `revalidate = 60` |
| Admin writes never invalidated HTML | `revalidateProductSurfaces()` after create/update/delete/import |

**Helper:** `lib/revalidate-storefront.js`  
**Wired in:** `app/api/admin/products/*`, `app/api/admin/import`  

**Build evidence:** routes show `Revalidate 1m` for `/`, `/shop`, `/shop/[id]`.

Max staleness without admin action: ~60s. After admin mutation: path revalidation on Node/`next start`; on Cloudflare once Phase B bindings exist (see below).

Checkout still re-prices from live `getProducts()` every request.

---

## 5. Product images (placeholders + ready path)

- Schema: `images: string[]` (max 8) in `product-admin`, `SCHEMA.md`, seed JSON  
- Admin: optional primary image URL on `ProductForm`  
- Empty `images` → category SVG under `public/products/placeholders/` (abstract ice/lavender/blush glass — **not** Skin Script bottle photos)  
- Helper: `lib/product-image.js` → `productImageSrc`  

**Still open (business):** real product photography, studio photos, Emily photo — see `OPEN_ITEMS.md`.

---

## 6. Edge / CDN (OpenNext Cloudflare)

| Component | Binding / config |
|-----------|------------------|
| R2 incremental cache | `NEXT_INC_CACHE_R2_BUCKET` → bucket `dew-theory-opennext-cache` |
| DO revalidation queue | `NEXT_CACHE_DO_QUEUE` / `DOQueueHandler` + migration `v1` |
| D1 tag cache | `NEXT_TAG_CACHE_D1` → `dew-theory-tag-cache` (placeholder `database_id`) |
| Static asset headers | `public/_headers` |

**Code:** `open-next.config.ts`, `wrangler.jsonc`  
**Ops guide:** [`docs/EDGE_CACHE.md`](./EDGE_CACHE.md)

**Not done in this environment (needs your Cloudflare login):**

```bash
npx wrangler login
npx wrangler r2 bucket create dew-theory-opennext-cache
npx wrangler d1 create dew-theory-tag-cache
# paste database_id into wrangler.jsonc
npm run deploy
```

Local `next start` already benefits from ISR + path revalidation without CF resources.

---

## Bundle / route size (production build)

Shared First Load JS ≈ **103 kB**. Notable storefront routes:

| Route | Size | First Load JS | Cache |
|-------|------|---------------|-------|
| `/` | 2.47 kB | 114 kB | ISR 1m |
| `/shop` | 6.88 kB | 118 kB | ISR 1m |
| `/shop/[id]` | 1.47 kB | 118 kB | ISR 1m |

---

## Remaining performance opportunities (not blocking this pass)

1. **Main-thread JS / TBT** — largest Lighthouse hit; consider lighter cart context on non-shop pages, further code-split, reduce client Nav/Footer surface.
2. **Hero video LCP** — portrait `hero.mp4` (848×1072, ~20s ping-pong loop, silent, ~1.4 MB as of 2026-07-21 refresh) still competes with LCP; poster-first + reduced-motion still-image path is already in `Hero.jsx`.
3. **Real product WebP/AVIF photography** — will improve shop/home visual quality; keep `images[]` + `next/image`.
4. **Provision CF R2/D1** so production Workers ISR + `revalidatePath` persist (see EDGE_CACHE.md).
5. **Durable product store on Workers** — file/`memory` store is not multi-isolate durable; Supabase/R2/D1 still required for production admin edits.

---

## Definition of done (this pass)

- [x] Lighthouse scores recorded for home, shop, PDP  
- [x] `next/image` on logos, posters, product surfaces  
- [x] next.config image + header hardening  
- [x] ISR + admin revalidation replaces force-dynamic shop  
- [x] Product image field + placeholders + admin URL  
- [x] OpenNext edge cache config + docs  
- [x] Tests green, build green  
- [x] Memory files updated (`POLISH_*`, `OPEN_ITEMS`, `README`, this report)

---

## Engineering pass 2026-07-25

**Scope:** Main-thread / media paint cost on storefront only. No copy, prices, auth, or Stripe changes.

| File | Change |
|------|--------|
| `components/MotionBackground.jsx` | Poster-first via `next/image`. Video mounts only when `!prefers-reduced-motion` and (home `/` **or** not data-saver/slow-2g/2g). Non-home: idle-defer video (`requestIdleCallback` / 2s timeout), `preload="none"`. Home: immediate mount, `preload="metadata"`. Admin still skipped. Poster Image until video `canplay` (opacity fade already in CSS). |
| `components/AmbientField.jsx` | Quiet orbs (no large circular orbs; mesh + linear wash kept) also on `/cart`, `/book`, `/virtual-consultation*` in addition to `/services`. |
| `components/Hero.jsx` | No code change — already content + vignette + portrait poster only; no second `hero.mp4`. |
| `app/globals.css` | Untouched — existing `.motion-bg__video` opacity transition covers poster → video. |

**Expected impact:** lower TBT/network on non-home and constrained connections; less paint on conversion paths from fewer blurred orbs.

**Risks:** brief still poster on non-home before idle video; Safari without Network Information API never treated as constrained (safe default = allow deferred video); home still loads video on slow links by design (home OR clause).
