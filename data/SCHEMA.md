# Runtime data schema

File store: `data/runtime/store.json` (created on first read if missing).

Maps 1:1 to future Supabase tables (Addendum §9A). Adapter swap target:
`lib/store-supabase.js` implementing the same exports as `lib/store.js`
(`readStore`, `writeStore`, `mutateStore`, `audit`, `trackEvent`).

## Products

| Field | Type | Notes |
|-------|------|--------|
| id | string | slug PK |
| name | string | |
| category | string | |
| size | string | |
| size_confirmed | boolean\|optional | `false` until Emily confirms (Botanical Bloom 2 oz). Omit or `true` only when the size is a given fact |
| size_note | string\|optional | Honesty note when size is an engineered default |
| wholesale_price | number | |
| retail_price | number | default wholesale × 2 |
| retail_price_confirmed | boolean | `true` only when the retail figure was supplied or Emily later confirms. SPF stays `false` at the $30 engineered default |
| retail_price_note | string\|optional | Honesty note when retail is computed, not given |
| description_short | string | |
| how_to_use | string | |
| key_actives | string[] | |
| skin_types | string[] | |
| conditions_addressed | string[] | |
| stock_status | enum | `in_stock` \| `out_of_stock` \| `discontinued` |
| source | enum | `manual` \| `csv_import` \| `sync` |
| skin_script_sku | string\|null | supplier SKU for catalog sync + dropship |
| ai_assisted | boolean\|optional | draft mapped with xAI; still validated |
| active | boolean | shop visibility |
| images | string[] | image URLs or public paths; empty → category placeholder SVG via `lib/product-image.js` (max 8) |
| variants | array\|null | e.g. lip treatment shades |
| manufacturer_name_note | string\|optional | Catalog matching / SKU-structure honesty (see OPEN_ITEMS.md §2) |

## Orders

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| customer | object | name, email, phone |
| items | array | product_id, name, quantity, unit_price, variant |
| subtotal, shipping_fee, discount_amount, total | number | |
| discount_code | string\|null | |
| status | enum | see `lib/order-status.js` — includes `queued_for_supplier`, `failed_supplier` |
| shipping_address | object | |
| created_at | ISO string | |
| submitted_to_skin_script_at | ISO\|null | set when status marked / auto-fulfill succeeds |
| supplier_order_id | string\|null | external PO id from Skin Script adapter |
| supplier_status | string\|null | last supplier status |
| supplier_raw | object\|null | sanitized adapter response |
| fulfillment_error | string\|null | last auto-fulfill error |
| fulfillment_error_code | string\|null | |
| fulfillment_classification | object\|null | optional AI/deterministic classification |

## Appointments

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| service_id, service_name | string | |
| start_time | ISO | |
| duration_minutes, price | number | |
| status | enum | confirmed → completed/cancelled/no_show |
| customer | object | |
| calendar_event_id | string\|null | Google later |
| created_at | ISO | |

## DiscountCodes

| Field | Type | Notes |
|-------|------|--------|
| id, code | string | code uppercased |
| type | enum | percentage \| fixed |
| value | number | |
| referrer_customer_id | string\|null | |
| max_uses | number\|null | |
| uses_count | number | redemptions |
| expires_at | string\|null | |
| active | boolean | |
| stripe_promotion_code_id | string\|null | |
| created_at | ISO | |
| note | string\|optional | Honesty / operator note (DEW15 seed: launch-promo placeholder) |
| rate_confirmed | boolean\|optional | `false` until Emily confirms the promo rate |

## Admins

| Field | Type | Notes |
|-------|------|--------|
| id, name, email | string | |
| role | string | e.g. owner |
| auth_id | string | local placeholder |
| created_at | ISO | |

Password is env-based (`ADMIN_PASSWORD`), not stored in the document.

## AuditLog

| Field | Type |
|-------|------|
| id, admin_id, action, entity, entity_id | string |
| diff | object\|null |
| created_at | ISO |

## Events

First-party funnel: `{ type, …payload, at }`. Types: product_view, add_to_cart,
checkout_*, booking_*.

## CatalogSync (runtime)

`store.catalog_sync` — last autonomous / admin catalog sync (not a product row).

| Field | Type | Notes |
|-------|------|--------|
| last_run_at | ISO\|null | Any dry-run, apply, or skipped cron |
| last_apply_at | ISO\|null | Last successful apply |
| last_dry_run_at | ISO\|null | |
| last_source / last_adapter | string\|null | `mock` \| `csv_feed` \| `rpa` \| `http` |
| skipped | boolean | Production cron skip when live source is not ready |
| code | string | `applied`, `dry_run`, `catalog_source_mock`, `rpa_not_configured`, … |
| last_totals | object | drafts / create / update / skip / error counts |

Curated publish list is **not** in the runtime store. It is `data/catalog-allowlist.json`.

## Integrity

- Writes are atomic (temp + rename).
- Corrupt JSON → backup `.corrupt.<ts>` + re-seed (does not delete backup).
- Seed runs only when `store.json` is missing.
