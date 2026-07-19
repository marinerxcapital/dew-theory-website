# Dew Theory — Overnight Polish Loop

> **Using `/loop`?** Prefer the ready-made command in  
> **`DEW_THEORY_LOOP_PROMPT.md`** — `/loop` fires on an interval (one queue item per tick).  
> This file is the full queue + quality rules that each tick executes against.

Working directory: `C:\Users\Skyler B. Brown\Desktop\dew-theory`  
Context already on disk: `README.md`, `OPEN_ITEMS.md`, `DEW_THEORY_BUILD_PROMPT.md`,
`DEW_THEORY_BUILD_PROMPT_ADDENDUM.md`, `data/products.json`, and the full built app.

---

## Instruction

You are in a **continuous overnight polish session**. The site is already built end-to-end.
Your job is to raise quality: visual polish, motion consistency, accessibility, backend
hardening, tests, performance, and ops readiness — **without inventing business facts**.

Permission is granted in advance for **everything** in `POLISH_QUEUE` below. Do not ask
whether to continue. Do not wait for approval between items. Sleep is happening — keep working.

### Session contract

```
OPEN the folder C:\Users\Skyler B. Brown\Desktop\dew-theory
READ OPEN_ITEMS.md + README.md first
THEN run POLISH_QUEUE to completion
THEN write POLISH_REPORT.md
THEN commit everything
IF you get cut off: resume from POLISH_REPORT.md / first unchecked queue item
NEVER invent Emily's prices, address, deposit %, membership terms, or discount %
NEVER scrape Skin Script without authorization
NEVER push to GitHub / deploy / send messages unless credentials already work AND
  the queue item explicitly says to — default is local only
```

---

## The loop

