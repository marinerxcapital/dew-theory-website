# DEW THEORY SKIN CARE — SUPERGROK MASTER EXECUTION PROMPT

**Audience:** SuperGrok (xAI) running in Windows PowerShell on the owner Mini PC, coordinating specialized parallel subagents.  
**Author:** Cursor Cloud Agent (repository auditor / prompt author) — **not** the implementation agent.  
**Generated (UTC):** 2026-09-04  
**Purpose:** Start from **zero chat context** and finish everything required to make Dew Theory Skin Care operationally ready for real customers, real Stripe payments, authorized Skin Script fulfillment, virtual consultations, owner admin operations, production verification, and durable project memory.

**Copy this entire file into SuperGrok. Do not summarize it away.**

---

## 0. MISSION (READ FIRST)

You are the **lead orchestrator and final integrator** for Dew Theory Skin Care (`dewtheoryco.com`).

Your job is to:

1. Verify local + GitHub source truth before changing anything.
2. Preserve working architecture; extend and harden it — do **not** rewrite for fashion.
3. Complete launch-critical commerce: catalog, Stripe, orders, fulfillment, admin, consultations.
4. Prefer **authorized** Skin Script integration; never fabricate APIs or bypass CAPTCHA/MFA/anti-bot.
5. Produce a structured Skin Script product-image package ZIP for later ChatGPT image transforms.
6. Run tests continuously; deploy/verify only when credentials allow.
7. Update project memory after every major wave and before any context risk.
8. Stop only when Definition of Done is met or remaining items are explicitly owner/third-party blocked.

**A button labeled Sync / Fulfill / Connected / Live / Automated is not proof of integration.** Trace every critical workflow to real code and real data paths.

**Never** invent credentials, APIs, production health, revenue, orders, or completion claims.

---

## 1. BUSINESS CONTEXT

### 1.1 Company

| Item | Value |
|------|-------|
| Business | **Dew Theory Skin Care** |
| Operator | **Emily Mitchener** (owner / aesthetician) |
| Domain | https://dewtheoryco.com (+ www) |
| GitHub | `https://github.com/marinerxcapital/dew-theory-website` |
| Brand | Forest `#1E2B22`, Sage Deep `#5B7356`, Sage `#93A890`, Ivory `#EDEDE6`, Stone `#C9C4B8`; fonts Bodoni Moda / Jost / Karla |

### 1.2 What the website must support

1. Online sale of Skin Script skincare products.
2. Curated Skin Script catalog (currently 8 live SKUs; expandable via authorized sync).
3. Dropshipping / vendor-fulfilled orders **where commercially, technically, and contractually permitted**.
4. Stripe payment processing (test now; live when owner enables).
5. Virtual skincare consultations.
6. **Future** in-person services (tanning, waxing, Brazilian waxing, other esthetics) — **architecture extensibility only; do not build a full salon suite that delays ecommerce launch**.
7. Owner-focused admin Emily can operate without editing source code.
8. Production-grade order, payment, fulfillment, catalog, and operational workflows.

### 1.3 Target customer flow (operating model)

```text
Customer discovers Skin Script product on Dew Theory
→ cart → checkout
→ Stripe collects payment
→ server verifies payment (webhook / session reconcile)
→ Dew Theory records canonical paid order (D1 commerce)
→ fulfillment job outbox queued
→ vendor mapping resolves Skin Script SKU
→ authorized automation OR structured owner queue submits vendor order
→ Skin Script / fulfillment provider ships
→ tracking/status return where supported
→ customer transactional emails
→ Emily sees full lifecycle in Admin Command Center
```

### 1.4 Skin Script integration preference order (MANDATORY)

Before expanding automation, **verify what Skin Script officially supports**:

1. Official Skin Script API  
2. Official wholesale / dropship integration  
3. Official product feed / CSV / partner export  
4. Authorized ecommerce integration  
5. Compliant owner-assisted workflow if no API  
6. Browser automation (RPA) **only if** terms allow it, MFA/CAPTCHA are never bypassed, reliability is production-grade, and Emily accepts operational risk  

**Current verified reality (GitHub + docs + code):** No official partner API is confirmed in-repo. HTTP adapter is a **stub**. Production-oriented path is **WooCommerce portal RPA** under `services/skin-script-rpa/` with durable D1 jobs. Do **not** call private reverse-engineered endpoints “supported.”

### 1.5 Financial workflow correction (CRITICAL)

Customer Stripe payment funds Dew Theory’s business. That does **NOT** mean:

- Stripe balance is instantly spendable for Skin Script purchase,
- You may use stored Stripe customer cards to pay Skin Script,
- You may bypass PCI / Skin Script / Stripe / card-network rules.

If Skin Script requires Dew Theory’s separate wholesale payment method, design around that. Never claim settled Stripe funds are instant cash.

