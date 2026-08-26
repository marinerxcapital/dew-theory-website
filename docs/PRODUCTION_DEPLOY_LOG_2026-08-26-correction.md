# Production deploy log — 2026-08-26 (owner-removal correction)

**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)
**Repo:** `marinerxcapital/dew-theory-website`

## Deployed artifact

| Item | Value |
|---|---|
| Starting SHA | `13fd6cce7a16e8f9c8c3a9e7e8cb13ff974172df` |
| Correction commit SHA | `32e22dbe739861e6781ec32dbb9448cb76323c91` |
| Commit message | `fix: complete Dew Theory owner-requested removals` |
| Cloudflare Worker version / deploy ID | `f9322bb9-7560-4e1e-8058-219bf663c5d1` |
| Deploy timestamp (UTC) | `2026-08-26T02:3x:xxZ` |
| Auth | Wrangler OAuth token for `skyler@marinerxcapital.com`; no secret values exposed |

## Root cause of the previous miss

The prior run (`4b69747`, Worker `98313824-e97d-480a-ba84-059be65de309`) interpreted
"remove" too narrowly: it removed Routine/Services/Membership/Book a Facial from the
primary navigation and sticky CTA but left the same offerings publicly reachable through:

- the footer (`Routine builder` / `Services` / `Membership` links),
- the global search index (`/routine`, `/services`, `/book`, `/membership` entries plus the `SERVICES` loop),
- `app/sitemap.js` (all four removed routes still listed),
- internal cross-links across shop/PDP/quiz/about/FAQ/cart/confirmation/404/legal pages,
- the live routes themselves, which all returned HTTP 200.

## What this correction changed

| Area | Change |
|---|---|
| Routes | Deleted `app/routine/page.jsx`, `app/services/page.jsx`, `app/membership/page.jsx`, `app/book/page.jsx` so the four paths return the application 404. |
| Footer | Removed `Routine builder`, the `Services` column, and `Membership`; moved `Virtual consultation` into `Dew Theory`; reduced grid to 4 columns; removed "in-studio facials" tagline. |
| Search | Removed removed-route static pages and the `SERVICES` loop from `lib/search.js`. |
| Sitemap | Removed `/routine`, `/services`, `/book`, `/membership` from `app/sitemap.js`. |
| Cross-links | Cleared removed-route links/CTAs from shop/PDP, quiz, about, FAQ, SkinQuiz, EmilyPairsWith, CartView, CartConfirmation, ContactForm, not-found, booking-policy/aesthetic-disclaimer, studio. |
| Metadata / JSON-LD | Removed "book facials / book treatments" from homepage + layout metadata; removed the `In-studio facial` offer (`/book`) from `BeautySalon` structured data. |
| Hero | Retained approved sage `#93A890`; lede no longer advertises "barrier-first facials". |
| Tests | Updated search regression test; added `tests/public-removals.test.mjs` (route files, nav/footer/sitemap strings, sticky CTA). |
| Smoke | Removed `/services`, `/book`, `/membership` from `scripts/smoke-routes.mjs`. |

## Verification results

| Check | Result |
|---|---|
| `npm test` | 196 pass / 0 fail |
| `npm run build` | success; 63 pages generated; removed routes absent from the route manifest |
| Homepage removed copy | absent (`a calm monday`, `worst advice`, `tiktok made me do it`, `what is PDRN`, trust-strip copy) |
| Homepage kept copy | present (`Shop Skin Script`, `Take the Skin Quiz`, `Emily's picks`, `Shop all`) |
| Sage hero CSS | `.hero-stage` uses `#93A890` |
| Removed routes live | `/routine`, `/services`, `/membership`, `/book` → 404 (with and without cache-busting) |
| Retained routes live | `/`, `/shop`, `/quiz`, `/virtual-consultation`, `/about`, `/contact`, `/faq`, `/cart`, product pages, legal pages → 200 |
| Sitemap | removed routes absent; products + legal present |
| Browser (mobile 390px) | menu = Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ + Shop-by-type; footer clean; sticky CTA = single `Shop` |
| Browser (desktop 1280px) | category nav has no Routine/Services/Membership/Facials/Book |

## Notes

- Browser verification was performed with headless Chromium against the live HTTPS domain (not localhost).
- Backend API routes (`/api/book`, `/api/membership/interest`, `/api/availability`) and the
  now-orphaned `RoutineBuilder` / `BookingFlow` / `MembershipInterestForm` components were left
  as archived source; they are no longer reachable from any public page.
- The removed page source remains recoverable from git history if Emily later asks to restore it.
