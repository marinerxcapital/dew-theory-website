# Active Work — Dew Theory

**Signed:** Codex
**Last updated (UTC):** 2026-09-01T03:37:00Z
**Branch:** `main` @ `30e2bd0` (PR #12 merged) → work branch `codex/skin-script-rpa-d1-seed-config-fix`

## Status

- Skin Script authenticated recon **complete** (Cursor); verified SKUs + wholesale for 8/8 products; live portal dry-run **verified** (`dry_run_ready`).
- Production D1 `dew-theory-commerce` now has **8 `verified=1` supplier mappings** (seeded this session).
- Storefront healthy: 223 Node tests, 15 Python tests, build 58 routes, route smoke all clear.

## Remaining (owner / infrastructure)

1. **RPA container deploy (TASK-05)** — no owner-designated host. Cloudflare Containers/Cloudchamber `Unauthorized` (Workers Paid plan); Railway only `skyler@certamaris.com` (CertaMaris workspace); no local Docker.
2. **Worker HMAC/portal secrets** — pending container URL + owner credentials.
3. **Saved payment method** on Skin Script account — required before live supplier orders.
4. **Client dropship address UX** — checkout locks some fields; headed session needed to map editable client-address inputs.

## Commands

```bash
npm run seed:verified-mappings:d1   # seed verified=1 mappings to production D1 (wrangler auth)
npm run seed:verified-mappings      # file-backend only (local dev)
npm run continuity
```

See `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.
