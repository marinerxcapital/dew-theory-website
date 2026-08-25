# Sephora-inspired storefront redesign — historical record

> **Superseded for brand colors (2026-08-25).** Current brand SoT is
> `DEW-THEORY-CURRENT-STATUS.md` (forest `#1E2B22` / sage-deep `#5B7356` / sage `#93A890` /
> ivory `#EDEDE6` / stone `#C9C4B8`). This document remains as chronology for PR #1.

**Date:** 2026-08-15  
**Branch:** merged via PR #1 → `main`  
**Final main SHA:** `1e56d6c96d0075811e806af952673e1d6a09e4ba` (2026-08-16, post legal PDFs + hero motion)  
**PR:** https://github.com/marinerxcapital/dew-theory-website/pull/1 (MERGED)  
**Canonical repo:** `marinerxcapital/dew-theory-website`  
**Production:** https://dewtheoryco.com (Cloudflare Worker `dew-theory` via OpenNext)  
**Working tree:** clean on merged main  

### Production deploy status
- Redesign deployed live on `https://dewtheoryco.com` (+ `www`) on **2026-08-16**.
- Deployed main SHA: `1e56d6c96d0075811e806af952673e1d6a09e4ba`; Worker `dew-theory` version
  `e6bc265f-97d8-4518-a96b-6f37a0983bca`.
- Follow-on work also live: FIXED V2 legal PDFs (PR #5, merge `a5fef35`) and full-bleed
  landing hero motion (PR #6, merge `1e56d6c`).
- Full evidence: `docs/PRODUCTION_DEPLOY_LOG_2026-08-16.md`.
- **2026-08-25:** Editorial brand revamp pending deploy — see
  `DEW-THEORY-CODEX-PRODUCTION-DEPLOYMENT-HANDOFF.md`.

## Objective

Sephora-grade commerce UX discipline applied to Dew Theory — black/white retail shell, restrained promo red, Dew green guidance identity — without cloning Sephora assets or inventing business facts.

## Design tokens (final)

| Token | Value | Role |
|---|---|---|
| black | `#000000` | Category nav |
| ink / graphite | `#111111` | Structure, primary CTAs |
| charcoal | `#2A2A2A` | Body |
| muted / chrome | `#666666` | Secondary text |
| border | `#E2E2E2` | Hairlines |
| surface-light | `#F7F7F7` | Soft bands |
| white / pearl / surface | `#FFFFFF` | Ground |
| promo | `#D6001C` | Sparse promo/alert |
| dew | `#2F5D4A` | Guidance / services / quiz |
| dew-dark | `#183C30` | Dew hover |
| dew-soft / dew-surface | `#E8F0EB` / `#F3F7F4` | Editorial panels |

**Typography:** Bodoni Moda (display), Jost (labels), Karla (body) — unchanged licensed stack.

## Architecture notes

- **Search:** client-side `lib/search.js` indexing products, categories, services, guides, pages
- **PLP filters:** `lib/shop-filters.js` — type, concern, skin, AM/PM, sort; URL query state
- **Shell:** `AnnouncementBar`, `GlobalSearch`, `CategoryNav`, rebuilt `Nav` / `Footer`
- **Commerce:** Quick Add, ProductRail, upgraded ShopGrid / ProductCard / PDP / Bag
- **Membership:** interest list only (`membershipCheckoutEnabled()` false unless env prices)
- **Security:** admin middleware, Stripe server pricing, consultation tokenized intake unchanged

## Validation (measured)

- `npm test`: **182 pass / 0 fail** (includes new search + shop-filter suite)
- `npm run build`: **pass**

## Unresolved business inputs (unchanged — do not invent)

- Studio address
- Exact aesthetician board / license number
- Final service menu prices / durations (draft menu shown truthfully)
- Deposit % / cancellation hours (env-gated; honest public note when unset)
- Membership package prices / terms
- Sheer Protection SPF retail confirmation; lip treatment SKU structure
- Launch promo economics (no public DEW15 placeholder messaging)

## Deploy path

```bash
npm run deploy   # opennextjs-cloudflare build && deploy → Worker dew-theory
```

See `docs/DEPLOY_DEWTHEORYCO.md`.
