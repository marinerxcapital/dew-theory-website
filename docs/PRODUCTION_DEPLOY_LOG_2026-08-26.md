# Production deploy log — 2026-08-26

**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)  
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)  
**Repo:** `marinerxcapital/dew-theory-website`

## Deployed artifact

| Item | Value |
|---|---|
| Main deploy SHA | `4b69747e7ef2fdc65c54e108d57624946fb71269` |
| Commit | `feat: simplify Dew Theory site per owner feedback` |
| Cloudflare Worker version / deploy ID | `98313824-e97d-480a-ba84-059be65de309` |
| Deploy timestamp (UTC) | `2026-08-26T00:51:15.450Z` |
| Auth | Wrangler OAuth token for `skyler@marinerxcapital.com`; no secret values exposed |

## What Emily requested (translated from annotated iPhone screenshots)

- Make the homepage hero background sage green from the approved palette.
- Keep the two core conversion actions: `Shop Skin Script` and `Take the Skin Quiz`.
- Remove the `a calm monday` philosophy section.
- Remove the redundant free-shipping / Skin Script professional information panel.
- Remove the `let's debunk the worst advice going viral rn` editorial block (including the TikTok viral-caution card and `Start with a gentler read`).
- Remove the `what is PDRN?` educational card.
- Remove substantially all homepage content from the product area downward.
- Simplify the public primary menu to: Shop, Skin Quiz, Virtual Consult, Emily, Contact, FAQ.
- Stop presenting `Book a Facial` as a site-wide primary action.
- Collapse the mobile sticky CTA from `Book a facial | Shop` to a single full-width `Shop`.

## Exact sage token used

The hero now uses the established **sage** token `#93A890` (`--color-sage` / `sage.DEFAULT` / `dew-mid`) as its dominant background, with a subtle `#5B7356` (`--color-sage-deep`) radial accent at the top-right corner. Forest text (`#1E2B22`) sits on `#93A890`, matching the repository's approved `#1E2B22` on `#93A890` contrast pairing. No new palette value was introduced.

## Files changed

| File | Change |
|---|---|
| `app/page.jsx` | Removed philosophy, trust strip, reassurance band, myth-busting, PDRN, shop-by-concern, shop-by-type, quiz feature, routine builder, starter kits, services, virtual-consultation/Emily, and FAQ/membership homepage sections. Homepage now renders hero + Emily's Picks product rail only. Removed now-unused imports/data queries. |
| `components/Hero.jsx` | Removed the full-bleed product-photo plane (`next/image`, `HERO_IMAGE`, wash/caustic). Hero is now the sage stage with the dew canvas and the wordmark/rule/headline/lede/CTAs. |
| `app/globals.css` | Repointed `.hero-stage` to sage, removed the now-unused photo/wash/caustic rules and `hero-ken`/`hero-caustic` keyframes. |
| `components/Nav.jsx` | Simplified the shared `links` array to Shop, Skin Quiz, Virtual Consult, Emily, Contact, FAQ. Removed the mobile `Book a facial` append and the desktop `Book` link. |
| `components/CategoryNav.jsx` | Removed `Build a Routine`, `Facials`, and `Membership` from the desktop category rail. |
| `components/Footer.jsx` | Removed `Book a facial` from the footer CTA and the Services column. |
| `components/StickyCtaBar.jsx` | Rewrote the sticky bar as a single full-width `Shop` button with preserved safe-area handling. |

## Preserved (not deleted)

- Underlying routes `/routine`, `/services`, `/membership`, `/book`, `/virtual-consultation`, `/about`, `/contact`, `/faq`, `/quiz`, and `/shop/*` all remain live and indexable. They are still reachable via the footer and direct URLs.
- Cart, checkout, shipping, search, product catalog/data, booking API, analytics, and legal PDFs are untouched.
- Booking/Skin-Script service CTAs on dedicated pages (`/services`, `/about`, `/quiz`, `/faq`, `/membership`, `/book`) are unchanged.

## Verification results

| Check | Result | Evidence |
|---|---|---|
| `npm test` | PASS | 192 pass / 0 fail |
| `npm run build` | PASS | Next build succeeded; all routes generated |
| Homepage removed copy | PASS | `a calm monday`, `what is PDRN`, `worst advice`, `Book a facial`, and the other removed blocks are absent from generated `index.html` |
| Homepage kept copy | PASS | `Shop Skin Script`, `Take the Skin Quiz`, `Emily's picks`, `Shop all` present |
| Sage hero CSS | PASS | Compiled CSS contains `.hero-stage{background:...linear-gradient(165deg,#93A890,#93A890)}` |
| Apex root | PASS | `https://dewtheoryco.com` HTTP 200, removed copy absent, sage hero + CTAs present |
| www root | PASS | `https://www.dewtheoryco.com` HTTP 200, sage hero present, PDRN absent |
| Preserved routes | PASS | `/routine`, `/quiz`, `/shop/green-tea-citrus-cleanser`, `/studio`, `/services`, `/book`, `/membership` all HTTP 200 |
| Route/PDF smoke | PASS | `npm run smoke:routes -- https://dewtheoryco.com` returned `smoke-routes: all clear` |

## Notes

- The sandbox blocks local port binding, so browser-level interaction checks (menu open/close, sticky CTA tap) were validated via source inspection plus the production HTML/CSS readback rather than a live local Playwright session.
- The homepage was statically prerendered with `revalidate = 60`; production re-serves it from the Worker edge. The verified response already reflects the new build.
