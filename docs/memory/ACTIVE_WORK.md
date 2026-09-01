# Active Work — Dew Theory

**Signed:** Cursor Cloud Agent  
**Last updated (UTC):** 2026-09-01T04:20:00Z  
**Branch:** `main` @ `0c80486` (PR #14 merged)

## Status

- D1: **8 verified supplier mappings** in production (`npm run seed:verified-mappings:d1`)
- Portal: authenticated recon + live dry-run **verified**
- **Full stack E2E verified locally:** Worker adapter → RPA service (HMAC) → live portal `dry_run_ready`
- Deploy automation added (GitHub Actions + Fly.toml) — **awaiting repo secrets**

## Remaining (infrastructure secrets — not code)

1. **GitHub repo secrets** → `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `FLY_API_TOKEN` (Dew Theory org, not CertaMaris)
2. Run **Deploy Production** workflow (Worker + optional RPA on Fly)
3. `wrangler secret put` — `SKIN_SCRIPT_RPA_HMAC_SECRET`, `SKIN_SCRIPT_RPA_SERVICE_URL`, portal credentials
4. **Saved payment method** on Skin Script wholesale account (Emily)
5. One **controlled live supplier order** after above

## Commands

```bash
npm run seed:verified-mappings:d1   # production D1 (wrangler auth)
npm run e2e:rpa-live                # full stack dry-run (local RPA service required)
npm run continuity
```

See `DEW-THEORY-CODEX-FULL-TAKEOVER-PROMPT.md` and `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.
