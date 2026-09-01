# Admin Command Center — Deployment Log

---

## 2026-09-01 Codex — merge + production Worker deploy

**Signed:** Codex
**Timestamp (UTC):** 2026-09-01T12:21:00Z
**Merged SHA:** `458ea5923c11d282e7b5299a5a29d94fa41436e7` (PR #16 squash merge)
**Worker version:** `c9a82bb3-2c27-46f3-93ca-9f1df99b7702`

### Deploy

- Merged admin-command-center PR #16 from `cursor/admin-command-center-e021` (squash).
- `npm run deploy` (OpenNext + Wrangler) succeeded under MarinerX Capital OAuth `skyler@marinerxcapital.com`.
- Deploy readback confirmed D1 bindings (`DEW_THEORY_D1` = `dew-theory-commerce` `cd55d01f-2c27-4b53-a8aa-9b10555d3b17`, `NEXT_TAG_CACHE_D1`), R2 cache buckets, and custom domains.

### Production verification

| Check | Result |
|-------|--------|
| `npm run smoke:routes -- https://dewtheoryco.com` | all clear (22 checks incl. 8 legal PDFs) |
| `/admin` unauthenticated | 307 → `/admin/login?next=%2Fadmin` |
| `/admin/fulfillment`, `/admin/integrations`, `/admin/system`, `/admin/orders` | 307 → `/admin/login` (routes present) |
| `/admin/login` | 200 |
| Secret leakage (login HTML) | none of `dew-admin-dev`, `admin@dewtheory.local`, `sk_live`, `sk_test`, `ADMIN_PASSWORD` present |
| `robots.txt` | disallows `/admin`, `/api` |
| Admin layout metadata | `robots: { index: false, follow: false }` |
| D1 verified mappings | 8 rows `verified=1` |
| Homepage surface | consultation + products intact |

### Not verified (owner-only)

- Emily owner login + TOTP (`ADMIN_OWNER_EMAIL` / `ADMIN_REQUIRE_TOTP`) — requires owner credentials.
- Non-owner admin rejection live — covered by `tests/admin-command-center.test.mjs`; not exercised against production without credentials.
- `/admin/integrations` Stripe/RPA live health panels — reachable only after owner login; probes are server-side and sanitized by construction.

### Blockers

- RPA service deploy to Fly.io: no `flyctl` CLI / `FLY_API_TOKEN`.
- Emily saved payment method on Skin Script portal; live supplier order.
- Stripe webhook registration + live Stripe keys.
