# Mock Skin Script Wholesale Portal

Deterministic HTTP fixture for local development and CI. Implements the routes and `data-testid` selectors consumed by `services/skin-script-rpa/app/jobs/worker.py`.

## Run

```bash
# From repo root (default port 9090)
python3 services/mock-supplier-portal/server.py

# Custom port
PORT=9091 python3 services/mock-supplier-portal/server.py
```

Point the RPA service at the portal:

```bash
export SKIN_SCRIPT_PORTAL_BASE_URL=http://127.0.0.1:9090
```

## Routes

| Route | Purpose |
|-------|---------|
| `GET /login` | Login form, account name, optional CAPTCHA/MFA markers |
| `GET /cart` | Cart clear button, empty marker, line items |
| `GET /product/{sku}` | Product identity and add-to-cart |
| `GET /checkout/shipping` | Shipping address fields |
| `GET /checkout/payment` | Saved payment method |
| `GET /checkout/review` | Order total and place-order |
| `GET /confirmation` | Post-submit confirmation |
| `GET /orders` | Order history for reconciliation fallback |

POST handlers support cart clear, add-to-cart, login redirect, and place-order.

## Scenarios

Append `?scenario=` to any URL (stored in the `mock_scenario` cookie and propagated via nav links):

| Scenario | Effect |
|----------|--------|
| `ok` | Happy path (default) |
| `captcha` | Shows `[data-testid='captcha-block']` on login |
| `mfa` | Shows `[data-testid='mfa-block']` on login |
| `oos` | Product stock reads "Out of Stock" |
| `price_drift` | Product price shows $99.00 |
| `address_suggestion` | Shows `[data-testid='address-suggestion']` on shipping |
| `payment_challenge` | Shows `[data-testid='payment-challenge']` on payment |

Example:

```bash
curl -s 'http://127.0.0.1:9090/login?scenario=captcha' | grep captcha-block
```

## Default product

`SS-GREEN_TEA_CITRUS_CLEANSER` — Green Tea Citrus Cleanser, 6 oz, **$16.00**, in stock.

Other SKUs resolve to a generic mock product at the same default price.
