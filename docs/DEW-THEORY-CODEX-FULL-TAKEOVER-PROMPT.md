# DEW THEORY — CODEX FULL TAKEOVER PROMPT

> **For:** Codex (DeepSeek-V4 Pro or equivalent)  
> **Owner:** Skyler — marinerxcapital  
> **Production:** https://dewtheoryco.com  
> **Repository:** https://github.com/marinerxcapital/dew-theory-website  
> **Last updated:** 2026-09-01 (Cursor Cloud Agent)

Copy everything below the horizontal rule into your Codex session, or use this file as the session brief.

---

## YOUR ROLE

You are Codex taking **full ownership** of the Dew Theory engineering program. Continue from verified Cursor + prior Codex work. **Do not redo completed architecture.** Your primary mission is to **finish Skin Script RPA production fulfillment** (deploy container, wire Worker secrets, seed verified mappings to D1, run controlled live validation) and keep the storefront healthy on Cloudflare Workers.

You have Wrangler OAuth for `skyler@marinerxcapital.com` (MarinerX Capital Cloudflare account). Use it for D1, Worker deploy, and secrets. **Never commit secrets, credentials, storageState, PAN/CVV, or supplier passwords.**

---

## MANDATORY PROTOCOL (READ FIRST — EVERY SESSION)

Before coding:

1. Read `DEW-THEORY-CURRENT-STATUS.md` (canonical state)
2. Read `OPEN_ITEMS.md` (blockers + business facts)
3. Read `docs/memory/ACTIVE_WORK.md` if present
4. Run: `git fetch origin && git status && git rev-parse HEAD && git log -5 --oneline`
5. **Never assume** old deployment SHA or production state from prior sessions

During work:

- Record decisions in `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md`
- Record deployments in `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md`
- Never fabricate test results, portal verification, or order confirmations

After material work:

- Update `DEW-THEORY-CURRENT-STATUS.md` with verified SHA + test counts
- Update `OPEN_ITEMS.md` when blockers resolve or new ones appear
- Run `node scripts/check-project-continuity.mjs` before finishing commerce/fulfillment PRs

Full agent rules: `AGENTS.md`

---

## REPOSITORY

| Item | Value |
|------|-------|
| GitHub | https://github.com/marinerxcapital/dew-theory-website |
| Production branch | `main` |
| Current `main` HEAD | `30e2bd0` — PR #12 merged (session 5: verified SKUs + live dry-run) |
| Prior merges | PR #11 (WooCommerce portal flow), PR #8 (RPA architecture + durable commerce) |
| Production domain | https://dewtheoryco.com (+ www) |
| Cloudflare Worker | `dew-theory` (OpenNext on Workers) |
| D1 commerce DB | `dew-theory-commerce` / ID `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` / binding `DEW_THEORY_D1` |
| Worker version (last verified) | `30e07650-5d65-4ee1-a4fc-c7f0edf005ae` — **re-verify after any deploy** |

Start every session:

```bash
git clone https://github.com/marinerxcapital/dew-theory-website
cd dew-theory-website
git fetch origin
git checkout main
git pull origin main
git rev-parse HEAD
npx wrangler whoami
```

---

## BUSINESS CONTEXT

**Dew Theory** is Emily Mitchener's brand: Skin Script retail (8 catalog products) + aesthetician services. Public site is intentionally **minimal** right now:

- **Live public routes:** Shop, product detail, cart/checkout, Virtual Consultation, 8 legal pages
- **Removed from public nav (404):** `/quiz`, `/about`, `/contact`, `/faq`, `/routine`, `/services`, `/membership`, `/book`
- **Do not reintroduce** those routes unless Emily explicitly asks

**Brand system (do not alter hex values):**

- Forest `#1E2B22`, Sage deep `#5B7356`, Sage `#93A890`, Ivory `#EDEDE6`, Stone `#C9C4B8`
- Fonts: Bodoni Moda (display), Jost (labels), Karla (body)
- PDRN is **education only** on homepage — not a bookable service or catalog SKU

**Commerce rules (confirmed):**

- Retail = wholesale × 2 (markup)
- Shipping: $7 flat, free at $49+ pre-discount subtotal (`lib/shipping.js`)
- 8 products in `data/products.json`

---

## TECH STACK

