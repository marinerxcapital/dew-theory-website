# Admin Command Center Runbook

## Emily login (production)

1. Set Worker secrets:
   - `ADMIN_OWNER_EMAIL` — Emily's verified email (must match `Admins` row)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login credentials (non-default)
   - `ADMIN_SESSION_SECRET` — long random string (not dev default)
   - `ADMIN_TOTP_SECRET` + `ADMIN_REQUIRE_TOTP=true` when 2FA required
2. Ensure `data/store.json` (or synced admin source) has an `Admins` row with matching email and `role: owner`.
3. Visit `https://dewtheoryco.com/admin/login` — unauthenticated users cannot access `/admin`.

## Verify command center

After deploy:

```bash
npm run smoke:routes -- https://dewtheoryco.com
```

Manual checks:

- `/admin` shows overall status, KPIs, connections (may be empty/zero in early production)
- `/admin/fulfillment` lists durable jobs from D1
- `/admin/integrations` shows Stripe/RPA status without secret values
- Mobile: nav drawer works; no horizontal overflow on KPI strip

## When fulfillment is blocked

1. Check `/admin/integrations` — RPA reachable, mappings verified, mode not dry-run if production purchase expected
2. Check `/admin/fulfillment` — job `error_message` / `error_code`
3. Check attention queue on `/admin`
4. For human verification / CAPTCHA blocks — do not bypass; resolve on Skin Script portal

## Data freshness

Dashboard shows `checkedAt` timestamps per connection. Stale RPA/Stripe indicates probe failure or cache — refresh page; if persistent, check Worker secrets and outbound network.

## Rollback

Revert Worker deployment to prior version in Cloudflare dashboard. Admin is read-heavy; no destructive schema changes in this feature.
