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

## Post-deploy smoke checklist

```text
# HTML routes (expect 200)
/  /shop  /services  /book  /about  /virtual-consultation  /contact  /cart  /faq
/privacy  /terms  /shipping  /returns  /booking-policy  /aesthetic-disclaimer  /cookies  /accessibility
/membership   # LIVE interest-list route (NOT a redirect)
/admin/login

# FIXED V2 PDFs (expect 200 + application/pdf)
/legal/pdfs/DEW_THEORY_PRIVACY_POLICY.pdf
/legal/pdfs/DEW_THEORY_TERMS_OF_USE_AND_SALE.pdf
/legal/pdfs/DEW_THEORY_SHIPPING_AND_DELIVERY_POLICY.pdf
/legal/pdfs/DEW_THEORY_RETURNS_REFUNDS_AND_EXCHANGES_POLICY.pdf
/legal/pdfs/DEW_THEORY_BOOKING_CANCELLATION_AND_NO_SHOW_POLICY.pdf
/legal/pdfs/DEW_THEORY_AESTHETIC_SERVICES_AND_SKINCARE_DISCLAIMER.pdf
/legal/pdfs/DEW_THEORY_COOKIE_AND_TRACKING_TECHNOLOGIES_NOTICE.pdf
/legal/pdfs/DEW_THEORY_ACCESSIBILITY_STATEMENT.pdf
/legal/pdfs/DEW_THEORY_VIRTUAL_CONSULTATION_TERMS_AND_INFORMED_CONSENT.pdf
/legal/pdfs/DEW_THEORY_CONSULTATION_PHOTO_AND_INTAKE_AUTHORIZATION.pdf
```

Homepage hero check: full-bleed `dew theory` brand lockup + full-bleed product plane, no
inset cards/promo chips; `Shop Skin Script` + `Take the Skin Quiz` CTAs; dew-particle canvas +
ken-burns/caustic motion (hidden under `prefers-reduced-motion`).

Automated check:

```bash
npm run smoke:routes -- https://dewtheoryco.com
```

## Latest successful deploy

| Item | Value |
|---|---|
| Main SHA | `1e56d6c96d0075811e806af952673e1d6a09e4ba` |
| Worker | `dew-theory` |
| Version ID | `e6bc265f-97d8-4518-a96b-6f37a0983bca` |
| Timestamp (UTC) | `2026-08-16T05:54:19Z` |
| Evidence | `docs/PRODUCTION_DEPLOY_LOG_2026-08-16.md` |

## Skin Script

No API key required. Use CSV import + admin order statuses for real wholesale.

## Admin

Production rejects default password `dew-admin-dev`. Use secrets set above.