- Next.js 15 App Router, React 19, Tailwind 3.4, JavaScript (`jsconfig`)
- npm (`package-lock.json`)
- Hosting: Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler.jsonc`
- Commerce: localStorage cart → `POST /api/checkout` → Stripe or mock paid
- Durable commerce: D1 on Workers (`lib/commerce/`) + file fallback locally
- Skin Script fulfillment: Playwright RPA in `services/skin-script-rpa/` (FastAPI)
- CI: `.github/workflows/ci.yml` — node tests + python-rpa + docker-rpa

**Commands:**

```bash
npm ci
npm test                    # expect 223+ pass
npm run build
npm run continuity
npm run smoke:routes -- https://dewtheoryco.com
npm run deploy              # requires wrangler auth
npm run setup:d1            # remote D1 migration (wrangler auth)
npm run setup:d1:local      # local D1 schema only
npm run seed:mappings       # verified=0 templates
npm run seed:portal-urls    # URL-only mappings (verified=0)
npm run seed:verified-mappings  # verified=1 from portal registry

cd services/skin-script-rpa
python3 -m pip install -e ".[dev]"
python3 -m playwright install chromium
python3 -m pytest -q        # expect 15 pass
python3 -m ruff check .
docker build -t dew-theory-skin-script-rpa .
```

---

## ARCHITECTURE — SKIN SCRIPT FULFILLMENT (PRESERVE — DO NOT REVERT)

```
Customer checkout → Stripe payment (or mock paid)
  → webhook signature verified
  → durable order in DEW_THEORY_D1 (or file store locally)
  → fulfillment job outbox (idempotent)
  → lib/suppliers/skin-script/rpa-adapter.js (HMAC signed)
  → services/skin-script-rpa (FastAPI + Playwright on container host)
  → Skin Script wholesale portal (WooCommerce) OR mock portal in CI
```

**Key paths:**

| Layer | Path |
|-------|------|
| Commerce DB | `lib/commerce/` |
| Fulfillment jobs | `lib/fulfillment/jobs.js` |
| State machine | `lib/fulfillment/state-machine.js` |
| Supplier mappings | `lib/suppliers/skin-script/mapping.js` |
| RPA adapter | `lib/suppliers/skin-script/rpa-adapter.js` |
| HMAC auth | `lib/internal/hmac-auth.js` |
| RPA service | `services/skin-script-rpa/` |
| WooCommerce flow | `services/skin-script-rpa/app/jobs/portal_flows.py` |
| WooCommerce selectors | `services/skin-script-rpa/app/config/selectors-woocommerce.json` |
| Mock portal (CI) | `services/mock-supplier-portal/server.py` |
| Portal URL + SKU registry | `data/supplier/skin-script-portal-urls.json` |
| D1 migration | `migrations/001_commerce_schema.sql` |
| ADR | `docs/decisions/ADR-001-SKIN-SCRIPT-RPA.md` |

**Modes (`SKIN_SCRIPT_MODE` in wrangler.jsonc — currently `mock`):**

- `mock` — offline mock adapter (default dev/CI)
- `rpa` — Playwright service (production target)

Production live orders require:

- `SKIN_SCRIPT_MODE=rpa`
- `SKIN_SCRIPT_RPA_ENABLED=true`
- `SKIN_SCRIPT_DRY_RUN=false`
- `verified=1` supplier mappings for every line item in D1
- RPA container deployed and reachable from Worker

**Kill switch:** `SKIN_SCRIPT_RPA_ENABLED=false` — jobs queue but no supplier purchases.

**Blocked states (never bypass):** CAPTCHA, MFA, payment challenges → `blocked_human_verification` / `blocked_payment_authentication`. Use alerts, not workarounds.

---

## TASK STATUS — SKIN SCRIPT RPA PROGRAM

| Task | Status | Who |
|------|--------|-----|
| TASK-01 D1 provision + Worker deploy + mock paid order in D1 | **COMPLETE** | Codex (2026-08-31) |
| TASK-02 Portal recon (authenticated) | **COMPLETE** | Cursor session 5 |
| TASK-03 Verified SKU mappings (8/8 products) | **COMPLETE** (registry + seed script; **D1 seed pending**) | Cursor |
| TASK-04 Session bootstrap | **PARTIAL** — storage-state loading works; container secret mount pending | Cursor |
| TASK-05 RPA container deploy + Worker HMAC secrets | **NOT DONE** | **Codex** |
| TASK-06 Live validation | Dry-run **LIVE VERIFIED**; live supplier order **NOT DONE** | Codex + owner |
| TASK-07 PR merges | PR #8, #11, #12 **MERGED** to main | Done |

**Codex TASK-01 evidence (do not mutate without reason):**

- Test order: `ord_1788210773973` / job `fj_1788210774554_5y45fov`
- D1 readback confirmed durable order + fulfillment job after redeploy

---

## WHAT CURSOR COMPLETED (DO NOT REDO)

1. **Durable commerce layer** — D1 + file backends, fulfillment outbox, state machine
2. **RPA FastAPI service** — HMAC auth, Docker, Playwright worker, job API
3. **Mock portal CI** — dynamic server + 9 E2E scenarios + 11 Node failure-injection tests
4. **WooCommerce portal profile** — live-verified against real Skin Script portal
5. **Login domain fix** — canonical entry is `https://skinscriptrx.com/my-account/` (NOT `skinscript.com/my-account/`)
6. **Verified SKU registry** — all 8 products with variant SKUs + portal wholesale prices
7. **Live dry-run** — RPA worker returns `dry_run_ready` against real portal
8. **Operator scripts** — `seed:portal-urls`, `seed:verified-mappings`, portal recon tools
9. **Merge conflicts resolved** — session 5 live-verified state kept over stale session 4 placeholders

