# Dew Theory — Codex / DeepSeek-V4 Pro Remaining Work Prompt

Copy everything below this line into your Codex session.

---

## Identity

You are Codex running DeepSeek-V4 Pro. Continue from Cursor's verified state — do not redo completed work.

## Repository State

| Item | Value |
|------|-------|
| Repository | `marinerxcapital/dew-theory-website` |
| Branch | `cursor/skin-script-rpa-completion-e021` |
| PR | #11 (draft) |
| HEAD | Run `git rev-parse HEAD` after pull |

## Cursor Completed — DO NOT REDO

- TASK-01 D1 provisioned and production-verified (Codex)
- WooCommerce RPA portal flow + mock portal CI (15 Python / 222 Node tests)
- **Authenticated login** via `https://skinscriptrx.com/my-account/`
- **Verified SKUs + wholesale prices** for 8 products in `data/supplier/skin-script-portal-urls.json`
- `npm run seed:verified-mappings` for verified=1 D1/file mappings
- **Live portal dry-run** returns `dry_run_ready` (RPA worker against skinscript.com)

## Remaining Tasks

### TASK-05 — Deploy RPA container + Worker secrets

| Field | Detail |
|-------|--------|
| STATUS | NOT DEPLOYED |
| WHY CURSOR COULD NOT | No approved container host; no Wrangler OAuth in Cursor Cloud |
| FILES | `services/skin-script-rpa/Dockerfile`, `wrangler.jsonc`, `ENV.md` |
| ENV | Container: `HMAC_SECRET`, `PORTAL_BASE_URL`, `LOGIN_URL`, `USERNAME`, `PASSWORD`, `EXPECTED_ACCOUNT_NAME=Emily`. Worker: `SKIN_SCRIPT_RPA_*` |
| ACCEPTANCE | `/health` 200; signed dry-run job from Worker |

### TASK-06 — Live supplier order (partial)

| Field | Detail |
|-------|--------|
| STATUS | Dry-run LIVE VERIFIED; live order NOT DONE |
| BLOCKERS | (1) No saved payment methods on Skin Script account. (2) Client dropship address fields may be readonly in headless checkout — map editable client-address inputs in headed session. (3) TASK-05 deploy required for production Worker path. |
| OWNER ACTION | Add saved card or approved payment method on Skin Script wholesale account; authorize one controlled test order |
| ACCEPTANCE | One supplier order ID captured; idempotent replay does not duplicate |

### TASK-04 — Session bootstrap (minor)

| Field | Detail |
|-------|--------|
| STATUS | Storage-state loading implemented; session file saved during recon |
| REMAINING | Mount storage state in container secret store; optional headed `bootstrap-session` refresh |

### TASK-07 — PR merge

| STATUS | OWNER ACTION REQUIRED — approve and merge PR #11 |

## Portal Reference (no secrets)

- Login: `https://skinscriptrx.com/my-account/`
- Portal base: `https://skinscript.com`
- Dropship select: `#order-srx-srx_drop_ship_select` → `Yes - Ship direct to client`
- Checkout: WooCommerce blocks; Place Order button text `Place Order`
- Payment: NMI (`wc-payment-method-options-nmi`); account currently has no saved methods

## Memory

Update `DEW-THEORY-CURRENT-STATUS.md`, implementation log, deployment log, `OPEN_ITEMS.md` after each milestone.

## Preservation

Do not revert verified SKU registry, WooCommerce portal flow, or D1 configuration.
