# OPEN_ITEMS.md — Dew Theory

Everything on this list is invented, assumed, or blocked. Nothing here is confirmed fact.
Resolve before launch.

---

## 0. Redesign status (2026-08-15 → 2026-08-25)

**Current brand SoT:** `DEW-THEORY-CURRENT-STATUS.md` (forest / sage / ivory / stone editorial system).

Sephora-inspired retail redesign (PR #1) was an earlier shell. The **2026-08-25** editorial
revamp lives on branch `cursor/brand-revamp-editorial-5502` — see
`DEW-THEORY-CODEX-PRODUCTION-DEPLOYMENT-HANDOFF.md` until merged + deployed.

Engineering complete for storefront UX brand remapping; business facts below remain unresolved.
Membership remains **interest-list only** (live `/membership` route — not a redirect).

**Production deploy blocker — PARTIAL.** Last live Worker deploy (2026-08-16) succeeded for
main SHA `1e56d6c` (legal PDFs + hero motion). The **editorial brand revamp is not yet live**
as of 2026-08-25 because Cursor Cloud lacked Cloudflare auth. Codex (or an authenticated agent)
must merge + `npm run deploy` and verify https://dewtheoryco.com.

Historical Sephora notes remain in `docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md` (superseded for
color tokens).

## 0b. FIXED V2 legal PDFs (2026-08-16)

Authoritative FIXED V2 legal PDFs wired under `public/legal/pdfs/` with registry in
`lib/legal-documents.js`. Public HTML routes: `/privacy`, `/terms`, `/shipping`,
`/returns`, `/booking-policy`, `/aesthetic-disclaimer`, `/cookies`, `/accessibility`.
Internal attorney PDFs stay in `legal/internal/` (not web-served). Consumer Health
Data remains CONDITIONAL (`CONSUMER_HEALTH_POLICY_PUBLISHED = false`). Membership
terms are PRE_LAUNCH. See `docs/CODEX_LEGAL_PDFS_DEPLOY_HANDOFF.md` for live deploy.

**Status: DEPLOYED LIVE 2026-08-16.** All 8 public legal HTML routes return 200 and the
FIXED V2 PDFs serve `application/pdf` on `https://dewtheoryco.com`. Privacy + Terms PDFs
SHA256-match the local `public/legal/pdfs/` originals (full logo, not cropped). Footer Help
contains only the 8 public policies; internal/CONDITIONAL/PRE_LAUNCH docs are absent from nav.

## 0c. Landing hero motion (PR #6, deployed 2026-08-16)

Full-bleed dew-motion landing hero merged via PR #6 (`1e56d6c`) and deployed live. Brand-first
`dew theory` lockup, full-bleed serum product plane, canvas dew particles, ken-burns + caustic
light, and a lean Shop Skin Script / Take the Skin Quiz CTA pair. `prefers-reduced-motion` is
respected (canvas short-circuits; caustic/dew hidden under reduce). See
`docs/LANDING_HERO_MOTION_2026-08.md`.

---

## 1. Resolved this pass (were open, now confirmed)

- **Shipping.** $7 flat rate, waived at $49+ subtotal — confirmed business rule, now in
  `DEW_THEORY_BUILD_PROMPT_ADDENDUM.md` Section 5A and the `Orders` schema.
- **Markup formula.** Retail = wholesale × 2, confirmed against 7 of 8 client-supplied product pairs.
  Applied to the 8th (see below) by the same formula since none was given.
- **Product catalog.** All eight products are real, categorized per the client's own instructions
  (`data/products.json`), with ingredients and usage researched from Skin Script's own product pages
  and authorized retailers — not invented. Emily should still read through it; manufacturers revise
  formulas periodically.
- **Customer-facing pages.** Shop, Product Detail, Cart/Checkout, About, Services, Book, Contact,
  and **Virtual Consultation** are live storefront routes. Studio + Membership public nav items
  removed (permanent redirects to About / Services). Admin portal, analytics, CSV import, and
  **admin consultations** built.
- **Cart + shipping math.** Client cart (localStorage) + server re-price; `$7` / free at `$49+`
  pre-discount subtotal via `SHIPPING_THRESHOLD_BASIS` in `lib/shipping.js`.
- **Launch promo mechanism.** `DEW15` (15% placeholder value) seeded in store; percentage is
  admin-editable — not a confirmed client number.
- **Admin gate.** `/admin/*` requires httpOnly session cookie + row in `Admins` (local file store
  until Supabase Auth). Dev credentials: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults in `ENV.md`).
