# Production deploy — dewtheoryco.com

**Account:** MarinerX Capital (Cloudflare)  
**Worker:** `dew-theory`  
**Domain:** `https://dewtheoryco.com` (+ `www`)

## What’s wired

| Piece | Status |
|-------|--------|
| R2 ISR cache | `dew-theory-opennext-cache` |
| D1 tag cache | `dew-theory-tag-cache` |
| Custom domains | `dewtheoryco.com`, `www.dewtheoryco.com` |
| Public URL var | `NEXT_PUBLIC_SITE_URL=https://dewtheoryco.com` |
| Skin Script | `SKIN_SCRIPT_MODE=mock` (no API) |
| Auto mock PO | `AUTO_FULFILL=false` (honest manual wholesale) |

## Deploy command

```bash
npm run deploy
# = opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

## Production secrets (Worker)

Set with Wrangler (not in git):

```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
# later when Stripe is ready:
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Stripe webhook (after Stripe keys)

Endpoint:

```text
https://dewtheoryco.com/api/webhooks/stripe
```

Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.

## Skin Script

No API key required. Use CSV import + admin order statuses for real wholesale.

## Admin

Production rejects default password `dew-admin-dev`. Use secrets set above.
