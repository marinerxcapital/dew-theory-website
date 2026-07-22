# Cart → order → admin fulfillment path

End-to-end path for a Skin Script retail order (mock Stripe + optional auto dropship).

```
Shop / PDP
  → Add to cart (localStorage)
  → Cart summary + shipping/promo math
  → POST /api/checkout
       · re-price from catalog
       · validate customer + address
       · mock: status=paid  |  Stripe: pending_payment + Checkout URL
  → (mock / Stripe paid) maybeAutoFulfill when AUTO_FULFILL ≠ false
       · queued_for_supplier → submitted_to_skin_script + supplier_order_id
       · or failed_supplier + fulfillment_error
  → Confirmation (?order= or ?session_id=)
  → Admin /admin/orders
       · Manual PATCH status  OR  POST .../fulfill (retry auto)
  → status: fulfilled (when shipped / tracking later)
```

## Status values

| Status | Meaning |
|---|---|
| `pending_payment` | Stripe session open |
| `paid` | Money captured (mock immediate / Stripe webhook or session resolve) |
| `queued_for_supplier` | Auto-fulfill in progress |
| `submitted_to_skin_script` | Wholesale PO placed (manual mark or adapter) |
| `failed_supplier` | Auto-fulfill failed (SKU/API/etc.) — admin-visible |
| `fulfilled` | Shipped / handed off |
| `cancelled` | Cancelled |
| `payment_failed` | Stripe async payment failed |

## Automated dropship fields on order

- `supplier_order_id` — external PO id  
- `supplier_status` — adapter status  
- `supplier_raw` — sanitized response  
- `fulfillment_error` / `fulfillment_error_code`  
- `submitted_to_skin_script_at`

## Automated checks

### Offline (always — no server)

```bash
npm test
# includes order-path, catalog-sync, dropship tests
```

### HTTP smoke (server must be running)

```bash
npm run dev
# other terminal:
npm run smoke
```

Steps:

1. `POST /api/checkout` mock order (cleanser + moisturizer, optional `DEW15`)  
2. Response may include `fulfill.supplier_order_id` when auto-fulfill succeeds  
3. Replay same `Idempotency-Key` → same `order_id`  
4. Admin: `POST /api/admin/orders/:id/fulfill` is idempotent  

## Manual QA

1. Checkout mock order → confirm order `submitted_to_skin_script` or admin retry  
2. `/admin/sync` dry-run → Apply sync  
3. Order without product SKU mapping → `failed_supplier` with message  
4. CSV import still works at `/admin/import`  

## Related

- Sync architecture: [`SKIN_SCRIPT_SYNC.md`](./SKIN_SCRIPT_SYNC.md)  
- Mock vs Stripe: [`STRIPE.md`](./STRIPE.md)  
- Env: [`ENV.md`](../ENV.md)