- **Overnight polish (engineering).** Availability adapter, appointment/order status machines, CSV
  dry-run, atomic store writes, robots/sitemap/404, funnel events, unit tests — see `POLISH_PROGRESS.md`.
  Unresolved *business* decisions remain below; nothing was invented to close them.

---

## 2. New — from the pricing/catalog pass

- **Sheer Protection SPF has no retail price in the source document.** Every other product listed
  one; this is the only gap. Computed at $30 (2× the $15 wholesale) to match the confirmed pattern —
  not a given figure. Confirm before publishing.
- **Discount code specifics are unset.** The client asked for "some sort of discount for the launch
  or some sort of referral code" without specifying a percentage/amount, or whether referral codes pay
  out anything to the referrer. The mechanism is designed (Stripe Promotion Codes + admin UI) but the
  numbers are admin-configurable — needs the client's input before the first code goes live. Seeded
  `DEW15` at 15% is a **placeholder only**.
- **Shipping threshold basis.** Recommended default is to compare the $49 free-shipping threshold
  against the pre-discount subtotal (`SHIPPING_THRESHOLD_BASIS = 'pre_discount'`). Not a confirmed
  decision — one-line change if client wants post-discount.
- **Lip Treatment is two SKUs in Skin Script's real catalog** (Peppermint and Pomegranate, same price),
  but the client's product list gave one wholesale/retail pair. Modeled as one product with a required
  scent variant. Confirm this matches how the client wants to sell it.
- **Botanical Bloom Hydrating Mask size** wasn't given; retailers list 2 oz. Placeholder, flagged in
  `data/products.json`.
- **Sheer Protection SPF formula conflict.** Catalog uses majority/manufacturer zinc-oxide version.

---

## 3. Business facts still invented (unrelated to the product catalog)

Prose on About / Services / Studio / Membership / Contact was polished for brand voice in
polish pass **D5** — elevated and minimal, not salesy. **Facts below remain unconfirmed.**

| Location | What was invented |
|---|---|
| `app/page.jsx` → Emily band | Home Emily blurb still draft (About page copy is Emily-approved 2026-07) |
| `app/page.jsx` → Thesis section | The brand thesis sentence |
| `lib/services.js` + Services/Book/Home | All service names, durations, and prices — still needs Emily's actual menu |
| `components/Footer.jsx` | The one-line brand descriptor |
| `app/studio/page.jsx` | Working hours (Mon–Sat); address intentionally "pending" (route redirects; content kept) |
| `app/contact/page.jsx` | `hello@dewtheory.studio` email — domain not confirmed |
| About credentials block | License board/number not provided |
| Membership page | Live `/membership` interest list + package shells; prices null until `MEMBERSHIP_PACKAGES_JSON` |
| Virtual consultation price/duration | From Stripe Price ID / env only — never hardcode; set before live sell |

---

## 4. Unresolved decisions (carried over)

- **Stripe live billing** — owner connects `STRIPE_*` keys + webhook + VC Price ID. Code fully wired; mock checkout without keys.
- Studio name and address.
- Deposit percentage and cancellation cutoff — **UI/env wired** (`BOOKING_DEPOSIT_PERCENT`, `BOOKING_CANCEL_HOURS`); Emily must set values.
- Membership **terms/prices** — structure + interest API live; Emily sets `MEMBERSHIP_PACKAGES_JSON` price_cents to sell.
- Domain name — **production uses dewtheoryco.com** (Cloudflare Worker); confirm as canonical brand domain.
- **Virtual consultation go-live checklist (owner actions):**
  1. Create Stripe Product/Price → `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`
  2. Webhook `https://dewtheoryco.com/api/webhooks/stripe` includes consultation metadata sessions
  3. Scheduler URL that mints unique Zoom meetings → `CONSULTATION_SCHEDULING_URL`
  4. Drop `RESEND_API_KEY` + verified `EMAIL_FROM` (code sends; without key emails log to store)
  5. Optional R2 private bucket for consultation photos
