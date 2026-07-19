# Cart → order → admin fulfillment path

End-to-end path for a Skin Script retail order (mock Stripe).

```
Shop / PDP
  → Add to cart (localStorage)
  → Cart summary + shipping/promo math
  → POST /api/checkout
       · re-price from catalog
       · validate customer + address
       · mock: status=paid  |  Stripe: pending_payment + Checkout URL
  → Confirmation (?order= or ?session_id=)
  → Admin /admin/orders
  → PATCH /api/admin/orders/:id  { status: "submitted_to_skin_script" }
  → Manual wholesale order to Skin Script
  → status: fulfilled
```

## Status values

| Status | Meaning |
|---|---|
| `pending_payment` | Stripe session open |
| `paid` | Money captured (mock immediate / Stripe webhook or session resolve) |
| `submitted_to_skin_script` | Staff placed wholesale order |
| `fulfilled` | Shipped / handed off |
| `cancelled` | Cancelled |
| `payment_failed` | Stripe async payment failed |

## Automated checks

### Offline (always — no server)

```bash
npm test
# includes tests/order-path.test.mjs
```

Covers: re-price ignores client `unit_price`, unknown SKU reject, variant required,
order write + `submitted_to_skin_script` + audit log.

### HTTP smoke (server must be running)

```bash
npm run dev
# other terminal:
npm run smoke
# or:
node scripts/smoke-checkout.mjs
BASE_URL=http://localhost:3000 npm run smoke
```

Steps:

1. `POST /api/checkout` mock order (cleanser + moisturizer, optional `DEW15`)
2. Replay same `Idempotency-Key` → same `order_id`
3. `POST /api/admin/login` (defaults: `admin@dewtheory.local` / `dew-admin-dev`)
4. `PATCH /api/admin/orders/:id` → `submitted_to_skin_script`

## Manual QA (5 minutes)

1. Open `/shop`, add Green Tea Cleanser + Ageless Moisturizer  
2. Cart: confirm free shipping at $56 subtotal; apply `DEW15`  
3. Checkout form → Confirm → confirmation page with order id  
4. `/admin/login` → Orders → open order → status **submitted_to_skin_script** → Save  
5. Confirm audit log entry on admin overview  

## Related

- Mock vs Stripe: [`docs/STRIPE.md`](./STRIPE.md)
- Env: [`ENV.md`](../ENV.md)
