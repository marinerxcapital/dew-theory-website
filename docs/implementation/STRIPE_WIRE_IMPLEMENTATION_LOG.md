# Stripe wiring — implementation log

## 2026-09-01 — Cursor (`cursor/stripe-wire-e021`)

| Field | Value |
|-------|-------|
| Base SHA | `dd20e77` |
| Branch | `cursor/stripe-wire-e021` |

### Completed

- Shared Stripe client + Checkout extensions in `lib/stripe/config.js`
- **Stripe Tax:** `automatic_tax` on shop + VC Checkout when `STRIPE_TAX_ENABLED` (default true)
- Webhook handler persists events to durable commerce (`commerceUpsertWebhookEvent`)
- Bootstrap script: `npm run stripe:bootstrap` — VC product/price + webhook registration
- Tests: `tests/stripe-config.test.mjs` (232 total pass)

### Verified locally (test mode)

- Stripe API connection: **healthy** (`sk_test_…`)
- VC Price ID created: `price_1UAs0SHduoXRObFl9oFsdRuX` ($95)
- Webhook endpoint registered: `https://dewtheoryco.com/api/webhooks/stripe`
- Webhook signing secret stored in `.env.local` only (not committed)

### Production (not done — requires wrangler auth)

Worker secrets must be set on Cloudflare. See `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`.

### Owner Dashboard actions

1. Enable **Stripe Tax** (Settings → Tax) for automatic tax on Checkout
2. When going live: swap test keys for live keys + new webhook secret

### Security

- Secret keys never committed to git
- Test keys configured in `.env.local` only
- Recommend rotating test keys if exposed in chat logs