```
POLISH_QUEUE = [

  # ─── A. Baseline & safety ─────────────────────────────────────────
  "A1  Repo health: npm install, npm run build, fix all build/type/lint errors",
  "A2  Security pass: no secrets in client bundles; admin routes server-gated;
       rate limits on login; cookie flags; CSRF-ish checks on admin mutations;
       strip default admin password from production path (require env in prod)",
  "A3  Dependency hygiene: bump Next if CVE-flagged; audit critical vulns;
       document remaining mediums in POLISH_REPORT.md",

  # ─── B. Design system polish ──────────────────────────────────────
  "B1  Token audit: every page uses pearl/ivory/chrome/graphite/ice/lavender/blush/
       charcoal only — no pure black/white/saturated color; no Inter/default SaaS look",
  "B2  Type discipline: Bodoni display, Jost labels 0.34em, Karla body 300 —
       fix any stray system fonts or wrong weights",
  "B3  Glass surfaces: improve .glass-1/.glass-2 so blur has something to refract
       (subtle ambient fields / gradients behind panels) without adding stock photos",
  "B4  Focus states: visible keyboard focus sitewide; skip link works; tab order sane
       on Home, Shop, Cart, Book, Admin",
  "B5  Responsive pass: 375 / 768 / 1280 for every storefront page + admin tables;
       fix overflow, sticky cart summary, mobile nav, admin horizontal scroll",

  # ─── C. Motion polish ─────────────────────────────────────────────
  "C1  MotionRoot: scroll reveals work on new pages (shop, product, about, services,
       book, studio, membership, contact, cart); no double-init; cleanup on route change",
  "C2  prefers-reduced-motion: verify CSS + GSAP + hero pointer path; no orphan animations",
  "C3  Cut any motion that doesn't serve hierarchy/material language (Section 7.3)",

  # ─── D. Storefront page polish (one item = one full page pass) ────
  "D1  Home: product cards link correctly; services list syncs lib/services.js;
       empty states; meta/OG basics",
  "D2  Shop: filter UX, empty filter state, stock_status handling (hide discontinued
       or badge them), loading/skeleton if needed",
  "D3  Product detail: variant required before add; related products strip;
       track product_view event server or client via /api/events",
  "D4  Cart: edge cases (qty 0, max 20, missing product, promo clear, free shipping
       messaging, sticky summary, confirmation page from Stripe session_id)",
  "D5  About / Services / Studio / Membership / Contact: copy polish in brand voice;
       still flag invented facts in OPEN_ITEMS — improve prose quality only",
  "D6  Book flow: invalid service query param; double-submit guard; success state;
       track funnel events; deposit UI placeholder without inventing %",

  # ─── E. E-commerce backend ────────────────────────────────────────
  "E1  Checkout API: strict validation; re-price only from catalog; reject unknown SKUs;
       idempotency key support; clearer error shapes",
  "E2  Shipping unit tests (or node:test scripts): free at 49 pre-discount; 7 below;
       SHIPPING_THRESHOLD_BASIS flip; discount + shipping matrix",
  "E3  Discount engine tests: percentage, fixed, expired, max_uses, inactive, case-insensitive",
  "E4  Stripe path: if no key, mock path documented; if key present, session metadata
       complete; webhook stub route /api/webhooks/stripe for paid → order status",
  "E5  Cart → order → admin status path: document + smoke-test script (curl or node)",

  # ─── F. Booking backend ───────────────────────────────────────────
  "F1  Book API: validate service exists; reject past slots; prevent double-book same slot
       (store-level uniqueness); input sanitization",
  "F2  Availability module: extract mock slots to lib/availability.js with adapter
       interface ready for Google Calendar later",
  "F3  Appointment status transitions: confirmed → completed/cancelled/no_show only",

  # ─── G. Admin portal ──────────────────────────────────────────────
  "G1  Auth: production rejects default password; login audit both success/fail;
       logout clears cookie; unauthenticated /admin/* redirects to login (middleware)",
  "G2  Products CRUD: validation, retail auto ×2, delete confirm, stock toggle,
       active flag reflected on shop",
  "G3  Orders: filters by status; mark submitted_to_skin_script; line-item detail solid",
  "G4  Discounts UI: create/edit/deactivate; referrer id visible; redemptions count",
  "G5  CSV import: robust parser; bad rows report; sample CSV works end-to-end;
       dry-run mode before commit",
  "G6  Analytics: date range filter (simple); empty states; no hard-coded fake numbers",
  "G7  Admin UX: consistent table styles, empty states, error toasts, loading states",

  # ─── H. Data layer ────────────────────────────────────────────────
  "H1  Store integrity: atomic write (temp file + rename); corrupt JSON recovery;
       seed only if missing — never wipe live runtime data",
  "H2  Schema docs: data/SCHEMA.md describing Products, Orders, Appointments,
       DiscountCodes, Admins, AuditLog, Events — maps to Supabase later",
  "H3  Adapter seam: lib/store.js exports same API surface documented for future
       lib/store-supabase.js swap; no call sites need change",
  "H4  Products: shop reads server store when possible so admin edits appear on site
       (without breaking static generation — hybrid: force-dynamic shop or revalidate)",

  # ─── I. Observability & events ────────────────────────────────────
  "I1  /api/events for first-party funnel tracking (product_view, add_to_cart, etc.)",
  "I2  Wire shop/cart/book UI to fire events",
  "I3  Structured logging helper for API routes (no PII in logs beyond email when needed)",

  # ─── J. SEO / share / content ─────────────────────────────────────
  "J1  metadata + openGraph per major route; unique titles; no duplicate generics",
  "J2  robots: index storefront, noindex /admin and /api",
  "J3  sitemap.xml + robots.txt for public routes",
  "J4  404 page in brand style",

  # ─── K. Performance ───────────────────────────────────────────────
  "K1  Image/font review: next/font already; ensure logo sizes sane; no giant unused assets",
  "K2  Hero video: poster always, muted playsInline, reduced-motion prefers poster",
  "K3  Bundle: no accidental server-only imports in client components (fs, store)",

  # ─── L. Tests & scripts ───────────────────────────────────────────
  "L1  Add npm scripts: test (shipping+discount+cart math), smoke (build + key routes)",
  "L2  Unit tests with node:test or vitest — zero new heavy framework if avoidable",
  "L3  Manual QA checklist in POLISH_REPORT.md with pass/fail",

  # ─── M. DX & docs ─────────────────────────────────────────────────
  "M1  README: run, admin login, env vars, mock vs Stripe, how to import CSV",
  "M2  OPEN_ITEMS.md: move fixed items; never delete unresolved business decisions",
  "M3  .env.example content (if globalignore blocks file, put ENV.md instead)",

  # ─── N. Final gate ────────────────────────────────────────────────
  "N1  Full npm run build clean",
  "N2  Smoke: start dev or start, hit / /shop /cart /book /admin/login",
  "N3  Write POLISH_REPORT.md (see template below)",
  "N4  Final git commit: 'Overnight polish pass — see POLISH_REPORT.md'",
]

WHILE POLISH_QUEUE is not empty:
    item = POLISH_QUEUE.pop_first()
    1. Do the work completely for this item.
    2. Self-review: if code, run relevant checks (build, tests, or manual logic review).
       If UI, open/read the page components and fix defects in the same pass.
    3. Commit after each major letter group (A, B, C…) OR after every 3–5 items —
       descriptive messages, not one mega-dump at the end only.
    4. Append any new assumptions to OPEN_ITEMS.md immediately.
    5. If blocked on credentials/business decision: implement the best reversible
       structure, note the block in OPEN_ITEMS + POLISH_REPORT, CONTINUE.
    6. Next item immediately. No chat pauses asking permission.
END WHILE
```

