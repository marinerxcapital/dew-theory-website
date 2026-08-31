# Skin Script RPA Architecture

## Overview

Production Skin Script fulfillment uses a **durable commerce layer** + **private RPA service**:

```
Customer checkout → Stripe payment → webhook (signature verified)
  → durable order (DEW_THEORY_D1 / file commerce store)
  → fulfillment job outbox (idempotent)
  → Dew Theory rpa-adapter.js (HMAC signed)
  → services/skin-script-rpa (FastAPI + Playwright)
  → Skin Script wholesale portal (or mock portal in CI)
```

## Components

| Layer | Path |
|-------|------|
| Commerce DB | `lib/commerce/` — D1 on Workers, file locally |
| Fulfillment jobs | `lib/fulfillment/jobs.js` |
| State machine | `lib/fulfillment/state-machine.js` |
| Verified mappings | `lib/suppliers/skin-script/mapping.js` |
| RPA adapter | `lib/suppliers/skin-script/rpa-adapter.js` |
| HMAC auth | `lib/internal/hmac-auth.js` |
| RPA service | `services/skin-script-rpa/` |
| Mock portal (CI) | `services/mock-supplier-portal/` |

## Modes

| `SKIN_SCRIPT_MODE` | Behavior |
|--------------------|----------|
| `mock` | Offline mock adapter (default dev/CI) |
| `http` | Partner HTTP API when confirmed |
| `csv_feed` | Authorized export feed |
| `rpa` | Playwright service — production fulfillment |

Production purchase requires:
- `SKIN_SCRIPT_MODE=rpa`
- `SKIN_SCRIPT_RPA_ENABLED=true`
- `SKIN_SCRIPT_DRY_RUN=false`
- Verified supplier mappings for every line item

## Idempotency keys

- Stripe webhook event ID → `webhook_events`
- Order paid → `fulfillment_jobs.idempotency_key = paid:{order_id}:{stripe_session_id}`
- Supplier submit → `idempotency_key = order_id` on RPA job create

## Blocked states

CAPTCHA/MFA/payment challenges → `blocked_human_verification` / `blocked_payment_authentication` — no bypass.

See `docs/decisions/ADR-001-SKIN-SCRIPT-RPA.md`.
