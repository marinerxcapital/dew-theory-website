# Skin Script catalog sync + dropship

Architecture for connecting Dew Theory to Skin Script **without scraping**.

## Status

| Piece | Offline mock | Live partner |
|-------|--------------|--------------|
| Catalog sync | ✅ mock adapter | Needs API or authorized feed URL |
| Dropship PO | ✅ mock PO ids | Needs HTTP dropship endpoint |
| xAI mapping | Optional (`XAI_API_KEY`) | Assist only; validators always run |

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

**Official API status (2026-09-04):** No Skin Script partner API is confirmed in-repo.
HTTP adapter remains a placeholder until wholesale provides base URL + key. Production-oriented
automation path is **authorized RPA** (`SKIN_SCRIPT_MODE=rpa`) or **owner manual fulfillment**.

**Match strategy (catalog):** prefer `skin_script_sku`, else product `id` slug.  
**Retail:** wholesale × 2 when retail omitted.  
**Source:** applied rows get `source: 'sync'`. Manual products without SKU are not bulk-wiped.

## APIs

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/admin/sync/catalog` | Admin session | `{ dry_run, source }` — default dry-run true |
| `POST /api/cron/catalog-sync` | `CRON_SECRET` bearer | Apply sync (non-dry) |
| `POST /api/admin/orders/:id/fulfill` | Admin session | Auto-submit dropship (idempotent) |

Admin UI: `/admin/sync` (dry-run + apply).

## Dropship flow

```
paid (mock checkout or Stripe webhook)
  → maybeAutoFulfill (AUTO_FULFILL, default true)
  → status queued_for_supplier
  → adapter.createDropshipOrder
  → submitted_to_skin_script + supplier_order_id
  OR failed_supplier + fulfillment_error
```

Idempotency key = Dew `order_id`. Second call returns existing `supplier_order_id`.

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
AUTO_FULFILL=true|false
XAI_API_KEY=
XAI_MODEL=grok-3
```

| `SKIN_SCRIPT_MODE` | Role |
|--------------------|------|
| `mock` | Offline catalog + mock dropship ledger (production wrangler default) |
| `http` | Env-gated partner HTTP API stub |
| `csv_feed` | Authorized CSV/JSON file or HTTPS feed (catalog only; no PO create) |
| `rpa` | Browser automation via Skin Script RPA service (HMAC); see `docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md` |

Production wrangler vars (Wave 0 verify): `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false`.

See `ENV.md`.

## What Skin Script must provide (ask wholesale rep)

**No official partner API has been confirmed.** Do not assume HTTP dropship or live catalog API credentials exist until Skin Script provides an authorized channel.

1. Is **dropship / resale** allowed for this account?  
2. **Catalog channel:** partner API, scheduled CSV export, portal export only?  
3. **Order channel:** API create PO, EDI, email PO, or portal-only (RPA fallback)?  
4. SKU list + wholesale price file format + cadence  
5. Ship-from location, tracking format, partial ship rules  
6. Returns process for customer dropship orders  
7. Branding / MAP pricing constraints if any  

Until then: keep `SKIN_SCRIPT_MODE=mock` and CSV import fallback (`/admin/import`). Use `rpa` only with owner-approved container host, secrets, and dry-run gates — **no official partner API confirmed**.

## xAI role

- Map messy feed rows → ProductDraft (validated)  
- Classify fulfill errors  
- **Never** invent ingredients/prices as facts; drafts flagged `ai_assisted`

## Failure modes

| Code | Meaning |
|------|---------|
| `sku_missing` | Line cannot map to supplier SKU |
| `dropship_sku_unknown` | Mock/unknown SKU |
| `skin_script_http_unconfigured` | HTTP mode without keys |
| `capability_unsupported` | csv_feed cannot place POs |

## Related

- [`ORDER_PATH.md`](./ORDER_PATH.md)  
- [`DROPSHIP_BUILD_REPORT.md`](./DROPSHIP_BUILD_REPORT.md)  
- Addendum Section 16 (CSV primary; no scrape)