---

## SKIN SCRIPT PORTAL — VERIFIED FACTS (NO SECRETS IN REPO)

| Topic | Finding |
|-------|---------|
| Login entry URL | `https://skinscriptrx.com/my-account/` |
| Portal base after auth | `https://skinscript.com` (redirect/session lands here; "Hi, Emily!") |
| Account name | Emily (`SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME=Emily`) |
| MFA / CAPTCHA | Not observed on login (re-check if portal changes) |
| Cart API | `/wp-json/wc/store/v1/cart` |
| Dropship select | `#order-srx-srx_drop_ship_select` → "Yes - Ship direct to client" |
| Checkout | WooCommerce Blocks; Place Order button text `Place Order` |
| Payment gateway | NMI (`wc-payment-method-options-nmi`) |
| Saved payment methods | **NONE on account** — owner must add before live orders |
| Client dropship address | Many shipping fields **readonly** in headless checkout — map editable fields in **headed** session for production live fill |
| Dry-run `total_cents` | Checkout **grand total** (product + shipping/fees), not line subtotal alone |

**Credentials:** Owner supplied via password manager / secure env only. Set in:

- Worker secrets: `SKIN_SCRIPT_USERNAME`, `SKIN_SCRIPT_PASSWORD`, etc.
- Container env: `USERNAME`, `PASSWORD`, etc.
- Local: `.env.local`, `services/skin-script-rpa/.env` (gitignored)
- **Never commit credential values**

---

## VERIFIED PRODUCT / SKU MAPPING (verified=1)

Source: `data/supplier/skin-script-portal-urls.json`

| Catalog `product_id` | Portal SKU | Wholesale | Portal URL slug |
|----------------------|------------|-----------|-----------------|
| green-tea-citrus-cleanser | 1010240 | $18.00 | green-tea-citrus-cleanser |
| mandelic-brightening-serum | 1310440 | $24.00 | mandelic-brightening-serum |
| hydrating-skin-serum | 1310340 | $22.50 | ageless-hydrating-serum |
| ageless-moisturizer | 1510240 | $15.00 | ageless-skin-moisturizer |
| botanical-bloom-hydrating-mask | 2110640 | $24.00 | botanical-bloom-hydrating-mask |
| lip-treatment-peppermint-pomegranate | 1410240 | $8.00 | new-ageless-lip-treatment |
| cucumber-hydration-toner | 1210140 | $14.00 | cucumber-hydration-toner |
| sheer-protection-spf | 1610140 | $17.00 | sheer-protection-spf-30 |

SKUs are **variant-level** (e.g. 1010240 = 6.4 oz green tea cleanser).

---

## YOUR REMAINING WORK (PRIORITY ORDER)

### PHASE 1 — Merge state verification

1. Confirm `main` @ `30e2bd0` or later includes PR #12
2. Run full test suite; record exact counts in status doc
3. `npm run smoke:routes -- https://dewtheoryco.com`

### PHASE 2 — Seed verified mappings to production D1

```bash
# Against remote D1 (requires wrangler auth + DEW_THEORY_D1 configured)
STORE_BACKEND=d1 npm run seed:verified-mappings
# Verify supplier_mappings rows: verified=1, correct SKUs, wholesale prices
```

