# Skin Script catalog sync + dropship

Architecture for connecting Dew Theory to Skin Script **without scraping** and
**without publishing the full wholesale catalog**.

## What autonomy does today

- Sync may **auto-list / refresh only** products on a curated allowlist.
- Initial allowlist = the current 8 shop SKUs in `data/products.json`.
- Config lives in `data/catalog-allowlist.json` (`product_id`, `skin_script_sku`,
  `sync_enabled`, optional `supplier_product_url`). Adding a 9th SKU is a data
  change, not a code rewrite.
- Planner **skips** every feed row that is not on the allowlist (`not_on_allowlist`).
- Updates prefer **wholesale / retail / availability / SKU** and keep Emily-facing
  copy. Retail = wholesale × 2 when the live source omits retail.
- Mock still works for local/dev. Production cron **will not apply mock as live**.

## Status

| Piece | Offline mock | Live partner |
|-------|--------------|--------------|
| Catalog sync (allowlist only) | ✅ mock adapter | RPA `/v1/catalog/list` **or** authorized `SKIN_SCRIPT_FEED_URL` |
| Dropship PO | ✅ mock PO ids | Needs Fly RPA + portal secrets (fulfillment, not this sync PR) |
| xAI mapping | Optional (`XAI_API_KEY`) | Assist only; validators always run |

**Official API status:** No Skin Script partner HTTP API is confirmed in-repo.
The HTTP adapter remains a fail-closed stub. Do not pretend it exists.

**Live catalog source:** the wholesale portal (`skinscript.com` after
`skinscriptrx.com/my-account/` login) via the existing RPA service, **or** an
owner-pointed authorized CSV/JSON export. Public retail sites are not scraped.

If Fly RPA / portal credentials / feed URL are not set, sync **fails closed**
with a clear code (`rpa_not_configured`, `feed_url_missing`,
`catalog_source_mock`) and does **not** silently use mock as live.

## Allowlist

```
data/catalog-allowlist.json
lib/catalog-allowlist.js
```

| Field | Role |
|-------|------|
| `product_id` | Dew Theory slug (must match shop id when the product already exists) |
| `skin_script_sku` | Wholesale portal variant SKU |
| `sync_enabled` | `false` parks a row without deleting it |
| `supplier_product_url` | Verified `https://skinscript.com/product/...` URL for RPA reads |

Disabled or missing rows are never published.

### How to add a 9th SKU

1. Confirm the wholesale variant SKU + `skinscript.com` product URL (portal, not a retail scrape).
2. Append one object to `data/catalog-allowlist.json` with `sync_enabled: true`.
3. Deploy. Next dry-run / cron will auto-list if the live source returns that SKU.
4. Optional: add editorial copy in `data/products.json` or Admin → Products. Sync will
   not invent ingredients or rewrite Emily-facing descriptions on update.

## Adapters

```
lib/suppliers/types.js
lib/suppliers/skin-script/
  index.js              # factory via SKIN_SCRIPT_MODE
  mock-adapter.js       # offline catalog + dropship ledger
  http-adapter.js       # env-gated real API stub (official partner API NOT confirmed)
  csv-feed-adapter.js   # authorized CSV/JSON file or HTTPS feed
  rpa-adapter.js        # WooCommerce portal RPA via services/skin-script-rpa
  mapping.js            # verified supplier mapping gate for RPA
```

| `SKIN_SCRIPT_MODE` | Catalog |
|--------------------|---------|
| `mock` | Offline sample of the 8 allowlisted SKUs. Local/dev only. |
| `http` | Fail-closed until `SKIN_SCRIPT_API_BASE` + `SKIN_SCRIPT_API_KEY` exist. |
| `csv_feed` | `SKIN_SCRIPT_FEED_URL` (https or local path). Planner still drops off-list SKUs. |
| `rpa` | HMAC `POST /v1/catalog/list` for allowlisted SKUs only. Requires Fly service + portal session. |

**Match strategy:** allowlist `product_id` or `skin_script_sku`.  
**Retail:** wholesale × 2 when retail omitted.  
**Source:** applied rows get `source: 'sync'`. Manual products without SKU are not bulk-wiped.

## Scheduled autonomy

