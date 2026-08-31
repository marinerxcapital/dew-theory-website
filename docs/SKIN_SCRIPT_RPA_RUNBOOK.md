# Skin Script RPA Runbook

## Local development

```bash
# Storefront
npm ci && npm test && npm run dev

# RPA service
cd services/skin-script-rpa
pip install -e ".[dev]"
SKIN_SCRIPT_RPA_HMAC_SECRET=dev-secret uvicorn app.main:app --port 8080

# Mock portal (static)
python3 -m http.server 9090 --directory services/mock-supplier-portal
```

## Session bootstrap (production — interactive)

```bash
cd services/skin-script-rpa
python -m app.cli bootstrap-session
```

Requires headed browser + legitimate MFA. Saves storage state to configured path — **never commit**.

## Dry run

Set `SKIN_SCRIPT_DRY_RUN=true` — workflow runs through review, does not click Place Order.

## Production enablement checklist

1. Provision `dew-theory-commerce` D1 and apply `migrations/001_commerce_schema.sql`
2. Deploy RPA container with Playwright base image
3. Set secrets (names only): `SKIN_SCRIPT_RPA_HMAC_SECRET`, portal credentials, HMAC on both sides
4. Verify all product mappings (`verified=1`) in supplier_mappings
5. `SKIN_SCRIPT_MODE=rpa`, `SKIN_SCRIPT_RPA_ENABLED=true`, `SKIN_SCRIPT_DRY_RUN=false`
6. Run controlled dry-run against real portal
7. Enable `AUTO_FULFILL=true` only after dry-run success

## Kill switch

`SKIN_SCRIPT_RPA_ENABLED=false` — jobs remain visible, no purchases.

## Alerts

`FULFILLMENT_ALERT_WEBHOOK_URL` + optional Resend to admin email.
