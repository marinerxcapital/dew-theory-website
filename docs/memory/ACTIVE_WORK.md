# Active Work — Dew Theory

**Signed:** Codex  
**Last updated (UTC):** 2026-09-01T12:21:00Z  
**Branch:** `main` @ `458ea59` (PR #16 admin command center merged)

## Status

- D1: **8 verified supplier mappings** in production (`npm run seed:verified-mappings:d1`)
- Portal: authenticated recon + live dry-run **verified** (prior Cursor session)
- **Admin Command Center merged + deployed:** Worker `dew-theory` version `c9a82bb3-2c27-46f3-93ca-9f1df99b7702` from `main` `458ea59`
- **Worker production deploy complete** (unauthenticated admin gate, `noindex`, `robots.txt`, no-secret HTML, and routes smoke all verified)
- **Full stack E2E verified locally:** Worker adapter → RPA service (HMAC) → live portal `dry_run_ready` (prior Cursor session)

## Remaining (infrastructure secrets — not code)

1. **Fly.io RPA deploy** → `FLY_API_TOKEN` (Dew Theory org) + `flyctl` (or run **Deploy Production** workflow); Worker-side Cloudflare deploy already done via local OAuth.
2. `wrangler secret put` — `SKIN_SCRIPT_RPA_HMAC_SECRET`, `SKIN_SCRIPT_RPA_SERVICE_URL`, portal credentials (owner-supplied values)
3. **Saved payment method** on Skin Script wholesale account (Emily)
4. One **controlled live supplier order** after above
5. **Stripe webhook** registration + live `STRIPE_*` keys (owner)

## Commands

```bash
npm run seed:verified-mappings:d1   # production D1 (wrangler auth)
npm run e2e:rpa-live                # full stack dry-run (local RPA service required)
npm run continuity
```

See `DEW-THEORY-CODEX-FULL-TAKEOVER-PROMPT.md` and `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.
