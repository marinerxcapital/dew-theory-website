# Skin Script RPA Deployment

## Storefront (Cloudflare Workers)

1. Create D1 database `dew-theory-commerce` in Cloudflare dashboard
2. Update `wrangler.jsonc` `DEW_THEORY_D1.database_id` with real ID
3. Apply migration: `wrangler d1 execute dew-theory-commerce --file=migrations/001_commerce_schema.sql`
4. Set Worker secrets via `wrangler secret put`:
   - `SKIN_SCRIPT_RPA_HMAC_SECRET`
   - `SKIN_SCRIPT_RPA_SERVICE_URL`
   - Stripe keys (existing)
5. Set vars: `SKIN_SCRIPT_MODE=rpa`, `SKIN_SCRIPT_RPA_ENABLED=false` until dry-run complete

## RPA service (container runtime)

```bash
docker build -t dew-theory-skin-script-rpa services/skin-script-rpa
```

Deploy to a runtime supporting stable Playwright/Chromium (Railway, Fly.io, ECS, etc.).

Required env: see `ENV.md` Skin Script RPA section.

Health: `GET /health`, `GET /ready`

## Rollback

1. Set `SKIN_SCRIPT_RPA_ENABLED=false`
2. Set `AUTO_FULFILL=false`
3. Revert Worker deploy if needed — D1 data retained

See `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md` for session history.
