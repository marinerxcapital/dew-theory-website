# Active Work — Dew Theory

**Last updated:** 2026-09-01 (Cursor Cloud Agent)  
**Branch:** `cursor/skin-script-rpa-completion-e021`

## Status

Skin Script authenticated recon **complete**. Verified SKU mappings for 8/8 products. Live portal **dry-run verified** (`dry_run_ready`).

## Remaining (owner / infrastructure)

1. **RPA container deploy (TASK-05)** — choose Railway/Fly/ECS; set HMAC secrets on Worker
2. **Saved payment method** on Skin Script account — required before live supplier orders
3. **Client dropship address UX** — checkout locks some fields; may need headed session to map client-address inputs for production live orders
4. **PR #12 merge** — session 5 verified SKUs + live dry-run; owner approval

## Commands

```bash
npm run seed:verified-mappings   # verified=1 templates from portal registry
npm run continuity
```

See `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.