---

## Do not stop for these — proceed automatically

- “Should I continue?” → **yes**
- “Should I commit?” → **yes** (local git only)
- Design token debates already settled in the build prompt → **follow them**
- Large item → **split yourself**, finish all substeps, then advance
- Missing Stripe / Supabase / Google / GitHub credentials → **placeholder + adapter + OPEN_ITEMS**, keep going
- Unsure of Emily’s real menu/address/deposit → **do not invent numbers**; polish structure/copy around placeholders

## Stop only for these (and still don’t halt the whole night)

| Hard boundary | What to do instead |
|---|---|
| Business decision only Skyler/Emily can make | Placeholder + OPEN_ITEMS line |
| Missing secret you cannot generate | Wire env drop-in; document in ENV.md / POLISH_REPORT |
| Unauthorized Skin Script scraping | CSV import only |
| Destructive ops (force-push, rm -rf data, drop DB) | **Never** without explicit human wake-up |
| Deploy / public push / email send | Only if already configured AND queue needs it; default **local** |

---

## Quality bar (every UI change)

1. Matches liquid-chrome tokens (no new palette)
2. Rule component only for genuine pairs
3. Motion serves hierarchy; reduced-motion safe
4. Keyboard focus visible
5. No lorem ipsum
6. Invented business facts only if already in OPEN_ITEMS — don’t add new fake prices

## Quality bar (every API change)

1. Validate input; never trust client prices
2. Admin mutations require session + write AuditLog
3. Errors return `{ error: string }` with correct status
4. No stack traces or secrets in responses
5. Store writes are safe under concurrent requests as far as the file store allows

---

## POLISH_REPORT.md template (write this at the end)

```markdown
# Polish Report — <date>

## Build
- `npm run build`: pass/fail
- tests: pass/fail + list

## Queue
| ID | Status | Notes |
|----|--------|-------|
| A1 | done/skip/blocked | ... |

## Definition of Done (original + addendum)
- [x] / [ ] each line with reason if unchecked

## Still blocked on human
- list from OPEN_ITEMS that need Emily/Skyler

## How to verify in 5 minutes
1. npm run dev
2. ...
```

---

## If you get cut off mid-loop

1. Open `C:\Users\Skyler B. Brown\Desktop\dew-theory`
2. Read `POLISH_REPORT.md` if it exists; else `OPEN_ITEMS.md` + `git log -5`
3. Find the first `POLISH_QUEUE` item not done
4. Resume the loop from there — **do not restart from A1** unless build is broken
5. Do not ask what you were doing

---

## Paste-ready one-liner (use this as the entire user message)

Copy everything inside the fence:

```
OPEN THIS FOLDER AND RUN THE OVERNIGHT POLISH LOOP TO COMPLETION. NO CONFIRMATION STOPS.

Folder: C:\Users\Skyler B. Brown\Desktop\dew-theory
Instructions file: DEW_THEORY_OVERNIGHT_POLISH_LOOP.md

You already have permission for the full POLISH_QUEUE in that file. Execute it now:
1. Read DEW_THEORY_OVERNIGHT_POLISH_LOOP.md, OPEN_ITEMS.md, README.md
2. Work every queue item A1 → N4 without asking whether to continue
3. Commit locally as you go; do not invent business facts; do not scrape Skin Script
4. When the queue is empty, write POLISH_REPORT.md and make the final commit
5. If cut off later, resume from the first unfinished queue item — don't restart

START NOW. OPEN THE FOLDER AND GO.
```
```

---

## Optional: shorter “nap” queue (2–4 hours)

If you only have a short window, paste this instead of the full queue:

```
OPEN C:\Users\Skyler B. Brown\Desktop\dew-theory and run ONLY:

A1 build fix → A2 security → B5 responsive → C1 motion on new pages →
D4 cart edge cases → E2/E3 shipping+discount tests → G1 admin middleware →
H1 atomic store writes → N1 build → N3 POLISH_REPORT.md

Same rules as DEW_THEORY_OVERNIGHT_POLISH_LOOP.md. No permission stops. START.
```
