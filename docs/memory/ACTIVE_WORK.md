# Active Work — Dew Theory

**Signed:** Codex (DeepSeek-V4 re-verify)  
**Last updated (UTC):** 2026-09-01T12:40:00Z  
**Branch:** `main` @ `51a8c68` (docs closeout on top of deployed code SHA `458ea59`)

## Status

- D1: **8 verified supplier mappings** in production (`npm run seed:verified-mappings:d1`)
- Portal: authenticated recon + live dry-run **verified** (local RPA service)
- **Admin Command Center merged + deployed:** Worker `dew-theory` version `c9a82bb3-2c27-46f3-93ca-9f1df99b7702` from deployed code SHA `458ea59`
- **Worker production deploy complete** (unauthenticated admin gate, `noindex`, `robots.txt`, no-secret HTML, routes smoke, D1/R2 bindings all re-verified)
- **Admin owner-auth audit: SECURE** — two low hardening notes recorded in `OPEN_ITEMS.md`

## Remaining (infrastructure secrets — not code)

1. **Fly.io RPA deploy** → owner supplies `fly auth login` (or `FLY_API_TOKEN`); `flyctl` is installable but zero Fly auth + zero GitHub repo secrets exist. Config (`fly.toml`/`Dockerfile`) is deploy-ready.
2. `wrangler secret put` — `SKIN_SCRIPT_RPA_HMAC_SECRET`, `SKIN_SCRIPT_RPA_SERVICE_URL`, portal credentials (owner-supplied values)
3. **Saved payment method** on Skin Script wholesale account (Emily)
4. One **controlled live supplier order** after above
5. **Stripe Worker secrets** — test account wired locally (`cursor/stripe-wire-e021`); push `STRIPE_*` to Worker via `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`

## Commands

```bash
npm run seed:verified-mappings:d1   # production D1 (wrangler auth)
npm run e2e:rpa-live                # full stack dry-run (local RPA service required)
npm run continuity
```

See `DEW-THEORY-CODEX-FULL-TAKEOVER-PROMPT.md` and `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.
