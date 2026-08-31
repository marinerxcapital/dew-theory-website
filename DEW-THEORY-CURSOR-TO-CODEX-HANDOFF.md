# Dew Theory — Cursor to Codex / DeepSeek-V4 Pro Handoff

> Updated: 2026-08-31 UTC by Cursor Cloud Agent  
> Branch: `cursor/skin-script-rpa-completion-e021`  
> Base: `codex/skin-script-rpa-task01-closeout` @ `3405a3e` + Cursor session 4 commits

## Verified Repository State

| Item | Value |
|------|-------|
| Repository | `marinerxcapital/dew-theory-website` |
| Production branch | `main` @ `20b7b1c` (PR #8 merged) |
| Active feature branch | `cursor/skin-script-rpa-completion-e021` |
| PR #10 | OPEN DRAFT on `codex/skin-script-rpa-task01-closeout` — superseded by new branch PR |
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

### Session 4 (this pass)

- WooCommerce portal automation profile for live `skinscript.com`
- Storage-state loading for session reuse
- Python config accepts `SKIN_SCRIPT_*` environment variable names
- Public URL registry for all 8 catalog products (`data/supplier/skin-script-portal-urls.json`)
- `npm run seed:portal-urls` operator script
- Portal recon operator scripts (no secrets in repo)
- Attempted authorized login — **password rejected by portal**

## Files Modified

- `services/skin-script-rpa/app/config.py`
- `services/skin-script-rpa/app/jobs/worker.py`
- `services/skin-script-rpa/app/jobs/portal_flows.py` (new)
- `services/skin-script-rpa/app/config/selectors-woocommerce.json` (new)
- `services/skin-script-rpa/app/browser/pages.py`
- `services/skin-script-rpa/tests/test_config.py` (new)
- `data/supplier/skin-script-portal-urls.json` (new)
- `scripts/seed-portal-url-mappings.mjs` (new)
- `scripts/skin-script-portal-recon.py` (new)
- `tests/supplier-portal-urls.test.mjs` (new)
- Memory / status docs

## Tests Executed

```bash
npm test
npm run build
npm run continuity
cd services/skin-script-rpa && python3 -m pytest -q && python3 -m ruff check .
```

## Exact Test Results

| Gate | Result |
|------|--------|
| `npm test` | 222 pass / 0 fail |
| `npm run build` | success |
| `python3 -m pytest -q` | 15 pass |
| `python3 -m ruff check .` | pass |

## Production Verification

| Check | Result |
|-------|--------|
| `https://dewtheoryco.com` | HTTP 200 (2026-08-31) |
| D1 TASK-01 order | Verified by Codex — not mutated this session |
| RPA service | Not deployed |
| Worker `SKIN_SCRIPT_MODE` | `mock` (wrangler.jsonc) |

## Skin Script Discoveries

| Topic | Finding |
|-------|---------|
| Portal | `https://skinscript.com` (WooCommerce) |
| Login | `/my-account/` — `#username`, `#password`, `button.woocommerce-form-login__submit` |
| MFA | Not observed (login failed before MFA) |
| CAPTCHA | Not observed on login attempt |
| Product URLs | `/product/{slug}/` — see `data/supplier/skin-script-portal-urls.json` |
| Lip treatment slug | `new-ageless-lip-treatment` (variants need login) |
| Hydrating serum slug | `ageless-hydrating-serum` (catalog id `hydrating-skin-serum`) |
| Payment model | Unknown — requires authenticated checkout inspection |
| Login status | **Password incorrect** for authorized email supplied to Cursor |

## Product / SKU Mapping

| Catalog `product_id` | Verified URL | Verified SKU | verified=1 |
|----------------------|--------------|--------------|------------|
| green-tea-citrus-cleanser | yes | pending login | no |
| mandelic-brightening-serum | yes | pending login | no |
| hydrating-skin-serum | yes | pending login | no |
| ageless-moisturizer | yes | pending login | no |
| botanical-bloom-hydrating-mask | yes | pending login | no |
| lip-treatment-peppermint-pomegranate | yes | pending login | no |
| cucumber-hydration-toner | yes | pending login | no |
| sheer-protection-spf | yes | pending login | no |

Interim slug used as `skin_script_sku` in seed script until real WooCommerce SKU confirmed.

## RPA Status

| Item | Status |
|------|--------|
| Mock portal E2E | Passing (15 Python tests) |
| WooCommerce flow | Implemented — not live-tested (auth blocked) |
| `dry_run` default | `true` |
| `rpa_enabled` default | `false` |
| Container | Not deployed |

## Deployment Status

- TASK-01 D1 + Worker: **VERIFIED COMPLETE** (Codex)
- TASK-05 RPA container: **NOT DEPLOYED** — no approved host

## Security Status

- No credentials in git (verified `git grep`)
- Credentials stored only in gitignored `.env.local` / `services/skin-script-rpa/.env` on agent VM
- HMAC secrets not generated in repo

## PR Status

- PR #10: draft, mergeable, CI green on `codex/skin-script-rpa-task01-closeout`
- New PR expected from `cursor/skin-script-rpa-completion-e021`

## Remaining Tasks Cursor Could Not Complete

1. Authenticated portal recon (TASK-02) — password incorrect
2. Verified SKU/price activation (TASK-03) — needs login
3. MFA session bootstrap (TASK-04) — needs login
4. RPA container deploy (TASK-05) — no container host + no Wrangler auth in Cursor Cloud
5. Real portal dry-run / live order (TASK-06) — needs 2–5 + owner live-order auth
6. PR merge (TASK-07) — owner approval

## Why Cursor Could Not Complete Them

| Task | Reason |
|------|--------|
| TASK-02–04 | Portal rejected password; cannot inspect wholesale SKU/price/cart/checkout |
| TASK-05 | No Docker deploy target; Cursor Cloud lacks Wrangler OAuth for secret wiring |
| TASK-06 | Depends on auth + deploy; no live-order test without working session |
| TASK-07 | Process gate — owner must approve merge |

## Exact External Blockers

**BLOCKER:** Skin Script portal password incorrect  
**WHY:** WooCommerce login at `skinscript.com/my-account/` returns password error for authorized email  
**WHAT CURSOR COMPLETED:** WooCommerce automation code, public URL map, login selector discovery  
**WHAT CURSOR ATTEMPTED:** Headless Playwright login, product page inspection, storage-state save  
**OWNER ACTION:** Reset Skin Script password or provide working credential via secure channel (`SKIN_SCRIPT_PASSWORD`); confirm account approved for online ordering  
**CODEX AFTER:** Login → capture SKUs/prices → `verified=1` mappings → bootstrap-session → dry-run

**BLOCKER:** RPA container not deployed  
**WHY:** No Dew Theory Railway/Fly/ECS project provisioned; Playwright cannot run on Workers  
**OWNER ACTION:** Approve container host; set `SKIN_SCRIPT_RPA_SERVICE_URL` + `SKIN_SCRIPT_RPA_HMAC_SECRET` on Worker  
**CODEX AFTER:** `docker build` → deploy → health/ready checks

## Required Owner Actions

1. Fix Skin Script portal password (or confirm correct account)
2. Approve PR merge when CI green
3. Choose RPA container host (Railway recommended in docs)
4. Authorize controlled live supplier order when dry-run passes

## Codex Execution Instructions

1. `git fetch && git checkout cursor/skin-script-rpa-completion-e021`
2. Set `SKIN_SCRIPT_*` credentials in secure env (never commit)
3. Complete TASK-02–04 after password fix
4. Deploy RPA (TASK-05) with env mapping: Worker uses `SKIN_SCRIPT_RPA_HMAC_SECRET`; container uses `HMAC_SECRET` (same value)
5. Dry-run with `SKIN_SCRIPT_DRY_RUN=true`, `SKIN_SCRIPT_RPA_ENABLED=true`, `SKIN_SCRIPT_MODE=rpa`
6. Update memory files after each milestone

## Acceptance Criteria

- All 8 products have `verified=1` mappings with real SKU + wholesale price
- Dry-run completes to checkout review without placing order
- One controlled live order with captured supplier order ID; webhook replay does not duplicate
- `npm test` 222+, pytest 15+, CI green

## Final Verification Checklist

- [ ] Portal login succeeds (Logout link visible)
- [ ] SKUs captured and seeded verified=1
- [ ] RPA `/health` and `/ready` 200 on deployed host
- [ ] Worker secrets set; `SKIN_SCRIPT_MODE=rpa`
- [ ] Dry-run job returns `dry_run_ready`
- [ ] Memory files updated with verified SHA and test counts
- [ ] No secrets in git