### PHASE 3 — Deploy RPA container (TASK-05)

1. **Choose/provision container host** under Dew Theory (Railway, Fly.io, ECS — NOT CertaMaris)
2. Build and deploy:

   ```bash
   docker build -t dew-theory-skin-script-rpa services/skin-script-rpa
   ```

3. Container env (names — get values from owner secure channel):

   ```
   HMAC_SECRET=                    # generate strong random; same value on Worker
   PORTAL_BASE_URL=https://skinscript.com
   LOGIN_URL=https://skinscriptrx.com/my-account/
   USERNAME=                       # emilyberit1@gmail.com (owner)
   PASSWORD=                       # owner secure channel
   EXPECTED_ACCOUNT_NAME=Emily
   DRY_RUN=true                    # keep true until dry-run passes from Worker path
   RPA_ENABLED=true
   MOCK_PORTAL=false
   STORAGE_STATE_PATH=/data/skin-script-storage.json
   ```

4. Verify endpoints: `GET /health` → 200, `GET /ready` → 200
5. Worker secrets via `wrangler secret put`:

   ```
   SKIN_SCRIPT_RPA_HMAC_SECRET     # same as container HMAC_SECRET
   SKIN_SCRIPT_RPA_SERVICE_URL     # public URL of deployed RPA service
   SKIN_SCRIPT_USERNAME
   SKIN_SCRIPT_PASSWORD
   SKIN_SCRIPT_PORTAL_BASE_URL=https://skinscript.com
   SKIN_SCRIPT_LOGIN_URL=https://skinscriptrx.com/my-account/
   SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME=Emily
   ```

6. Keep `SKIN_SCRIPT_RPA_ENABLED=false` and `SKIN_SCRIPT_MODE=mock` until Phase 4 dry-run passes
7. Log deployment in `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md`

### PHASE 4 — End-to-end dry-run from Worker path

1. Set Worker vars: `SKIN_SCRIPT_MODE=rpa`, `SKIN_SCRIPT_RPA_ENABLED=true`, `SKIN_SCRIPT_DRY_RUN=true`
2. Trigger fulfillment job for a test order (or create mock paid order)
3. Confirm RPA job returns `dry_run_ready` with correct SKU metadata
4. Confirm idempotency: replay does not duplicate supplier purchase

### PHASE 5 — Headed checkout mapping (TASK-06 partial)

1. Run headed Playwright session against real checkout
2. Map **editable** client dropship address fields when dropship = "Ship direct to client"
3. Update `selectors-woocommerce.json` + `portal_flows.py` if needed
4. Do **not** bypass readonly fields — document what portal requires

### PHASE 6 — Live supplier order (TASK-06 — requires owner)

**BLOCKER:** No saved payment method on Skin Script wholesale account.

1. Owner adds saved card / approved payment method on Skin Script portal
2. Owner authorizes **one controlled test order** (single low-cost SKU, e.g. green tea cleanser)
3. Set `SKIN_SCRIPT_DRY_RUN=false` only for that controlled test
4. Capture supplier order ID; verify webhook replay does not duplicate
5. Set `AUTO_FULFILL=true` only after success

### PHASE 7 — Production enablement

1. `npm run deploy` if Worker config changed
2. Verify production smoke + D1 readback
3. Update all memory files with verified SHA, Worker version ID, test counts
4. Set `FULFILLMENT_ALERT_WEBHOOK_URL` if owner provides

---

## ENVIRONMENT VARIABLE NAMES (NEVER COMMIT VALUES)

See `ENV.md` and `.env.example`. Critical Skin Script / RPA names:

**Worker:**

```
SKIN_SCRIPT_MODE=mock|rpa
SKIN_SCRIPT_RPA_ENABLED=false|true
SKIN_SCRIPT_RPA_SERVICE_URL=
SKIN_SCRIPT_RPA_HMAC_SECRET=
SKIN_SCRIPT_PORTAL_BASE_URL=
SKIN_SCRIPT_LOGIN_URL=
SKIN_SCRIPT_USERNAME=
SKIN_SCRIPT_PASSWORD=
SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME=
SKIN_SCRIPT_DRY_RUN=true|false
SKIN_SCRIPT_MAX_ORDER_TOTAL_CENTS=50000
SKIN_SCRIPT_MAX_LINE_QUANTITY=6
SKIN_SCRIPT_PRICE_TOLERANCE_PERCENT=5
AUTO_FULFILL=true|false
FULFILLMENT_ALERT_WEBHOOK_URL=
```

