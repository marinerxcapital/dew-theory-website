# Active Work — Dew Theory

**Last updated:** 2026-08-31 (Cursor Cloud Agent)  
**Branch:** `cursor/skin-script-rpa-completion-e021`  
**HEAD:** (see git after push)

## In progress

Skin Script RPA — WooCommerce portal flow implemented; live auth blocked by incorrect portal password.

## Completed this session (Cursor)

- WooCommerce portal profile + `selectors-woocommerce.json` for skinscript.com
- `portal_flows.py` (mock vs WooCommerce); storage-state loading in worker
- Python config accepts `SKIN_SCRIPT_*` env aliases
- Public portal URL registry: `data/supplier/skin-script-portal-urls.json` (8/8 catalog products)
- `npm run seed:portal-urls` script
- Portal recon operator scripts (`scripts/skin-script-portal-recon.py`)
- Tests: 222 Node / 15 Python pass; build + continuity gates

## Blocked — owner action

1. **Portal password incorrect** — `emilyberit1@gmail.com` rejected at https://skinscript.com/my-account/ (WooCommerce error). Reset password or confirm correct wholesale account.
2. **PR #10 merge** — owner approval required
3. **RPA container deploy (TASK-05)** — choose Dew Theory host (Railway/Fly/ECS); set HMAC secrets
4. **Verified SKU mappings (TASK-03)** — requires successful login for SKU/price capture
5. **Session bootstrap (TASK-04)** — after password fix + headed MFA if any

## Next (Codex after owner fixes password)

1. Login → capture real SKUs → `verified=1` mappings
2. `bootstrap-session` → storage state in secret store
3. Deploy RPA container → Worker secrets → dry-run → controlled live order

See `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md` and `DEW-THEORY-CODEX-DEEPSEEK-REMAINING-WORK-PROMPT.md`.
