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
Membership interest-list / package shells remain **code/history only** — public `/membership` is **unpublished (404)** after owner-removal passes (see §1 and `DEW-THEORY-CURRENT-STATUS.md`). Do not treat Membership as a live customer-facing route.

**Historical note (2026-08-25):** an earlier deploy-blocker paragraph claimed the editorial revamp was not live; later Codex deploys shipped brand + owner simplifications. Re-verify live SHA in `DEW-THEORY-CURRENT-STATUS.md` before acting.

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
- **Customer-facing pages (reconciled 2026-09-04 Wave 0).** **Live public surface:** Shop,
  Product Detail (`/shop/[id]`), Cart/Checkout, **Virtual Consultation**, and the 8 public legal
  pages. **Not live public** (application 404 per `tests/public-removals.test.mjs` + production):
  `/book`, `/services`, `/membership`, `/about`, `/contact`, `/faq`, `/quiz`, `/routine` (and
  `/studio` redirects away). Earlier copy here wrongly listed About/Services/Book/Membership as
  live full routes — that reflected pre-removal engineering, not the current consultation+shop
  product surface. Admin portal, analytics, CSV import, and **admin consultations** remain built
  behind `/admin` auth.
- **Cart + shipping math.** Client cart (localStorage) + server re-price; `$7` / free at `$49+`
  pre-discount subtotal via `SHIPPING_THRESHOLD_BASIS` in `lib/shipping.js`.
- **Launch promo mechanism.** `DEW15` (15% placeholder value) seeded in store; percentage is
  admin-editable — not a confirmed client number.
