# OPEN_ITEMS.md — Dew Theory

Everything on this list is invented, assumed, or blocked. Nothing here is confirmed fact.
Resolve before launch.

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
- **Customer-facing pages.** Shop, Product Detail, Cart/Checkout, About, Services, Book, Studio,
  Membership, and Contact are real pages (not stubs). Admin portal, analytics, and CSV import built.
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
| `app/page.jsx` → Emily band / `app/about/page.jsx` | Emily Mitchener's bio paragraphs (polished draft, not approved) |
| `app/page.jsx` → Thesis section | The brand thesis sentence |
| `lib/services.js` + Services/Book/Home | All service names, durations, and prices — still needs Emily's actual menu |
| `components/Footer.jsx` | The one-line brand descriptor |
| `app/studio/page.jsx` | Working hours (Mon–Sat); address intentionally "pending" |
| `app/contact/page.jsx` | `hello@dewtheory.studio` email — domain not confirmed |
| About credentials block | License board/number not provided |
| Membership page | Directional language only; no tiers or prices invented |

---

## 4. Unresolved decisions (carried over)

- Payment processor assumed to be Stripe — confirm. Wired for test keys; mock checkout without keys.
- Studio name and address.
- Deposit percentage and cancellation cutoff window for bookings.
- Membership program: whether it launches at all, and on what terms (page built without inventing tiers/prices).
- Domain name.
- **Skin Script live sync.** No confirmed API. CSV/manual import remains (`/admin/import`).
  **Also:** mock automated sync + dropship (`/admin/sync`, auto-fulfill on paid). Live path blocked
  on partner answer — exact questions:
  1. Is dropship/resale allowed on this wholesale account?
  2. Catalog channel: partner API, scheduled CSV, or portal export only?
  3. Order channel: API create PO, EDI, or email PO?
  4. Canonical SKU + wholesale price file format and cadence?
  5. Ship-from, tracking format, partial ships, returns process?
  6. MAP / branding constraints?
  Details: `docs/SKIN_SCRIPT_SYNC.md`.
- **Visitor analytics provider** — recommended Vercel Analytics; funnel analytics use first-party events.
- **Admin two-factor authentication** — recommended, not in initial build.
- Google Calendar OAuth for live availability (booking uses mock 14-day slots until credentials exist).
- Supabase project keys (file store at `data/runtime/store.json` mirrors schema until then).
- Transactional email for order/booking confirmation.

---

## 5. Assets (carried over)

- **The hero video is portrait, 848 × 1072 (not 16:9).** Full-bleed `object-cover` motion
  background + portrait glass column (poster still). Source refreshed 2026-07-21 from
  `generated_video (1).mp4`; web path is ping-pong-extended silent `hero.mp4` (~20s) +
  `hero-poster.webp` via `next/image`. Original brief’s 16:9 landscape still not used.
- **Skin Script product photography — INSTALLED 2026-07-24.** All eight catalog products now use
  coordinated 832×1232 studio assets at `/images/products/skin-script/` (PNG + WebP), wired through
  `data/products.json` `images[]` / `image_alt` / `image_webp` and `lib/product-image.js`. Surfaces:
  home featured, shop grid, PDP + OG, cart thumbnails, related strip. Placeholders remain only as
  fallback for unknown categories. **Still missing:** Emily portrait, studio photography, and any
  lifestyle/in-use shots beyond product packshots.
- **Lighthouse local baseline (2026-07-20):** home perf ~60, shop ~58, PDP ~88; CLS excellent;
  TBT/LCP on home+shop still driven by main-thread JS + hero media. See `docs/OPTIMIZATION_REPORT.md`.

---

## 6. Blocked on access (carried over)

- **Nothing was pushed to `marinerxcapital/dew-theory-website`.** Push manually when GitHub remote
  and credentials are available.
- **GitHub Pages preview.** Skip — private repo; Pages can't run Stripe/Supabase/admin.
- **Live Stripe / Supabase / Google Calendar keys** — not present in this environment; integrations
  are wired for env drop-in (see `.env.example`).
- **Cloudflare edge cache resources (Phase B).** Config is in `open-next.config.ts` + `wrangler.jsonc`,
  but R2 bucket `dew-theory-opennext-cache` and D1 `dew-theory-tag-cache` are not created until
  `wrangler login` + commands in `docs/EDGE_CACHE.md`. Until then, production Workers ISR may not
  persist; local `next start` ISR still works.
- **Skin Script live credentials.** Adapter stack is built (`mock` | `http` | `csv_feed`) but real
  partner API/base URL/keys are unknown. Ask wholesale rep (see questions below). Until then use
  `SKIN_SCRIPT_MODE=mock` + CSV import. No scraping.
- **xAI assist optional.** Set `XAI_API_KEY` for messy feed mapping / error classification only.
  Not required for mock dropship.

---

## 7. Build status (this autonomous pass)

| Item | Status |
|---|---|
| Home | Done (pre-existing + product links) |
| Shop | Done — category filter, 8 products |
| Product Detail | Done — `/shop/[id]`, actives, variants, add to cart |
| Cart / Checkout | Done — shipping math, promo `DEW15`, Stripe or local mock |
| About Emily | Done — real page; bio still placeholder copy |
| Services | Done — menu from `lib/services.js` |
| Book Now | Done — 3-step flow + `/api/book` |
| Studio | Done — address pending, hours assumed |
| Membership | Done — no invented pricing/tiers |
| Contact | Done — form → store messages |
| Admin Portal | Done — auth, products CRUD, orders, appointments, discounts |
| Analytics Dashboard | Done — `/admin/analytics` from real store data |
| Skin Script CSV import | Done — `/admin/import` + `data/sample-import.csv` |

### Definition of Done notes

- Retail = wholesale × 2 sitewide; sticker prices are not pre-discounted.
- Shipping $7 / free $49+ visible at checkout.
- Stripe promo works when `STRIPE_SECRET_KEY` is set; local `DEW15` works without it.
- `/admin` unreachable without admin session (customer has no path to that cookie).
- Product/discount mutations write `AuditLog` rows.
- CSV import creates products from sample columns.
- Analytics uses seeded order + appointment + events, not hard-coded UI mock numbers.
- **Perf (engineering):** ISR 60s on catalog routes; admin revalidates storefront; next/image +
  placeholders; OpenNext edge cache **configured** (provision CF separately). Report:
  `docs/OPTIMIZATION_REPORT.md`.
- **Not done without credentials:** end-to-end Stripe test payment, Google Calendar live slots,
  Supabase-backed tables, push to private GitHub repo, production host URL, CF R2/D1 create + deploy.