- **Skin Script live sync.** No confirmed API. CSV/manual + mock adapters live. Partner questions unchanged in `docs/SKIN_SCRIPT_SYNC.md`.
- **Visitor analytics provider** — first-party weekly funnel in admin is live; optional third-party later.
- **Admin 2FA** — **implemented** via `ADMIN_TOTP_SECRET` (base32 TOTP); optional until secret set.
- **Google Calendar** — **freebusy + event create implemented**; set `GOOGLE_CALENDAR_*` to go live (mock fallback if unset or API fails).
- Supabase project keys (file store still default until owner provisions).
- Emily portrait / studio photography still pending (honest “portrait pending” slots).

---

## 5. Assets (carried over)

- **The hero video is portrait, 848 × 1072 (not 16:9).** Full-bleed `object-cover` motion
  background + portrait glass column (poster still). Source refreshed 2026-07-21 from
  `generated_video (1).mp4`; web path is ping-pong-extended silent `hero.mp4` (~20s) +
  `hero-poster.webp` via `next/image`. Original brief’s 16:9 landscape still not used.
  **2026-07-24:** Sitewide `MotionBackground`. **2026-07-25 eng:** poster-first; home plays
  video promptly; non-home defers video until idle (or skips on data-saver/2g); reduced-motion
  stays poster-only. Ambient orbs quiet on `/services`, `/cart`, `/book`, `/virtual-consultation*`.
  **2026-07-30:** Home hero adds AIDesigner **Noise Shimmer**. **2026-07-31:** Runtime
  path-gated to homepage only (`AidesignerRuntime`); logo contrast halo shipped earlier.
- **Skin Script product photography — INSTALLED 2026-07-24.** All eight catalog products use
  studio assets at `/images/products/skin-script/`. **Still missing (Emily/owner):** portrait,
  studio photography, lifestyle/in-use shots.
- **Lighthouse local baseline (2026-07-20):** home perf ~60, shop ~58, PDP ~88. Engineering
  motion/ambient pass 2026-07-25 aims at TBT/LCP media cost — re-measure after deploy.
  See `docs/OPTIMIZATION_REPORT.md`.

---

## 5b. Engineering closed 2026-07-25 (no owner/Emily required)

| Item | Status |
|---|---|
| Perf: poster-first MotionBackground + quiet ambient on conversion routes | Done |
| SEO: production `metadataBase` default dewtheoryco.com; OG dimensions | Done |
| Sitemap: static storefront + policy pages + shop-visible products | Done |
| Robots: disallow admin/api/private consultation token routes | Done |
| Policy scaffolds: `/privacy`, `/shipping`, `/returns` + footer links | Done (honest; final legal still Emily) |
| Trust UI: cart/booking/VC checkout/contact error + trust strips | Done |
| Consultation photos: R2 → FS → memory fallback (`CONSULTATION_PHOTOS_R2`) | Done (bucket create ops-optional) |
| Services mobile circular glow artifact | Done earlier |
| Light pearl nav restored (not dark graphite) | Done earlier |
| Production deploy dewtheoryco.com | Done earlier this session |
| GitHub push | Active remote `marinerxcapital/dew-theory-website` |

---

## 6. Blocked on access / owner secrets

- **Live Stripe / Supabase / Google Calendar keys** — env drop-in (see `ENV.md`).
- **Cloudflare edge cache** — R2 ISR + D1 tag cache already used in production deploy path;
  optional private photo bucket `dew-theory-consultation-photos` (see `docs/DEPLOY_DEWTHEORYCO.md`).
