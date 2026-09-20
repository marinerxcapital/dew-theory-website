# Active Work — Dew Theory

**Signed:** Cursor Cloud Agent  
**Last updated (UTC):** 2026-09-20  
**Branch:** `cursor/catalog-allowlist-sync-a147`  
**`main` HEAD (branch base):** `2022a24` (docs closeout after PR #23 / fulfillment honesty)

## This session

Allowlist-only autonomous Skin Script → Dew Theory catalog sync (no full wholesale catalog, no invented partner API, no live purchase orders).

| Item | Outcome |
|------|---------|
| Allowlist | `data/catalog-allowlist.json` — current 8 shop SKUs, `sync_enabled` |
| Planner | Skips `not_on_allowlist`; updates wholesale/retail/availability/SKU only |
| Live source | RPA `POST /v1/catalog/list` + csv_feed `SKIN_SCRIPT_FEED_URL`; fail-closed |
| Cron | wrangler `0 6 * * *` → `POST /api/cron/catalog-sync`; mock/unconfigured skips |
| Admin | `/admin/sync` shows allowlist, last run, dry-run vs apply, SKU results |
| Deploy | **Not done** |
| Live order | **Not done** (out of scope) |

## Remaining owner / infra

1. Turn catalog autonomy on: Fly RPA + Worker `SKIN_SCRIPT_MODE=rpa` + HMAC **or** `SKIN_SCRIPT_FEED_URL` + `csv_feed`. Until then production cron skips (`catalog_source_mock`).
2. `wrangler secret put CRON_SECRET`.
3. Stripe secrets + test-card → webhook → D1 paid (rotate if PR #20 Raw URL was fetched).
4. Emily saved payment method + one controlled live supplier order (fulfillment, not catalog).
5. Emily catalog confirmation: SPF retail, lip SKU structure, mask size, DEW15.

See `docs/SKIN_SCRIPT_SYNC.md`.