- **Admin gate.** `/admin/*` requires httpOnly session cookie + row in `Admins` (local file store
  until Supabase Auth). Dev credentials: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults in `ENV.md`).
  **Owner-only (2026-09-01):** `ADMIN_OWNER_EMAIL` must match login; non-owner Admins rows rejected.
  Admin Command Center (PR #16) merged + deployed; unauthenticated `/admin` → login verified. Owner login + TOTP live check remains owner-only.
- **Overnight polish (engineering).** Availability adapter, appointment/order status machines, CSV
  dry-run, atomic store writes, robots/sitemap/404, funnel events, unit tests — see `POLISH_PROGRESS.md`.
  Unresolved *business* decisions remain below; nothing was invented to close them.

---

## 2. New — from the pricing/catalog pass

**Status 2026-09-19 (Emily confirmation pass):** Emily did not answer the confirmation prompt.
Engineered defaults below remain in `data/products.json` / the seeded store. They are **not**
Emily-approved. Do not treat any of these as confirmed business facts, and do not flip honesty
flags to `true`, until she explicitly confirms them.

- **Sheer Protection SPF retail (pending Emily).** No retail price in the source document — every
  other product listed one. Catalog still uses the engineered default **$30** (2× the $15 wholesale)
  with `retail_price_confirmed: false`. Emily still must confirm before publishing this as an
  approved price.
- **Launch promo / DEW15 rate (pending Emily).** The client asked for "some sort of discount for the
  launch or some sort of referral code" without a percentage, amount, or referrer payout. Mechanism
  is live (Stripe Promotion Codes + admin UI). Seeded `DEW15` at 15% is a **placeholder launch promo
  only** — not an Emily-approved marketing rate. Admin may change the number; copy must not present
  15% as owner-confirmed.
- **Shipping threshold basis.** Recommended default is still to compare the $49 free-shipping
  threshold against the pre-discount subtotal (`SHIPPING_THRESHOLD_BASIS = 'pre_discount'`). Not a
  confirmed Emily decision — one-line change if she wants post-discount.
- **Lip Treatment SKU structure (pending Emily).** Skin Script's catalog has two scent SKUs
  (Peppermint and Pomegranate, same price); the client list gave one wholesale/retail pair. Still
  modeled as **one product** with a required scent variant. See `manufacturer_name_note` on
  `lip-treatment-peppermint-pomegranate`. Confirm whether two SKUs are preferred.
- **Botanical Bloom Hydrating Mask size (pending Emily).** Still **2 oz** with
  `size_confirmed: false` (authorized retailers list 2 oz). Placeholder until Emily confirms.
- **Sheer Protection SPF formula conflict.** Catalog uses the majority/manufacturer zinc-oxide
  version (unchanged).

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
| Membership page | Interest API + package shells exist in code/history; public `/membership` is **404** (unpublished). Prices still null until `MEMBERSHIP_PACKAGES_JSON` if Emily reintroduces the page |
| Virtual consultation price/duration | From Stripe Price ID / env only — never hardcode; set before live sell |

---

## 4. Unresolved decisions (carried over)

- **Stripe billing** — **MERGED + DEPLOYED (2026-09-02), webhook secret appears live (2026-09-20).** `cursor/stripe-wire-e021` (PR #17) squash-merged into `main` `04d6534` and deployed as Worker `ffac28e6`. Later `main` Stripe Worker fixes through `d6886bb`. Live `POST /api/webhooks/stripe` now returns **400 `missing_signature`** (not 503 `stripe_not_configured`). **Owner-only remaining:** confirm Dashboard webhook + test-card checkout → D1 paid write; keep secrets out of git. See `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`.
- Studio name and address.
- Deposit percentage and cancellation cutoff — **UI/env wired** (`BOOKING_DEPOSIT_PERCENT`, `BOOKING_CANCEL_HOURS`); Emily must set values.
- Membership **terms/prices** — structure + interest API live; Emily sets `MEMBERSHIP_PACKAGES_JSON` price_cents to sell.
- Domain name — **production uses dewtheoryco.com** (Cloudflare Worker); confirm as canonical brand domain.
- **Virtual consultation go-live checklist (owner actions):**
  1. ~~Create Stripe Product/Price~~ → done in test account via `npm run stripe:bootstrap` → `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID` (also `wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`)
  2. Webhook `https://dewtheoryco.com/api/webhooks/stripe` — registered in test Stripe; push `STRIPE_WEBHOOK_SECRET` (+ `STRIPE_SECRET_KEY`) to Worker
  3. Scheduler URL that mints unique Zoom meetings → `CONSULTATION_SCHEDULING_URL` (Worker var/secret)
  4. Drop `RESEND_API_KEY` + verified `EMAIL_FROM` (code sends; without key emails log to store)
  5. Optional R2 private bucket for consultation photos
  6. Production mock VC checkout is **off** unless `ALLOW_MOCK_CHECKOUT=true` (local/dev still mocks when Stripe secret unset; success page discloses mock)
- **Skin Script live sync.** Allowlist-only planner + Worker cron are in code (`data/catalog-allowlist.json`, daily `0 6 * * *` → `POST /api/cron/catalog-sync`). Production still `SKIN_SCRIPT_MODE=mock`, so cron **skips** (`catalog_source_mock`) until owner sets RPA (Fly + HMAC + portal session) **or** `SKIN_SCRIPT_FEED_URL` + `SKIN_SCRIPT_MODE=csv_feed`. No official partner HTTP API. See `docs/SKIN_SCRIPT_SYNC.md` owner checklist.
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
| Policy scaffolds: `/privacy`, `/shipping`, `/returns` + footer links | Done (honest; 2026-09-20 copy tighten on privacy/shipping — live vs unpublished, no unpublished contact form). Final legal still Emily. |
| Trust UI: cart/booking/VC checkout/contact error + trust strips | Done (2026-09-20: home/shop factual strip only — no reviews/ratings) |
| Consultation photos: R2 → FS → memory fallback (`CONSULTATION_PHOTOS_R2`) | Done (bucket create ops-optional) |
| Services mobile circular glow artifact | Done earlier |
| Light pearl nav restored (not dark graphite) | Done earlier |
| Production deploy dewtheoryco.com | Done earlier this session |
| GitHub push | Active remote `marinerxcapital/dew-theory-website` |

---

## 6. Blocked on access / owner secrets

- **PR #20 secret-exposure closeout (2026-09-20).** Draft handoff PR #20 was closed without merge and branch `cursor/codex-handoff-desktop-e021` was deleted. It had committed filled credential files. **Owner action:** if the Raw GitHub URL for that copy-paste file was ever opened/fetched/shared, rotate Worker Stripe secrets (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) and the other named secrets from the filled handoff (admin password/session, `CRON_SECRET`, `SKIN_SCRIPT_RPA_HMAC_SECRET`). Do not restore the branch. Values must never be committed.
- **Live Stripe / Supabase / Google Calendar keys** — env drop-in (see `ENV.md`).
- **Cloudflare edge cache** — R2 ISR + D1 tag cache already used in production deploy path;
  optional private photo bucket `dew-theory-consultation-photos` (see `docs/DEPLOY_DEWTHEORYCO.md`).
- **Skin Script live credentials.** Adapters ready; use `SKIN_SCRIPT_MODE=mock` + CSV until partner answers.
- **Skin Script RPA production (updated 2026-09-20).** D1 live; 8 `verified=1` mappings previously seeded; Worker vars `SKIN_SCRIPT_MODE=mock` + `AUTO_FULFILL=false`. Admin + customer copy now honestly labels owner/manual queue. **Still blocked (owner only):** Fly auth / `FLY_API_TOKEN`, Worker `SKIN_SCRIPT_RPA_*` secrets, Emily saved payment method, first controlled live supplier order. Exact steps: `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md`. **Draft PR #10 superseded** — close; do not merge (would revert later Admin/Stripe/portal work). Stripe webhook signature secret appears set (400 `missing_signature`).

- **Admin Command Center production verification (2026-09-01).** PR #16 merged and deployed. Unauthenticated gate, route presence, `noindex`, `robots.txt` exclusions, no-secret-leak HTML, and D1 mappings verified by Codex. **Still owner-only:** Emily login + TOTP live check and authenticated integration-panel review require owner credentials.

- **Admin auth hardening (low, non-blocking — do not block release).** Security audit returned SECURE. Two hardening notes: (1) `/api/admin/login` rate limiting is an in-memory `Map` (per-isolate on Workers), so credential-stuffing throttling is weaker than intended across isolates; (2) `ADMIN_REQUIRE_TOTP` is display-only — TOTP is only actually enforced when `ADMIN_TOTP_SECRET` is set (`lib/totp.js`), so operators must set the secret, not just the flag.

- **RPA deploy blocker precision (2026-09-01 re-verify).** `flyctl` is installable via `winget`/`scoop`/`choco`, but there is zero Fly auth on this machine (no `FLY_API_TOKEN`/`~/.fly`/config) and GitHub repo secrets + variables are both empty (`actions/secrets.total_count=0`, `actions/variables.total_count=0`), so neither the local CLI nor `.github/workflows/deploy-production.yml` can deploy. `fly.toml`, `Dockerfile`, and the workflow are complete and deploy-ready once owner supplies Fly auth (`fly auth login` or `FLY_API_TOKEN`) + portal/HMAC secret values.
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
| About Emily | Approved bio existed; **public `/about` unpublished (404)** after consultation+products-only pass |
| Services | Built historically from `lib/services.js`; **public `/services` unpublished (404)** after owner removals |
| Book Now | Built historically (`/api/book` may remain); **public `/book` unpublished (404)** |
| Studio | Unpublished; `/studio` redirects (not a live offering page) |
| Membership | Interest/package shells in code/history; **public `/membership` unpublished (404)** |
| Contact | Built historically; **public `/contact` unpublished (404)** — support via mailto where required |
| Virtual Consultation | Done — public page, Stripe/mock checkout, intake+photos, admin plan, emails |
| Admin Portal | Done — auth, products, orders, appointments, **consultations**, discounts |
| Analytics Dashboard | Done — `/admin/analytics` from real store data |
| Skin Script CSV import | Done — `/admin/import` + `data/sample-import.csv` |
| Privacy / Shipping / Returns | Done — honest scaffolds; final legal copy still Emily |
| FAQ | Built historically; **public `/faq` unpublished (404)** |
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
| **Stripe live keys** | **Worker secrets pending** — test keys verified locally; push via Codex prompt `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md` |

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

## 2026-09-20 catalog expansion honesty

- Newly added storefront products use portal-verified wholesale x 2 retail with retail_price_confirmed=false until Emily approves.
- Ageless Lip Treatment remains one product (Peppermint/Pomegranate variants); Lip Balm with SPF 15 is a separate verified SKU.
- AUTO_FULFILL remains false; RPA live order remains owner-gated.