**RPA container** (unprefixed aliases also work via `app/config.py`):

```
HMAC_SECRET=              # same as SKIN_SCRIPT_RPA_HMAC_SECRET
PORTAL_BASE_URL=
LOGIN_URL=
USERNAME=
PASSWORD=
EXPECTED_ACCOUNT_NAME=
DRY_RUN=
RPA_ENABLED=
MOCK_PORTAL=false
STORAGE_STATE_PATH=
```

**Other production secrets (owner):**

```
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
RESEND_API_KEY, EMAIL_FROM
GOOGLE_CALENDAR_*
ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
```

---

## OPEN BUSINESS ITEMS (NOT YOUR BLOCKER FOR RPA — BUT KNOW THEM)

See `OPEN_ITEMS.md`. Highlights:

- Stripe live keys not connected (mock checkout works)
- Service menu prices invented — Emily must confirm
- Virtual consultation needs Stripe Price ID + scheduler URL for go-live
- Membership prices unset (`MEMBERSHIP_PACKAGES_JSON`)
- Emily portrait / studio photography pending
- Discount code `DEW15` is 15% **placeholder**

---

## NEVER DO

- Commit secrets, storageState, PAN/CVV, supplier credentials
- Invent supplier selectors, SKUs, order confirmations, or portal verification
- Bypass CAPTCHA/MFA or duplicate supplier purchases
- Login at `skinscript.com/my-account/` — use `skinscriptrx.com/my-account/`
- Revert verified SKU registry or WooCommerce portal flow without explicit owner approval
- Reintroduce removed public routes (quiz, about, contact, faq, etc.) without Emily approval
- Fabricate test results or deployment evidence
- Leave memory files stale after commerce/fulfillment changes

---

## ACCEPTANCE CRITERIA — DEFINITION OF DONE

- [x] All 8 products have verified SKU + wholesale in registry (Cursor)
- [x] Live portal dry-run returns `dry_run_ready` (Cursor)
- [ ] `verified=1` mappings seeded in production D1
- [ ] RPA container deployed; `/health` and `/ready` return 200
- [ ] Worker secrets set; signed dry-run job succeeds from Worker → RPA → portal
- [ ] Client dropship address fields mapped for live fill (headed session)
- [ ] Owner saved payment method on Skin Script account
- [ ] One controlled live supplier order with captured supplier order ID
- [ ] Webhook/idempotency replay does not duplicate supplier purchase
- [ ] `npm test` 223+ pass, pytest 15+ pass, CI green
- [ ] `npm run continuity` OK
- [ ] `DEW-THEORY-CURRENT-STATUS.md` updated with verified SHA + Worker version + test counts
- [ ] No secrets in git (`git grep` credential patterns)

---

## REFERENCE DOCS (READ AS NEEDED)

| Doc | Purpose |
|-----|---------|
| `DEW-THEORY-CURRENT-STATUS.md` | Canonical project state |
| `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md` | Latest Cursor handoff |
| `OPEN_ITEMS.md` | Blockers + business facts |
| `docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md` | Architecture overview |
| `docs/SKIN_SCRIPT_RPA_RUNBOOK.md` | Ops runbook |
| `docs/SKIN_SCRIPT_RPA_DEPLOYMENT.md` | Deploy steps |
| `docs/SKIN_SCRIPT_RPA_SECURITY.md` | Security model |
| `docs/SKIN_SCRIPT_RPA_TESTING.md` | Test strategy |
| `docs/SKIN_SCRIPT_RPA_TROUBLESHOOTING.md` | Failure modes |
| `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md` | Deployment history |
| `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md` | Implementation history |
| `docs/decisions/ADR-001-SKIN-SCRIPT-RPA.md` | Architecture decision record |
| `docs/DEPLOY_DEWTHEORYCO.md` | Cloudflare deploy guide |

---

## FIRST MESSAGE TO CODEX (OPTIONAL SHORTCUT)

Paste this after the full prompt above if you want Codex to start immediately:

> Start on `main`. Verify HEAD and wrangler auth. Run tests. Seed verified mappings to production D1. Deploy RPA container to [Railway/Fly — owner choice]. Wire Worker secrets. Run Worker-path dry-run. Report blockers. Update memory files with verified evidence only.

---

*End of Codex takeover prompt.*