---

## 2. VERIFIED SOURCE TRUTH (CURSOR AUDIT — 2026-09-04)

### 2.1 Git identity

| Item | Verified value |
|------|----------------|
| Repository | `marinerxcapital/dew-theory-website` |
| Default branch | `main` |
| `main` HEAD (this audit) | `a11626fc4e5aa67d4c5ea0269ea6d1c0e0b89370` |
| Latest feature merge | PR #17 Stripe wiring squash `04d6534` |
| Latest docs commit | `a11626f` (deploy closeout) |
| Open draft PRs | #10, #13 (docs — low priority) |
| CI | Green on `main` (e.g. run `33591566888`) |

**MUST VERIFY LOCALLY:** Re-run `git fetch` / `git rev-parse HEAD` — SHAs move.

### 2.2 Live production probes (Cursor, 2026-09-04)

| Probe | Result |
|-------|--------|
| `GET https://dewtheoryco.com/` | HTTP 200 |
| `GET /admin` | 307 → `/admin/login?next=%2Fadmin` |
| `POST /api/webhooks/stripe` (no secrets) | **503** |
| `robots.txt` | Disallows `/admin`, `/api`, VC intake/plan/success, cart confirmation |
| Public surface | Consultation + Shop products only (`/book` `/services` `/membership` 404) |

### 2.3 Documented deploy state (re-verify with wrangler)

From `DEW-THEORY-CURRENT-STATUS.md` (note: file’s “main HEAD = 04d6534” row is **stale** vs actual `a11626f`):

