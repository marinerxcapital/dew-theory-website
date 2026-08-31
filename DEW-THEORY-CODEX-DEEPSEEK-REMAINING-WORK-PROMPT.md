# Dew Theory — Codex / DeepSeek-V4 Pro Remaining Work Prompt

Copy everything below this line into your Codex session running DeepSeek-V4 Pro.

---

## Identity

You are Codex running DeepSeek-V4 Pro at maximum available intelligence. Execute remaining work — do not re-audit or redo completed Cursor implementation.

## Repository Context

| Item | Value |
|------|-------|
| Repository | `https://github.com/marinerxcapital/dew-theory-website` |
| Branch | `cursor/skin-script-rpa-completion-e021` |
| HEAD | Run `git rev-parse HEAD` after checkout |
| Base merged | PR #8 @ `20b7b1c` on `main` |
| Active PR | New PR from `cursor/skin-script-rpa-completion-e021` (or update PR #10) |
| D1 | `dew-theory-commerce` / `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` |

## Cursor Completion Summary — DO NOT REDO

- Durable commerce + D1 (TASK-01 VERIFIED by Codex)
- Fulfillment job outbox, state machine, HMAC RPA adapter
- Mock portal + 222 Node / 15 Python tests passing
- WooCommerce portal flow (`portal_flows.py`, `selectors-woocommerce.json`)
- Storage-state loading in RPA worker
- Public URL map: `data/supplier/skin-script-portal-urls.json` (8 products)
- `npm run seed:portal-urls` for unverified URL templates
- Login selectors discovered for skinscript.com WooCommerce

## Remaining Tasks

### TASK-02 — Authenticated portal reconnaissance

| Field | Detail |
|-------|--------|
| CURRENT STATUS | BLOCKED — password incorrect |
| WHY CURSOR COULD NOT COMPLETE | Portal rejected authorized email password at `/my-account/` |
| DEPENDENCIES | Owner resets password or provides working `SKIN_SCRIPT_PASSWORD` |
| FILES | `data/supplier/skin-script-portal-urls.json`, `selectors-woocommerce.json`, mappings |
| COMMANDS | `python3 scripts/skin-script-portal-recon.py` with env from `.env.local` |
| EXPECTED | Capture SKU text from `.sku`, wholesale prices, cart/checkout field names |
| TESTS | Update mappings; optional live integration test behind env flag |
| ACCEPTANCE | Selectors match live DOM; no fabricated SKUs |

### TASK-03 — Verify supplier mappings

| Field | Detail |
|-------|--------|
| CURRENT STATUS | URL-only templates (verified=0) |
| WHY CURSOR COULD NOT COMPLETE | Wholesale SKU/price hidden without login |
| DEPENDENCIES | TASK-02 |
| FILES | `lib/suppliers/skin-script/mapping.js`, D1 `supplier_mappings` |
| COMMANDS | `npm run seed:portal-urls` then upsert verified=1 with real SKU/price |
| ACCEPTANCE | RPA dry-run passes mapping validation for all 8 products |

### TASK-04 — Session bootstrap

| Field | Detail |
|-------|--------|
| CURRENT STATUS | CLI exists; storage-state load implemented |
| WHY CURSOR COULD NOT COMPLETE | Cannot complete MFA/login without valid password |
| DEPENDENCIES | TASK-02 password fix |
| COMMANDS | `cd services/skin-script-rpa && python -m app.cli bootstrap-session` (headed) |
| SECRET NAMES | `SKIN_SCRIPT_STORAGE_STATE` / mount path in container |
| ACCEPTANCE | Worker loads storage state; logout link visible in session |

### TASK-05 — Deploy RPA container + Worker secrets

| Field | Detail |
|-------|--------|
| CURRENT STATUS | Dockerfile + CI docker-rpa green; not deployed |
| WHY CURSOR COULD NOT COMPLETE | No approved container host; no Wrangler OAuth in Cursor Cloud |
| DEPENDENCIES | Owner picks Railway/Fly/ECS under Dew Theory (not CertaMaris) |
| FILES | `services/skin-script-rpa/Dockerfile`, `wrangler.jsonc`, `ENV.md` |
| COMMANDS | `docker build -t dew-theory-skin-script-rpa services/skin-script-rpa` |
| ENV NOTE | Container: `HMAC_SECRET`, `PORTAL_BASE_URL`, `USERNAME`, `PASSWORD`. Worker: `SKIN_SCRIPT_RPA_HMAC_SECRET`, `SKIN_SCRIPT_RPA_SERVICE_URL` |
| ACCEPTANCE | `/health` 200; signed dry-run job from Worker |

### TASK-06 — Dry-run then controlled live validation

| Field | Detail |
|-------|--------|
| CURRENT STATUS | Mock portal only |
| WHY CURSOR COULD NOT COMPLETE | Needs TASK-02–05 + explicit live-order authorization |
| COMMANDS | `SKIN_SCRIPT_DRY_RUN=true` first; then single controlled order |
| ACCEPTANCE | One supplier order ID captured; idempotent replay does not duplicate |

### TASK-07 — PR merge

| Field | Detail |
|-------|--------|
| CURRENT STATUS | OWNER ACTION REQUIRED |
| WHY | Draft PR requires owner approval |
| ACCEPTANCE | Merge after CI green + review |

## Memory Requirement

After each task, update: `DEW-THEORY-CURRENT-STATUS.md`, `docs/memory/ACTIVE_WORK.md`, `OPEN_ITEMS.md`, `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md`, `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md`, `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.

## Source Truth

`git fetch origin && git checkout cursor/skin-script-rpa-completion-e021 && git log -5 --oneline`

## Preservation Requirement

Do not revert WooCommerce portal flow, URL registry, storage-state loading, or D1 configuration.

## Completion Requirement

Execute work with evidence (test output, D1 readback, health checks) — not audit-only.

## Owner Actions (immediate)

1. **Reset Skin Script portal password** for wholesale account email (authorized for Dew Theory) — Cursor login failed with "password incorrect"
2. **Approve PR merge** when ready
3. **Approve RPA container host** (Railway/Fly/ECS under MarinerX/Dew Theory)
4. **Authorize single live supplier test order** after dry-run passes
