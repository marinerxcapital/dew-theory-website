# Stripe checkout — Dew Theory

## Two paths

| Env | Path | Behavior |
|---|---|---|
| `STRIPE_SECRET_KEY` **unset** | **Mock** | `POST /api/checkout` writes order as `paid` immediately, returns `{ order_id, mock: true }`. No Stripe redirect. No webhooks. |
| `STRIPE_SECRET_KEY` **set** | **Stripe Checkout** | Creates Checkout Session with full metadata; order starts as `pending_payment`. Success URL: `/cart/confirmation?session_id={CHECKOUT_SESSION_ID}`. |

## Session metadata (Stripe path)

Every Checkout Session includes string metadata:

- `order_id`, `customer_email`, `customer_name`
- `item_count`, `product_ids` (comma-separated, truncated)
- `discount_code`, `discount_amount`, `subtotal`, `shipping_fee`, `total`
- `idempotency_key`, `app=dew-theory`

Also sets `client_reference_id` to the local `order_id`.

## Webhook

`POST /api/webhooks/stripe`

| Env | |
|---|---|
| `STRIPE_SECRET_KEY` | Required |
| `STRIPE_WEBHOOK_SECRET` | Required (`whsec_…` from Dashboard) |

**Events handled**

- `checkout.session.completed` — if paid → mark order `paid`
- `checkout.session.async_payment_succeeded` — mark `paid`
- `checkout.session.async_payment_failed` — mark `payment_failed` if still pending

Signature verified via raw body + `stripe-signature`. Missing secret → **503** (not silent).

**Dashboard setup**

1. Developers → Webhooks → Add endpoint  
2. URL: `https://<your-host>/api/webhooks/stripe`  
3. Select the three events above  
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` in `.env.local`

Success-page recovery: `GET /api/checkout/session?session_id=cs_…` also marks paid if the webhook is late.

## Local testing without Stripe

1. Leave `STRIPE_SECRET_KEY` empty  
2. Complete cart checkout → confirmation with `?order=ord_…`  
3. Order appears in `/admin/orders` as `paid` / `source: mock_checkout`

## Local testing with Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# export STRIPE_WEBHOOK_SECRET from CLI output
stripe trigger checkout.session.completed
```

## Related env

See `.env.example` (or `ENV.md` if example is gitignored globally).

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional client use later)
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` (success/cancel URLs)
