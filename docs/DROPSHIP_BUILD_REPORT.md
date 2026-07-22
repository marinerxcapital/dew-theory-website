# Dropship + catalog sync — build report

**Date:** 2026-07-20  
**Scope:** Architecture from “Dew Theory - Architecture To Implement”  
**Result:** Mock-automated catalog sync + dropship shipped; live Skin Script + xAI keys still env drop-in

---

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Mock supplier sync with `source: sync` + `skin_script_sku` | ✅ |
| Dry-run creates plan without write | ✅ default `dry_run: true` |
| Paid mock checkout → auto fulfill → `submitted_to_skin_script` + `supplier_order_id` | ✅ (`AUTO_FULFILL` default true) |
| Second fulfill idempotent | ✅ |
| Missing SKU fails safely admin-visible | ✅ `failed_supplier` |
| CSV import still works | ✅ unchanged path |
| xAI optional with deterministic fallback | ✅ |
| No scraping | ✅ |
| Tests + build | See gate below |
| OPEN_ITEMS Skin Script questions | ✅ |

---

## What works offline (no keys)

1. `SKIN_SCRIPT_MODE=mock` catalog list (8 seed products as drafts)  
2. `POST /api/admin/sync/catalog` dry-run + apply  
3. `fulfillOrder` / checkout mock auto-fulfill with mock PO ids `SSPO_{orderId}`  
4. Admin UI `/admin/sync` + order “Submit to Skin Script (auto)”  
5. Unit tests: `tests/catalog-sync.test.mjs`, `tests/dropship.test.mjs`  

## Needs credentials / partner

| Need | Env / action |
|------|----------------|
| Live catalog HTTP | `SKIN_SCRIPT_API_BASE` + `SKIN_SCRIPT_API_KEY` + confirmed routes |
| CSV/JSON feed pull | `SKIN_SCRIPT_MODE=csv_feed` + `SKIN_SCRIPT_FEED_URL` |
| Cron apply | `CRON_SECRET` + schedule `POST /api/cron/catalog-sync` |
| xAI mapping | `XAI_API_KEY` (+ optional `XAI_MODEL`) |
| Disable auto PO | `AUTO_FULFILL=false` |

---

## Key files

- `lib/suppliers/**` — adapter contract + mock/http/csv_feed  
- `lib/catalog-sync.js` — plan + apply  
- `lib/dropship/fulfill-order.js` — paid → supplier  
- `lib/ai/xai-client.js`, `lib/ai/map-catalog-rows.js`  
- `app/api/admin/sync/catalog`, `app/api/cron/catalog-sync`  
- `app/api/admin/orders/[id]/fulfill`  
- `app/admin/sync`, `components/admin/CatalogSyncPanel.jsx`  
- Docs: `SKIN_SCRIPT_SYNC.md`, updated `ORDER_PATH.md`, `ENV.md`

---

## Next human steps

1. Email Skin Script rep with questions in `OPEN_ITEMS.md` / `SKIN_SCRIPT_SYNC.md`.  
2. Paste keys into `.env.local` when available; keep mock until then.  
3. Optional: create xAI key for feed mapping assist.  
4. After live API shape known: implement real request/response mapping only in `http-adapter.js`.  
5. Durable store (Supabase) still recommended before multi-isolate CF production.  

---

## Definition of done

Working **mock-automated dropship + catalog sync** with a clean adapter boundary — plugging a real Skin Script API is env + `http-adapter.js` mapping, not a rewrite.