| Item | Documented |
|------|------------|
| Deployed code SHA | `04d6534` (Stripe PR #17) |
| Worker | `dew-theory` |
| Worker version ID | `ffac28e6-b77a-42da-a668-ba6154556378` (confirm locally) |
| D1 commerce | `DEW_THEORY_D1` → `dew-theory-commerce` id `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` |
| Wrangler vars | `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false` |
| Stripe Worker secrets | **NOT SET** (fail-closed webhook) |
| RPA Fly app | Configured, **not deployed** |

### 2.4 Stack (verified)

- Next.js 15 App Router, React 19, Tailwind 3.4, **JavaScript** (`jsconfig` — not TypeScript)
- npm + `package-lock.json`
- Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler.jsonc`
- Durable commerce: Cloudflare D1 (`lib/commerce/*`)
- Local/test commerce: file backend `data/runtime/commerce.json`
- Legacy/ephemeral store: `lib/store.js` (products, admins, consultations, events; **non-durable across Worker isolates**)
- Cart: client `localStorage` (`dew_theory_cart_v1`) + server re-price
- Skin Script RPA: Python/FastAPI + Playwright under `services/skin-script-rpa/`
- CI: `.github/workflows/ci.yml` (Node tests + build; Python pytest/ruff; Docker build RPA). Continuity script soft-fails (`|| true`).

---

## 3. STRUCTURED GAP AUDIT (STATUS LABELS)

Use these labels exactly. Cursor classifications below — **re-verify before treating as immutable**.

### 3.1 Storefront / brand

| Area | Status | Evidence |
|------|--------|----------|
| Brand tokens / fonts | COMPLETE AND VERIFIED | `app/globals.css`, `tailwind.config.js` |
| Homepage consultation+products only | COMPLETE AND VERIFIED | `app/page.jsx`, live HTML |
| Shop + PDP + cart | COMPLETE AND VERIFIED | `app/shop/*`, `app/cart/*` |
| Unpublished `/book` `/services` `/membership` | COMPLETE AND VERIFIED | 404 live; `tests/public-removals.test.mjs` |
| Orphan booking/quiz/membership components | DEPRECATED / SHOULD REMOVE or quarantine | `components/BookingFlow.jsx`, `SkinQuiz.jsx`, `lib/services.js`, `/api/book` |

### 3.2 Catalog

| Area | Status | Evidence |
|------|--------|----------|
| Seed catalog 8 products | COMPLETE AND VERIFIED | `data/products.json` |
| Categories (8 types) | COMPLETE AND VERIFIED | Product `category` fields + CategoryNav |
| Studio product images PNG/WebP | COMPLETE AND VERIFIED | `public/images/products/skin-script/` + `product-image-manifest.json` |
| CSV import / catalog sync code | COMPLETE AND VERIFIED (code) | `lib/catalog-sync.js`, admin import/sync |
| Live partner catalog API | BLOCKED BY THIRD-PARTY CAPABILITY | `docs/SKIN_SCRIPT_SYNC.md`, HTTP stub |
| ChatGPT image transform package ZIP | MISSING | Need SuperGrok deliverable |
| Owner overrides vs source fields | PARTIALLY IMPLEMENTED | Flat product rows; improve if sync expands |
| Activation states DRAFT/ACTIVE/… | PARTIALLY IMPLEMENTED | `active` flags; expand if needed without breaking storefront |

### 3.3 Supplier mapping / Skin Script

| Area | Status | Evidence |
|------|--------|----------|
| Verified portal SKU registry 8/8 | COMPLETE AND VERIFIED | `data/supplier/skin-script-portal-urls.json` |
| D1 `verified=1` mappings | IMPLEMENTED BUT UNVERIFIED (re-read D1) | `npm run seed:verified-mappings:d1`; docs claim seeded |
| Modes mock/http/csv/rpa | COMPLETE AND VERIFIED (factory) | `lib/suppliers/skin-script/index.js` |
| HTTP partner API | PLACEHOLDER / MOCK | `http-adapter.js` |
| RPA adapter + HMAC client | COMPLETE AND VERIFIED (code) | `rpa-adapter.js` |
| RPA service health/ready/jobs | COMPLETE AND VERIFIED (code/tests) | `services/skin-script-rpa/` |
| Live portal dry-run | IMPLEMENTED BUT UNVERIFIED *this session* | Docs: Session 5 `dry_run_ready`; **MUST VERIFY LOCALLY** |
| Fly RPA deploy | BLOCKED BY CREDENTIAL / OWNER INPUT | `fly.toml` ready; no Fly auth; GH secrets empty |
| Production mode still `mock` | COMPLETE AND VERIFIED | `wrangler.jsonc` vars |
| Inventory via RPA | PLACEHOLDER / MOCK | Hardcoded qty in RPA inventory endpoint |
| Live supplier purchase | MISSING / BLOCKED | Needs saved payment + dry-run off + owner auth |
| `fly.toml` `PORTAL_BASE_URL=https://skinscript.com` | UNKNOWN — MUST VERIFY LOCALLY | Login is `skinscriptrx.com`; product pages may use skinscript.com — reconcile carefully |

### 3.4 Stripe / payments

| Area | Status | Evidence |
|------|--------|----------|
| Shared Stripe config + Tax helpers | COMPLETE AND VERIFIED | `lib/stripe/config.js`, `tests/stripe-config.test.mjs` |
| Shop Checkout Session path | PARTIALLY IMPLEMENTED | `app/api/checkout/route.js` — works when key set; else mock |
| Webhook signature + events | IMPLEMENTED BUT UNVERIFIED | `app/api/webhooks/stripe/route.js` |
| Durable webhook event mirror | PARTIALLY IMPLEMENTED | Fire-and-forget to D1; primary idempotency still file store |
| Paid → D1 order + fulfillment job | IMPLEMENTED BUT UNVERIFIED | `lib/stripe-orders.js`, `lib/fulfillment/jobs.js` |
| Pending Stripe orders on Workers | BROKEN risk | Pending orders in `lib/store.js` (ephemeral); webhook may create sparse order |
| VC Stripe Price bootstrap | IMPLEMENTED BUT UNVERIFIED | `scripts/stripe-bootstrap.mjs`; price created in test account historically |
| Worker Stripe secrets | BLOCKED BY CREDENTIAL / OWNER INPUT | Live webhook 503 |
| Stripe Tax Dashboard enable | BLOCKED BY OWNER INPUT | Code sends `automatic_tax`; Dashboard must enable |
| Live card E2E on production | BLOCKED BY CREDENTIAL / OWNER INPUT | |

### 3.5 Fulfillment / orders

| Area | Status | Evidence |
|------|--------|----------|
| Order statuses | COMPLETE AND VERIFIED (code) | `lib/order-status.js` |
| Fulfillment job outbox | COMPLETE AND VERIFIED (code + file tests) | `lib/fulfillment/jobs.js` |
| Auto-fulfill + RPA kill switch | COMPLETE AND VERIFIED | `lib/dropship/fulfill-order.js` |
| Duplicate prevention | IMPLEMENTED BUT UNVERIFIED | Idempotency keys on jobs |
| Tracking ingestion | PARTIALLY IMPLEMENTED / MISSING | Confirm fields; do not fake tracking |
| Owner manual fulfillment queue UX | PARTIALLY IMPLEMENTED | `/admin/fulfillment` + order detail; enrich if RPA blocked |
| Refunds / disputes admin | PARTIALLY IMPLEMENTED / MISSING | Architecture readiness; no unsafe auto-refund |

### 3.6 Admin Command Center

| Area | Status | Evidence |
|------|--------|----------|
| Owner-only auth policy | COMPLETE AND VERIFIED (unit) | `lib/admin-auth-policy.js`, no first-admin fallback |
| Unauthenticated gate live | COMPLETE AND VERIFIED | Live 307 |
| Authenticated Emily login | BLOCKED BY CREDENTIAL / OWNER INPUT | |
| Command center `/admin` | IMPLEMENTED BUT UNVERIFIED (auth’d) | KPIs, attention, connections |
| Fulfillment / integrations / system | IMPLEMENTED BUT UNVERIFIED | `app/admin/fulfillment`, `integrations`, `system` |
| Nav omits discounts/appointments/sync | PARTIALLY IMPLEMENTED | Fix discoverability |
| TOTP | PARTIALLY IMPLEMENTED | Enforced only when `ADMIN_TOTP_SECRET` set; `ADMIN_REQUIRE_TOTP` display-only |
| Login rate limit | PARTIALLY IMPLEMENTED | In-memory Map — weak across Worker isolates |

### 3.7 Consultations / future services

| Area | Status | Evidence |
|------|--------|----------|
| VC public funnel | COMPLETE AND VERIFIED (UI) | `/virtual-consultation` |
| VC checkout | PLACEHOLDER / MOCK on prod | Live returns `mock:true` without Stripe |
| Intake / photos / plan | IMPLEMENTED BUT UNVERIFIED | R2 photos binding exists |
| Scheduler Zoom URL | BLOCKED BY OWNER INPUT | `CONSULTATION_SCHEDULING_URL` |
| Future book/services architecture | DOCUMENTED ONLY / orphans | Do not resurrect public pages unless Emily asks |

### 3.8 Email / observability / security

| Area | Status | Evidence |
|------|--------|----------|
| Resend email | IMPLEMENTED BUT UNVERIFIED | `lib/email.js`; logs without key |
| Structured logs / correlation IDs | PARTIALLY IMPLEMENTED | Improve for fulfillment/webhooks |
| Admin noindex / robots | COMPLETE AND VERIFIED | Live |
| Secrets in repo | COMPLETE AND VERIFIED | `.gitignore` covers `.env.local` |

### 3.9 Memory / docs health

| Area | Status | Evidence |
|------|--------|----------|
| Continuity system | COMPLETE AND VERIFIED (exists) | `AGENTS.md`, continuity script |
| `docs/memory/ACTIVE_WORK.md` | BROKEN / stale | Still cites `51a8c68` |
| `OPEN_ITEMS.md` section 1 | BROKEN / stale | Still claims About/Services/Book live; membership live |
| Status SHA rows | PARTIALLY IMPLEMENTED | Mixed historical Worker versions |

**Your first documentation wave must reconcile these stale claims with verified truth.**

---

## 4. WAVE 0 — LOCAL SOURCE-OF-TRUTH VERIFICATION (DO THIS FIRST)

Open PowerShell. Identify the Dew Theory repo root. Then run:

```powershell
git status
git branch --show-current
git rev-parse HEAD
git remote -v
git log -15 --oneline
git fetch --all --prune
git status
git checkout main
git pull origin main
git rev-parse HEAD
```

Inspect:

```powershell
Get-ChildItem -Force
npm ci
npm test
npm run build
node scripts/check-project-continuity.mjs
cd services/skin-script-rpa
python -m pytest -q
python -m ruff check .
cd ../..
```

Live probes (safe):

```powershell
npm run smoke:routes -- https://dewtheoryco.com
# Expect: admin redirects; webhook 503 until secrets set
```

**Rules:**

- Do not reset/discard unknown local work.
- Do not force-push.
- Do not commit secrets.
- Prefer branch `cursor/supergrok-<topic>-e021` or project-conventional branch for code changes; merge via PR unless owner practice says otherwise.
- Record Wave 0 results in `docs/memory/ACTIVE_WORK.md` and append `docs/implementation/SUPERGROK_EXECUTION_LOG.md` (create if missing).

Classify every finding as:

`VERIFIED IN GITHUB` | `MUST VERIFY LOCALLY` | `MUST VERIFY WITH THIRD PARTY` | `OWNER INPUT REQUIRED`

---

## 5. SUBAGENT ORCHESTRATION

You remain lead integrator. Launch specialists **in parallel** when file ownership does not conflict.

### 5.1 Required roles

| Agent | Owns |
|-------|------|
| Repository / Architecture Auditor | Structure, dead code, conflicting models |
| Ecommerce / Catalog Agent | Products, categories, sync, activation, images package |
| Skin Script Integration Agent | Authorized channels, mappings, RPA, fallbacks |
| Stripe / Payments Agent | Checkout, webhooks, tax, idempotency, Worker secrets docs |
| Fulfillment / Order Orchestration Agent | State machine, jobs, retries, duplicate prevention, admin queue |
| Frontend / UX Agent | Storefront, cart, responsive, a11y — **no redesign** |
| Admin / Owner Operations Agent | Command center, nav gaps, integration honesty |
| Consultation / Services Agent | VC production path; future-service extensibility only |
| Security / Privacy Agent | Authz, secrets, SSRF, webhook spoofing, PII |
| Data / Database Agent | D1 schema, pending-order durability gap, migrations |
| Test / QA Agent | Unit/integration/E2E, failure injection |
| Deployment / DevOps Agent | Wrangler secrets, deploy, Fly if still required, smoke |
| Documentation / Memory Agent | Status, OPEN_ITEMS, logs, runbooks |

### 5.2 Parallelism rules

- Parallelize independent audits and non-overlapping modules.
- Do **not** parallel-edit: `lib/commerce/*`, `app/api/checkout/route.js`, `app/api/webhooks/stripe/route.js`, `wrangler.jsonc`, `package.json`/`package-lock.json`, `DEW-THEORY-CURRENT-STATUS.md`, `OPEN_ITEMS.md` without ownership.
- Every subagent must report: files inspected, files changed, tests, results, risks, blockers, assumptions, memory updates.
- Lead SuperGrok reviews, integrates, re-tests. Subagent “done” ≠ system done.

### 5.3 Subagent memory footer (mandatory)

Every subagent appends to a scoped log (e.g. `docs/implementation/SUPERGROK_EXECUTION_LOG.md` or role section) with **actual Eastern Time** at execution:

```text
Agent: <Role Name>
Date: YYYY-MM-DD
Time: HH:MM ET
Status: Completed | Partial | Blocked
Scope: ...
Files inspected: ...
Files changed: ...
Tests: ...
Results: ...
Blockers: ...
Next: ...
```

**Never put secrets or customer PII in memory files.**

---

## 6. IMPLEMENTATION WAVES (ADAPT TO REPO TRUTH)

### Wave 1 — Architecture + gap reconciliation

- Reconcile stale `OPEN_ITEMS.md` / `ACTIVE_WORK.md` / status SHA rows with Wave 0 truth.
- Map single canonical Product and Order models — **do not create duplicates**.
- Document data authority table (update `docs/ADMIN_COMMAND_CENTER_ARCHITECTURE.md` if wrong):

| Domain | Authority today |
|--------|-----------------|
| Paid shop orders / fulfillment jobs / mappings / webhook mirror | D1 `lib/commerce` |
| Pending Stripe checkout orders | `lib/store.js` (**gap** — fix in Wave 2) |
| Catalog seed | `data/products.json` + store products |
| Consultations | `lib/store.js` (ephemeral risk on Workers) |
| Funnel events | file store |
| Stripe health | live probe + env presence |
| RPA health | server probe to configured URL |

### Wave 2 — Data model / pending-order durability (HIGH PRIORITY)

**Problem:** Stripe Checkout creates `pending_payment` in ephemeral `lib/store.js`. On Cloudflare Workers multi-isolate, webhook may not find the pending order and creates a sparse order (`items: []`) — fulfillment risk.

**Required:**

- Persist pending checkout orders to D1 (or equivalent durable store) at session creation.
- Ensure webhook `markOrderPaidFromSession` loads from durable commerce first.
- Keep price snapshots server-side; never trust client unit prices.
- Add migration if schema needs fields; test file backend + document D1 path.
- Idempotency: webhook event IDs durable **and awaited** where practical.

### Wave 3 — Skin Script catalog strategy

1. **MUST VERIFY WITH THIRD PARTY:** Does Skin Script offer official API/feed/dropship? Document evidence in `docs/SKIN_SCRIPT_SYNC.md`.
2. If no API: keep CSV + verified registry; improve sync dry-run/admin honesty.
3. Separate: vendor/source fields vs owner overrides vs storefront effective fields.
4. Detection: price change, title change, missing vendor product, mapping conflict — **do not silently overwrite owner overrides**.
5. Activation gates: no live product without title, price > 0, image or documented fallback, verified mapping if fulfillment claims automated.
6. Never fabricate ingredients/claims.

### Wave 4 — Skin Script product image package (REQUIRED DELIVERABLE)

Produce a deterministic package from **assets Dew Theory is already authorized to use** (prefer existing studio assets under `public/images/products/skin-script/` and documented vendor provenance). Do not scrape unrelated editorial images. Do not strip watermarks.

Suggested structure:

```text
skin-script-product-image-package/
├── README.md
├── manifest.json
├── manifest.csv
├── categories/
│   └── <category>/
│       └── <product-slug>/
│           ├── source/
│           │   ├── primary.webp|png
│           │   └── ...
│           ├── metadata.json
│           └── README.md
└── unmapped/
```

Manifest fields: internal product ID, vendor product ID/SKU, title, slug, category, source URL, image source URL, local path, MIME, dimensions, size, sha256, role, download timestamp, provenance note, transformation status (`SOURCE_ONLY` | `READY_FOR_TRANSFORM` | …), intended storefront path.

Safety: allowlist image MIME, validate signatures, sanitize filenames, no path traversal, size/timeout caps, no SSRF to internal URLs.

ZIP name example:

```text
Dew-Theory-Skin-Script-Product-Images-YYYY-MM-DD.zip
```

Report **exact local path** to the ZIP. SuperGrok need not run ChatGPT transforms; prepare handoff for ChatGPT-5.6 Sol: keep packaging accurate, do not alter label text, replace background with Dew Theory look, consistent ecommerce framing.

### Wave 5 — Storefront

- Preserve Dew Theory brand; fix defects only.
- Ensure inactive/unmapped products cannot checkout if policy requires mapping.
- Responsive + alt text + empty/loading/error states.
- SEO: titles, sitemap, no admin indexing (already good — do not regress).
- No fake reviews / scarcity / bestseller badges without data.

### Wave 6 — Stripe production readiness

Follow `docs/STRIPE.md` and `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`.

Owner/Worker secrets (NAMES only):

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`
- `STRIPE_TAX_ENABLED`

Commands (Windows, after `wrangler login`):

```powershell
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
npx wrangler secret put STRIPE_TAX_ENABLED
npm run deploy
```

Then:

1. Enable Stripe Tax in Dashboard (or set Tax secret false).
2. Test-mode Checkout with `4242…` on production.
3. Confirm webhook marks paid + D1 order + fulfillment job.
4. Replay webhook — no duplicate fulfillment.
5. Admin integrations Stripe panel truthful; **no secrets in HTML**.

**Prohibit:** hardcoded secrets, logging PANs, trusting success URL alone, fulfilling without server-side paid confirmation.

### Wave 7 — Fulfillment

State machine — **adapt to existing statuses** (`paid`, `queued_for_supplier`, `dry_run_ready`, `submitted`, `blocked_*`, `failed`, `submission_ambiguous`, etc.). Conceptual coverage:

```text
CHECKOUT_CREATED → PAYMENT_PENDING → PAID → FULFILLMENT_QUEUED
→ SUBMITTING → SUBMITTED / VENDOR_CONFIRMED → SHIPPED
→ FAILED / MANUAL_REVIEW / CANCELED / REFUND_*
```

Rules:

- Webhook returns quickly; heavy work via job/outbox (already present — strengthen).
- Duplicate vendor order prevention mandatory.
- Never bypass CAPTCHA/MFA.
- If RPA cannot deploy: enrich **owner fulfillment queue** with copyable shipping, SKU, qty, vendor URL, payment status, margin estimate only if cost reliable, fields for vendor order ID + tracking.
- Do not label UI “automated fulfillment” while `SKIN_SCRIPT_MODE=mock` or RPA disabled.

Fly deploy (only if still required after audit):

```powershell
# OWNER INPUT: fly auth login OR FLY_API_TOKEN
cd services/skin-script-rpa
fly secrets set ...   # names from ENV.md — paste values interactively
fly deploy -a dew-theory-skin-script-rpa
# Fix PORTAL_BASE_URL vs skinscriptrx.com login after verification
```

Then Worker:

```powershell
npx wrangler secret put SKIN_SCRIPT_RPA_SERVICE_URL
npx wrangler secret put SKIN_SCRIPT_RPA_HMAC_SECRET
npx wrangler secret put SKIN_SCRIPT_USERNAME
npx wrangler secret put SKIN_SCRIPT_PASSWORD
# Only after dry-run verified: SKIN_SCRIPT_MODE=rpa, SKIN_SCRIPT_RPA_ENABLED=true, careful DRY_RUN
```

**Live supplier order:** only with Emily’s explicit authorization + saved wholesale payment method on portal.

### Wave 8 — Admin Command Center

- Keep Emily-only policy (`ADMIN_OWNER_EMAIL` / `ADMIN_EMAIL`).
- Fix nav gaps (discounts, appointments, sync) if pages remain in scope.
- Honest integration statuses: `not_configured` | `test_mode` | `manual_fulfillment` | `connected` | `degraded` | `error`.
- Ensure authenticated panels work after secrets.
- Optional: harden login rate limit for Workers (document if blocked by platform).
- Set `ADMIN_TOTP_SECRET` if 2FA desired (flag alone is insufficient).

### Wave 9 — Consultations + future services

- Wire VC to real Stripe Price after secrets.
- Scheduler URL + Resend for transactional mail.
- Minimize health-data collection; flag medical-scope questions for owner.
- Future services: ensure data model can extend (service catalog, duration, price, booking) **without** publishing `/book` `/services` unless Emily requests.

### Wave 10 — Security / privacy / reliability

Audit: authz, IDOR, CSRF, XSS, injection, SSRF (esp. RPA URL allowlist), webhook spoofing, secrets, headers, rate limits, image download safety, log redaction.

Fix material findings. Do not claim formal PCI/HIPAA certification.

### Wave 11 — Testing (gates)

Run and extend as needed:

```powershell
npm test
npm run build
npm run continuity
npm run smoke:routes -- https://dewtheoryco.com
npm run smoke -- http://localhost:3000   # if local server
cd services/skin-script-rpa; python -m pytest -q; python -m ruff check .
```

Required coverage themes:

- Catalog ingest/dedupe/missing SKU/image failure  
- Cart invalid/inactive product  
- Checkout create / cancel / fail  
- Webhook valid/invalid signature / duplicate / replay  
- Order paid → job → no duplicate fulfill  
- Admin unauthorized blocked  
- VC validation  
- Frontend smoke critical paths  

**Never** create a real vendor order solely to prove tests.

### Wave 12 — Deployment + live verification

Distinguish: local | CI | staging | production.

Production checklist:

- Homepage, shop, PDP, cart, checkout initiation  
- Admin gate  
- Webhook reachability (not 503 once secrets set)  
- D1 connectivity  
- Integration status honesty  
- No secrets in HTML  

Update:

- `DEW-THEORY-CURRENT-STATUS.md` (SHA, Worker version, exact commands/results)  
- `OPEN_ITEMS.md`  
- `docs/memory/ACTIVE_WORK.md`  
- `docs/implementation/*` logs  
- `docs/deploy/*` when deploying  

### Wave 13 — Documentation / handoff / final audit

Fresh-reviewer questions (must answer yes or fix):

- Can paid orders become orphaned?  
- Can duplicate vendor orders occur?  
- Can inactive/unmapped products sell?  
- Are secrets safe?  
- Are owner routes protected?  
- Is “automated” UI honest?  
- Can a replacement agent resume from memory files alone?

---

## 7. EXACT FILE PATHS TO KNOW

### Commerce / Stripe

- `app/api/checkout/route.js`
- `app/api/checkout/session/route.js`
- `app/api/webhooks/stripe/route.js`
- `app/api/consultations/checkout/route.js`
- `lib/stripe/config.js`
- `lib/stripe-orders.js`
- `lib/checkout.js`
- `lib/fulfillment/jobs.js`
- `lib/dropship/fulfill-order.js`
- `lib/commerce/index.js`, `d1-backend.js`, `file-backend.js`
- `scripts/stripe-bootstrap.mjs`
- `docs/STRIPE.md`
- `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`

### Skin Script / RPA

- `lib/suppliers/skin-script/index.js`, `rpa-adapter.js`, `mock-adapter.js`, `http-adapter.js`, `mapping.js`
- `data/supplier/skin-script-portal-urls.json`
- `services/skin-script-rpa/` (`app/main.py`, `fly.toml`, `Dockerfile`, `portal_flows.py`)
- `scripts/seed-verified-mappings-d1.mjs`, `scripts/e2e-rpa-live-stack.mjs`
- `docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md`, `docs/SKIN_SCRIPT_SYNC.md`
- `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md`
- `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md`

### Catalog / images

- `data/products.json`
- `public/images/products/skin-script/`
- `lib/product-image.js`, `components/ProductImage.jsx`
- `lib/catalog-sync.js`
- `docs/PRODUCT_IMAGES.md`

### Admin

- `app/admin/*`
- `components/admin/*`
- `lib/admin/*`
- `lib/admin-auth.js`, `lib/admin-auth-policy.js`, `lib/require-admin.js`, `lib/totp.js`
- `docs/ADMIN_COMMAND_CENTER_ARCHITECTURE.md`, `docs/ADMIN_COMMAND_CENTER_RUNBOOK.md`

### Deploy / CI / memory

- `wrangler.jsonc`, `open-next.config.ts`
- `.github/workflows/ci.yml`, `deploy-production.yml`
- `AGENTS.md`, `.cursor/rules/*`
- `DEW-THEORY-CURRENT-STATUS.md`, `OPEN_ITEMS.md`, `docs/memory/ACTIVE_WORK.md`
- `scripts/check-project-continuity.mjs`
- `ENV.md`, `.env.example`

---

## 8. ENVIRONMENT VARIABLE INVENTORY (NAMES ONLY)

| Variable | Purpose | Required for |
|----------|---------|--------------|
| `STRIPE_SECRET_KEY` | Server Stripe | Live checkout/webhook |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Stripe | Checkout.js if used |
| `STRIPE_WEBHOOK_SECRET` | Verify webhooks | Paid reconciliation |
| `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID` | VC Price | Paid VC |
| `STRIPE_TAX_ENABLED` | automatic_tax | Tax lines |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs | Checkout redirects |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | Admin login | Owner portal |
| `ADMIN_OWNER_EMAIL` | Emily identity | Owner-only gate |
| `ADMIN_TOTP_SECRET` / `ADMIN_REQUIRE_TOTP` | 2FA | Hardening |
| `SKIN_SCRIPT_MODE` | mock\|rpa\|http\|csv_feed | Fulfillment path |
| `SKIN_SCRIPT_RPA_ENABLED` | Kill switch | RPA purchases |
| `SKIN_SCRIPT_DRY_RUN` | Stop before Place Order | Safe testing |
| `SKIN_SCRIPT_RPA_SERVICE_URL` | RPA base URL | Adapter |
| `SKIN_SCRIPT_RPA_HMAC_SECRET` | Request auth | Adapter |
| `SKIN_SCRIPT_USERNAME` / `PASSWORD` | Portal login | RPA |
| `SKIN_SCRIPT_PORTAL_BASE_URL` / `LOGIN_URL` | Portal | RPA |
| `AUTO_FULFILL` | Auto job processing | Fulfillment |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email | Customer/owner mail |
| `CONSULTATION_SCHEDULING_URL` | Zoom/scheduler | VC ops |
| `CRON_SECRET` | Catalog cron | Sync |
| `CLOUDFLARE_API_TOKEN` / account | Deploy | CI/CD |
| `FLY_API_TOKEN` | RPA host | If Fly remains |

Never write secret **values** into Markdown.

---

## 9. OWNER / EXTERNAL BLOCKERS (DO NOT HALT ALL WORK)

Complete everything possible without these; document exact setup steps:

1. Cloudflare `wrangler login` / API token for secret put + deploy  
2. Stripe Dashboard keys + Tax enable + webhook secret on Worker  
3. Fly auth + RPA secrets (if RPA still required)  
4. Emily saved payment method on Skin Script wholesale account  
5. Explicit authorization for first live supplier order  
6. Resend domain + API key  
7. Consultation scheduler URL  
8. Skin Script official API/dropship permission confirmation (third party)  
9. Business confirmations: SPF retail price, mask size, lip variants, launch discount %  

---

## 10. LAUNCH PRIORITY ORDER

1. Storefront correctness  
2. Catalog correctness + image package  
3. Stripe payment correctness + durable pending/paid orders  
4. Canonical order persistence  
5. Fulfillment reliability (automated **or** excellent manual queue)  
6. Owner visibility (admin honesty)  
7. Customer communications  
8. Consultation readiness  
9. Future service extensibility  
10. Nonessential polish / redesign (**last**)

---

## 11. DEFINITION OF DONE

Not done merely because code compiles, a page renders, or a mock returns success.

Done means:

- [ ] Wave 0 source truth recorded with SHA  
- [ ] Pending Stripe orders durable (Workers-safe)  
- [ ] Stripe test E2E on production **or** exact secret blocker documented after code-complete  
- [ ] Webhook idempotent; no duplicate fulfillment on replay  
- [ ] Catalog + verified mappings consistent; activation safe  
- [ ] Image ZIP produced with manifest + local path  
- [ ] Fulfillment automated where authorized **or** owner queue complete and labeled honest  
- [ ] Admin owner-only; integration statuses truthful  
- [ ] VC path real or clearly mock with owner steps  
- [ ] `npm test` + `npm run build` + continuity pass  
- [ ] Production smoke distinguished from local  
- [ ] Stale OPEN_ITEMS / ACTIVE_WORK / status reconciled  
- [ ] Memory logs signed with real ET timestamps  
- [ ] Final report complete (section 12)

---

## 12. FINAL REPORT FORMAT (REQUIRED AT END)

1. Final branch  
2. Final commit SHA  
3. Major features completed  
4. Skin Script integration status (API vs RPA vs manual)  
5. Product catalog status  
6. Image ZIP absolute path  
7. Stripe test status  
8. Stripe live status  
9. Fulfillment automation status  
10. Admin status  
11. Consultation status  
12. Tests executed + results  
13. Deployment status  
14. Production smoke status  
15. Remaining owner actions  
16. Remaining third-party blockers  
17. Known defects  
18. Memory files updated  
19. Exact next action if anything remains  

---

## 13. AUTONOMY / STOP CONDITIONS

- Decide engineering details from code/docs/tests without asking the owner.  
- Escalate only genuine owner/third-party decisions.  
- Prefer safe, reversible changes.  
- Continue independent workstreams when one is blocked.  
- Before context limits: write CURRENT_STATE / ACTIVE_WORK with next exact command.  

Stop only when Definition of Done is satisfied or all remainders are explicitly blocked and documented.

---

## 14. BEGIN NOW

1. Run Wave 0 PowerShell verification.  
2. Update memory with audit results (real ET timestamps).  
3. Launch parallel subagents with non-overlapping ownership.  
4. Fix Workers pending-order durability and Stripe secret deployment path first among eng risks.  
5. Build the Skin Script image package ZIP.  
6. Advance fulfillment honesty + RPA only under authorization rules.  
7. Test, deploy if capable, document, final-report.  

**Preserve Dew Theory. Ship real commerce. Do not fake automation.**
