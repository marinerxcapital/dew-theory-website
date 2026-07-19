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
| wholesale_price | number | |
| retail_price | number | default wholesale × 2 |
| retail_price_confirmed | boolean | |
| description_short | string | |
| how_to_use | string | |
| key_actives | string[] | |
| skin_types | string[] | |
| conditions_addressed | string[] | |
| stock_status | enum | `in_stock` \| `out_of_stock` \| `discontinued` |
| source | enum | `manual` \| `csv_import` \| `sync` |
| skin_script_sku | string\|null | |
| active | boolean | shop visibility |
| variants | array\|null | e.g. lip treatment shades |

## Orders

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| customer | object | name, email, phone |
| items | array | product_id, name, quantity, unit_price, variant |
| subtotal, shipping_fee, discount_amount, total | number | |
| discount_code | string\|null | |
| status | enum | see `lib/order-status.js` |
| shipping_address | object | |
| created_at | ISO string | |
| submitted_to_skin_script_at | ISO\|null | set when status marked |

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

## Integrity

- Writes are atomic (temp + rename).
- Corrupt JSON → backup `.corrupt.<ts>` + re-seed (does not delete backup).
- Seed runs only when `store.json` is missing.
