# Dew Theory — Cursor to Codex / DeepSeek-V4 Pro Handoff

> Updated: 2026-09-01 UTC by Cursor Cloud Agent  
> Branch: `cursor/skin-script-rpa-completion-e021`  
> Base: `main` @ `5d2ec20` (PR #11 merged) + session 5 commits

## Verified Repository State

| Item | Value |
|------|-------|
| Repository | `marinerxcapital/dew-theory-website` |
| Production branch | `main` @ `5d2ec20` (PR #11 merged session 4) |
| Active feature branch | `cursor/skin-script-rpa-completion-e021` |
| Session 5 PR | **Pending** — verified SKUs + live dry-run (not yet on main) |
| D1 ID | `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` |
| Worker | `dew-theory` — last verified version `30e07650-5d65-4ee1-a4fc-c7f0edf005ae` |
| Test order | `ord_1788210773973` / job `fj_1788210774554_5y45fov` |

## Branch

`cursor/skin-script-rpa-completion-e021`

## HEAD

Verify: `git rev-parse HEAD` after pulling this branch.

## Work Completed by Cursor

### Prior sessions (preserved — do not revert)

- Durable commerce (D1 + file), fulfillment outbox, state machine
- RPA FastAPI service, HMAC auth, mock portal, CI (node + python-rpa + docker-rpa)
- Codex TASK-01: D1 provisioned, Worker deployed, mock paid order in D1
- PR #11 merged: WooCommerce portal flow, public URL registry, session 4 closeout

### Session 5 (this pass)

- **Authenticated login** via `https://skinscriptrx.com/my-account/` (canonical entry)
- **Verified SKUs + wholesale prices** for all 8 catalog products in `data/supplier/skin-script-portal-urls.json`
- `npm run seed:verified-mappings` for `verified=1` D1/file templates
- WooCommerce flow improvements: cart API verification, dropship select, cart clear hardening
- **Live portal dry-run verified** — RPA worker returns `dry_run_ready` against real portal
- Login verify script uses `SKIN_SCRIPT_LOGIN_URL` env (skinscriptrx.com)

## Files Modified (session 5)

- `data/supplier/skin-script-portal-urls.json` — verified SKUs/prices
- `services/skin-script-rpa/app/jobs/portal_flows.py`
- `scripts/seed-verified-supplier-mappings.mjs` (new)
- `scripts/skin-script-login-verify.py`
- Memory / status / handoff docs

## Tests Executed

```bash
npm test
npm run continuity
cd services/skin-script-rpa && python3 -m pytest -q && python3 -m ruff check .
```

## Exact Test Results

| Gate | Result |
|------|--------|
| `npm test` | 223 pass / 0 fail |
| `python3 -m pytest -q` | 15 pass |
| `python3 -m ruff check .` | pass |
| `npm run continuity` | OK |
| Live dry-run (portal) | `dry_run_ready` |

## Production Verification

| Check | Result |
|-------|--------|
| `https://dewtheoryco.com` | HTTP 200 |
| D1 TASK-01 order | Verified by Codex — not mutated |
| RPA service | Not deployed |
| Worker `SKIN_SCRIPT_MODE` | `mock` (wrangler.jsonc) |

## Skin Script Discoveries

| Topic | Finding |
|-------|---------|
| Login entry | `https://skinscriptrx.com/my-account/` (**not** `skinscript.com/my-account/`) |
| Portal base | `https://skinscript.com` after auth redirect |
| MFA | Not observed |
| CAPTCHA | Not observed on login |
| Cart API | `/wp-json/wc/store/v1/cart` |
| Dropship | `#order-srx-srx_drop_ship_select` → “Yes - Ship direct to client” |
| Payment | NMI; **no saved payment methods** on Emily account |
| Checkout totals | Dry-run `total_cents` is grand total (product + shipping/fees) |

## Product / SKU Mapping (verified=1)

| Catalog `product_id` | SKU | Wholesale |
|----------------------|-----|-----------|
| green-tea-citrus-cleanser | 1010240 | $18.00 |
| mandelic-brightening-serum | 1310440 | $24.00 |
| hydrating-skin-serum | 1310340 | $22.50 |
| ageless-moisturizer | 1510240 | $15.00 |
| botanical-bloom-hydrating-mask | 2110640 | $24.00 |
| lip-treatment-peppermint-pomegranate | 1410240 | $8.00 |
| cucumber-hydration-toner | 1210140 | $14.00 |
| sheer-protection-spf | 1610140 | $17.00 |

Source: `data/supplier/skin-script-portal-urls.json`

## RPA Status

| Item | Status |
|------|--------|
| Mock portal E2E | Passing (15 Python tests) |
| WooCommerce live flow | **Live dry-run verified** |
| `dry_run` default | `true` |
| `rpa_enabled` default | `false` |
| Container | Not deployed |

## Deployment Status

- TASK-01 D1 + Worker: **VERIFIED COMPLETE** (Codex)
- TASK-02 Portal recon: **COMPLETE** (Cursor session 5)
- TASK-03 Verified mappings: **COMPLETE** (registry + seed script; run on production D1)
- TASK-04 Session bootstrap: **PARTIAL** — storage-state load + saved session file
- TASK-05 RPA container: **NOT DEPLOYED**
- TASK-06 Live validation: **Dry-run LIVE VERIFIED**; live order blocked
- TASK-07 PR merge: PR #11 merged (session 4); session 5 PR pending

## Remaining Tasks (Codex / owner)

1. **TASK-05** — Deploy RPA container; set `SKIN_SCRIPT_RPA_HMAC_SECRET` + `SKIN_SCRIPT_RPA_SERVICE_URL` on Worker
2. **TASK-06** — Owner adds saved payment method; map client dropship address fields in headed checkout; controlled live order
3. **TASK-07** — Merge session 5 PR when CI green
4. Run `npm run seed:verified-mappings` against production D1

## Why Cursor Could Not Complete Them

| Task | Reason |
|------|--------|
| TASK-05 | No approved container host; Cursor Cloud lacks Wrangler OAuth for secret wiring |
| TASK-06 live order | No saved payment method; client address fields readonly in headless checkout |
| TASK-07 session 5 | Owner approval for new PR |

## Required Owner Actions

1. Add saved payment method on Skin Script wholesale account
2. Approve session 5 PR merge when CI green
3. Choose RPA container host (Railway/Fly/ECS under Dew Theory)
4. Authorize controlled live supplier order when TASK-05 complete

## Codex Execution Instructions

1. `git fetch && git checkout cursor/skin-script-rpa-completion-e021`
2. Merge session 5 PR or pull branch after merge
3. `npm run seed:verified-mappings` on production D1
4. Deploy RPA (TASK-05): container env `HMAC_SECRET`, `PORTAL_BASE_URL`, `LOGIN_URL`, `USERNAME`, `PASSWORD`, `EXPECTED_ACCOUNT_NAME=Emily`
5. Worker secrets: `SKIN_SCRIPT_RPA_*` (same HMAC value)
6. Dry-run: `SKIN_SCRIPT_DRY_RUN=true`, `SKIN_SCRIPT_RPA_ENABLED=true`, `SKIN_SCRIPT_MODE=rpa`
7. Headed session: map editable client dropship address inputs for live orders

## Acceptance Criteria

- [x] All 8 products have verified SKU + wholesale price in registry
- [x] Dry-run completes to checkout review (`dry_run_ready`)
- [ ] One controlled live order with supplier order ID; webhook replay does not duplicate
- [x] `npm test` 223+, pytest 15+, CI green

## Final Verification Checklist

- [x] Portal login succeeds (Logout / “Hi, Emily!” visible)
- [x] SKUs captured in verified registry
- [ ] RPA `/health` and `/ready` 200 on deployed host
- [ ] Worker secrets set; `SKIN_SCRIPT_MODE=rpa`
- [x] Dry-run job returns `dry_run_ready`
- [x] Memory files updated with verified SHA and test counts
- [x] No secrets in git
