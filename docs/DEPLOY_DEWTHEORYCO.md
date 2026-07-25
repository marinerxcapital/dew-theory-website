# Production deploy — dewtheoryco.com

**Account:** MarinerX Capital (Cloudflare)  
**Worker:** `dew-theory`  
**Domain:** `https://dewtheoryco.com` (+ `www`)

## What’s wired

| Piece | Status |
|-------|--------|
| R2 ISR cache | `dew-theory-opennext-cache` |
| R2 consultation photos (optional, private) | `dew-theory-consultation-photos` → binding `CONSULTATION_PHOTOS_R2` |
| D1 tag cache | `dew-theory-tag-cache` |
| Custom domains | `dewtheoryco.com`, `www.dewtheoryco.com` |
| Public URL var | `NEXT_PUBLIC_SITE_URL=https://dewtheoryco.com` |
| Skin Script | `SKIN_SCRIPT_MODE=mock` (no API) |
| Auto mock PO | `AUTO_FULFILL=false` (honest manual wholesale) |

### Optional: private consultation photo R2 bucket

Workers FS is not durable across isolates. For durable intake photos, create a **private** R2 bucket (no public access) and keep the binding in `wrangler.jsonc`:

```bash
npx wrangler r2 bucket create dew-theory-consultation-photos
```

Binding: `CONSULTATION_PHOTOS_R2` → `dew-theory-consultation-photos`.

Until the bucket exists, application code falls back to FS (local Node) or an in-memory Map (Workers) and must not crash. Create the bucket before relying on multi-isolate photo durability. Do **not** enable a public R2 custom domain for this bucket.

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
# virtual consultation:
npx wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
npx wrangler secret put CONSULTATION_SCHEDULING_URL
npx wrangler secret put CONSULTATION_ADMIN_EMAIL
# optional email + timezone:
# npx wrangler secret put RESEND_API_KEY
# npx wrangler secret put EMAIL_FROM
# npx wrangler secret put CONSULTATION_TIMEZONE
```

## Stripe webhook (after Stripe keys)

Endpoint:

```text
https://dewtheoryco.com/api/webhooks/stripe
```

Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.

Handles both **shop orders** and **virtual consultations** (`metadata.service_type=virtual_consultation`).

## Post-deploy smoke (VC)

```text
https://dewtheoryco.com/
https://dewtheoryco.com/virtual-consultation
https://dewtheoryco.com/admin/consultations  (auth required)
https://dewtheoryco.com/studio → 308 /about
https://dewtheoryco.com/membership → 308 /services
```

## Skin Script

No API key required. Use CSV import + admin order statuses for real wholesale.

## Admin

Production rejects default password `dew-admin-dev`. Use secrets set above.