`wrangler.jsonc` declares `triggers.crons = ["0 6 * * *"]` (06:00 UTC daily).
OpenNext build is wrapped by `scripts/attach-scheduled-handler.mjs` so
`scheduled()` POSTs `/api/cron/catalog-sync` with `CRON_SECRET`.

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/admin/sync/catalog` | Admin session | `{ dry_run, source }` — default dry-run true. Apply refused if source not ready. |
| `GET /api/admin/sync/catalog` | Admin session | Allowlist + last sync + readiness |
| `POST /api/cron/catalog-sync` | `CRON_SECRET` bearer | Apply when live; otherwise `skipped: true` + code |

Admin UI: `/admin/sync` (allowlist, last run, dry-run vs apply, SKU create/update/skip/fail).

## Owner checklist — turn autonomy on in production

Production wrangler still ships `SKIN_SCRIPT_MODE=mock`. Until the steps below
are done, **daily cron logs a skip** (`catalog_source_mock`) and does not write
the shop catalog.

**Pick one live catalog source (not both required):**

### A. RPA (preferred once Fly + portal session exist)

1. Deploy `services/skin-script-rpa` to Fly (see `docs/SKIN_SCRIPT_RPA_DEPLOYMENT.md`).
2. Put portal credentials + storage-state on the **RPA service** (not git).
3. Worker secrets: `SKIN_SCRIPT_RPA_SERVICE_URL`, `SKIN_SCRIPT_RPA_HMAC_SECRET`,
   `CRON_SECRET`.
4. Worker vars: `SKIN_SCRIPT_MODE=rpa`, `SKIN_SCRIPT_RPA_ENABLED=true`.
5. Deploy the Worker so the cron trigger + scheduled handler ship.
6. Open `/admin/sync` — readiness should read `catalog_source_rpa_ready`.
7. Dry-run, then wait for 06:00 UTC or click Apply once.

If Fly/HMAC/portal secrets are missing, cron returns `rpa_not_configured` and
does **not** fall back to mock.

### B. Authorized feed

1. Export an authorized wholesale CSV/JSON (owner step with Skin Script — not a
   public retail scrape).
2. Host it at an HTTPS URL the Worker can fetch, or drop a file the process can read.
3. Set `SKIN_SCRIPT_FEED_URL` (var or secret) and `SKIN_SCRIPT_MODE=csv_feed`.
4. Set `CRON_SECRET` and deploy.
5. Dry-run on `/admin/sync`. Extra feed SKUs are skipped; only the allowlist applies.

### Always

- Do not set `CATALOG_SYNC_ALLOW_MOCK_APPLY=true` on production unless you
  intentionally want mock writes (not live prices).
- Official partner HTTP API is **not** confirmed — leave `http` alone until
  wholesale provides a real base URL + key.
- This path does **not** place purchase orders.

## Env

```
SKIN_SCRIPT_MODE=mock|http|csv_feed|rpa
SKIN_SCRIPT_API_BASE=
SKIN_SCRIPT_API_KEY=
SKIN_SCRIPT_ACCOUNT_ID=
SKIN_SCRIPT_FEED_URL=
SKIN_SCRIPT_RPA_ENABLED=true|false
SKIN_SCRIPT_DRY_RUN=true|false
SKIN_SCRIPT_RPA_SERVICE_URL=
SKIN_SCRIPT_RPA_HMAC_SECRET=
CRON_SECRET=
CATALOG_SYNC_ALLOW_MOCK_APPLY=true|false
AUTO_FULFILL=true|false
XAI_API_KEY=
XAI_MODEL=grok-3
```

Production wrangler vars (re-verify): `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false`.

See `ENV.md`.

## Dropship flow

Unchanged — paid order → fulfillment job outbox → adapter. Catalog sync does
not create supplier purchase orders.

## What Skin Script must provide (ask wholesale rep)

**No official partner API has been confirmed.**

1. Is **dropship / resale** allowed for this account?
2. **Catalog channel:** partner API, scheduled CSV export, portal export only?
3. **Order channel:** API create PO, EDI, email PO, or portal-only (RPA fallback)?
4. SKU list + wholesale price file format + cadence
5. Ship-from location, tracking format, partial ship rules
6. Returns process for customer dropship orders
7. Branding / MAP pricing constraints if any

Until then: keep `SKIN_SCRIPT_MODE=mock` for fulfillment safety. Catalog
autonomy stays skipped in production until RPA or `SKIN_SCRIPT_FEED_URL` is set.

## Failure modes

| Code | Meaning |
|------|---------|
| `not_on_allowlist` | Feed SKU is not curated — never published |
| `sync_disabled` | Allowlist row parked |
| `allowlisted_not_in_feed` | Curated SKU missing from this run |
| `catalog_source_mock` | Mock is not live; production apply/cron skip |
| `rpa_not_configured` | RPA mode without Fly URL / HMAC / enable flag |
| `rpa_catalog_failed` | RPA `/v1/catalog/list` HTTP error |
| `feed_url_missing` | csv_feed without `SKIN_SCRIPT_FEED_URL` |
| `skin_script_http_unconfigured` | HTTP mode without keys |
| `cron_unconfigured` / `cron_unauthorized` | `CRON_SECRET` missing or wrong |
| `sku_missing` | Line cannot map to supplier SKU |
| `capability_unsupported` | csv_feed cannot place POs |

## Related

- [`ORDER_PATH.md`](./ORDER_PATH.md)
- [`DROPSHIP_BUILD_REPORT.md`](./DROPSHIP_BUILD_REPORT.md)
- [`SKIN_SCRIPT_RPA_ARCHITECTURE.md`](./SKIN_SCRIPT_RPA_ARCHITECTURE.md)
- Addendum Section 16 (CSV primary; no scrape)