- **Skin Script live credentials.** Adapters ready; use `SKIN_SCRIPT_MODE=mock` + CSV until partner answers.
- **Skin Script RPA production (2026-08-31).** Architecture + 220 Node tests + 12 Python E2E tests on `cursor/skin-script-rpa-fulfillment-5261`; original PR #8 is already merged from older head `1056dba`, and replacement draft PR #9 carries post-merge RPA session work + Codex TASK-01. TASK-01 remote D1 is complete: `dew-theory-commerce` / `cd55d01f-2c27-4b53-a8aa-9b10555d3b17`, Worker version `30e07650-5d65-4ee1-a4fc-c7f0edf005ae`, production D1 order/job readback passed. Remaining blockers: portal recon, verified mappings, MFA session bootstrap, RPA container host/secrets, real portal dry-run/live validation, and PR #9 merge approval.
- **xAI assist optional.** `XAI_API_KEY` for messy feed mapping only.
- **Admin production secrets** must remain non-default on Worker.

---

## 7. Build status (this autonomous pass)

| Item | Status |
|---|---|
| Home | Done (pre-existing + product links) |
| Shop | Done — category filter, 8 products |
| Product Detail | Done — `/shop/[id]`, actives, variants, add to cart |
| Cart / Checkout | Done — shipping math, promo `DEW15`, Stripe or local mock |
| About Emily | Done — approved bio copy (2026-07 mobile pass); no empty media placeholder |
| Services | Done — menu from `lib/services.js` + VC promo card |
| Book Now | Done — 3-step flow + `/api/book` |
| Studio | Nav removed; 308 → `/about`; page file retained |
| Membership | Nav removed; 308 → `/services`; page file retained |
| Contact | Done — form → store messages |
| Virtual Consultation | Done — public page, Stripe/mock checkout, intake+photos, admin plan, emails |
| Admin Portal | Done — auth, products, orders, appointments, **consultations**, discounts |
| Analytics Dashboard | Done — `/admin/analytics` from real store data |
| Skin Script CSV import | Done — `/admin/import` + `data/sample-import.csv` |
| Privacy / Shipping / Returns | Done — honest scaffolds; final legal copy still Emily |
| FAQ | Done — `/faq` + home teaser |
| Free-ship meter · routine upsell · gift notes · sticky mobile CTA | Done 2026-07-25 |
| Production host | **https://dewtheoryco.com** (Cloudflare Worker `dew-theory`) |
| Noise Shimmer hero | Done 2026-07-30 — commit `3eeadca`, live verified |
| Nav logo contrast vs Noise Shimmer | Done 2026-07-30 — halo + drop-shadow UI only; `/logo-mark.webp` unchanged |
| Google Calendar freebusy + event write | Done 2026-07-31 — code complete; needs GOOGLE_CALENDAR_* secrets |
| Shared Resend email (book/order/VC/membership) | Done 2026-07-31 — needs RESEND_API_KEY for live send |
| Admin TOTP 2FA | Done 2026-07-31 — optional ADMIN_TOTP_SECRET |
| Starter kits + sticky mobile CTA | Done 2026-07-31 |
| Membership interest + package shells | Done 2026-07-31 — no invented prices |
| Admin weekly analytics + outbound email log | Done 2026-07-31 |
| Path-gate AIDesigner to `/` only | Done 2026-07-31 |
| **Stripe live keys** | **Owner only** — code ready, not connected |

### Definition of Done notes

- Retail = wholesale × 2 sitewide; sticker prices are not pre-discounted.
- Shipping $7 / free $49+ visible at checkout (also documented on `/shipping`).
- Stripe promo works when `STRIPE_SECRET_KEY` is set; local `DEW15` works without it.
- `/admin` unreachable without admin session (customer has no path to that cookie).
- Product/discount mutations write `AuditLog` rows.
- CSV import creates products from sample columns.
- Analytics uses seeded order + appointment + events, not hard-coded UI mock numbers.
- **Perf (engineering):** ISR 60s; poster-first motion; quiet ambient on conversion routes;
  OpenNext edge cache configured. Report: `docs/OPTIMIZATION_REPORT.md`.
- **Not done without credentials / Emily:** live Stripe payment test, Google Calendar slots,
  Supabase-backed tables, Resend production email, real treatment menu prices, deposit %,
  Emily portrait/studio photos, final returns legal language.
