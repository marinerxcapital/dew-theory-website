# Production deploy log — 2026-08-29 (consultation + products only)

**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)
**Repo:** `marinerxcapital/dew-theory-website`

## Deployed artifact

| Item | Value |
|---|---|
| Starting SHA | `ff791c1b61db9f6e5c3bd500f8918a9c7f4172ad` |
| Implementation SHA | `415f0881275dbb856c332ebedd67289cb8241289` |
| Commit message | `feat: limit public site to consultation and products` |
| Cloudflare Worker version / deploy ID | `358e17e8-d038-4183-ba03-0d6b4a6ef554` |
| Deploy timestamp (UTC) | `2026-08-29` |
| Auth | Wrangler OAuth token for `skyler@marinerxcapital.com`; no secret values exposed |

## Owner directive

> Only consultation and products nothing else!

The public site is reduced to two offerings: **Products** (Shop) and **Virtual Consultation**.
Commerce (cart/checkout) and legal pages are retained as required infrastructure, not as additional offerings.

## Changes

| Area | Change |
|---|---|
| Routes | Deleted `app/quiz/page.jsx`, `app/about/page.jsx`, `app/contact/page.jsx`, `app/faq/page.jsx`, `app/studio/page.jsx`. |
| Redirect | `/studio` and `/studio/:path*` now 308-redirect to `/`. |
| Nav | Mobile primary menu = `Shop` + `Virtual Consult` (+ Shop-by-type). Removed Skin Quiz / Emily / Contact / FAQ. |
| Category nav | Desktop rail = Shop + product categories + Virtual Consult. Removed Skin Quiz and Emily. |
| Footer | Brand block + `Shop` + `Help` (legal). Removed Skin Quiz, About Emily, Contact, FAQ, Order support; added `Virtual consultation` link in brand block. |
| Hero | Secondary CTA changed from `Take the Skin Quiz` to `Virtual Consultation`; lede updated. |
| Shop / PDP / cart | Replaced quiz CTAs with virtual-consultation CTAs; removed `Find my routine` and quiz guidance links. |
| Search | Removed Skin Quiz, About Emily, Contact, FAQ from `lib/search.js`. |
| Sitemap | Removed `/quiz`, `/about`, `/contact`, `/faq`. |
| Legal + consultation | Replaced `/contact` links with `mailto:hello@dewtheory.studio` where support is legally required. |
| Emails | Removed `/book` and `/contact` URLs; use `hello@dewtheory.studio`. |
| Tests | Extended public-removals and search tests for the full removed-route set. |
| Smoke | Removed `/about`, `/contact`, `/faq` from `scripts/smoke-routes.mjs`. |

## Verification

| Check | Result |
|---|---|
| `npm test` | 196 pass / 0 fail |
| `npm run build` | success; removed routes absent from the route manifest |
| Sitemap | removed routes absent; `/shop`, `/virtual-consultation`, `/cart`, legal present |
| Removed routes live | `/quiz` `/about` `/contact` `/faq` `/routine` `/services` `/membership` `/book` → 404; `/studio` → 308 |
| Retained routes live | `/`, `/shop`, product pages, `/virtual-consultation`, `/cart`, legal → 200 |
| Homepage | `Shop Skin Script` + `Virtual Consultation` + `Emily's picks` present; quiz/about/contact/faq copy absent |
| Browser (mobile) | menu = Shop + Virtual Consult + Shop-by-type; footer = Shop + Help + Virtual consultation |
| Browser (desktop) | category nav = Shop / categories / Virtual Consult |

## Notes

- Orphaned components (`SkinQuiz`, `RoutineBuilder`, `BookingFlow`, `ContactForm`, `MembershipInterestForm`,
  `Accordion`, `AddRoutineKit`) and backend API routes remain as archived source; they are no longer reachable
  from any public page.
- `lib/skin-quiz.js` is retained because `EmilyPairsWith.jsx` still uses `emilyPairsWith` for product sequencing
  (a product feature, not a quiz offering).
