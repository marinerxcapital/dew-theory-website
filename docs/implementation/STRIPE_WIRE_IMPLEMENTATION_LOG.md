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

## 2026-09-02 — Codex — merge + production deploy

**Signed:** Codex
**Timestamp (UTC):** 2026-09-02T04:35:00Z
**Merged SHA:** `04d653456d4046ff1a1a27bcccc39e95336ea1dd` (PR #17 squash merge)
**Worker version:** `ffac28e6-b77a-42da-a668-ba6154556378`

### Completed

- Marked PR #17 ready and squash-merged `cursor/stripe-wire-e021` → `main` (delete-branch).
- Local gates: `npm install` (up to date), `npm test` **232 pass / 0 fail**, `npm run build` success, `npm run continuity` OK.
- Deployed Worker `dew-theory` under MarinerX Capital OAuth `skyler@marinerxcapital.com`.
- Production verification:
  - `npm run smoke:routes -- https://dewtheoryco.com` → all clear (22 checks incl. 8 legal PDFs).
  - `POST /api/webhooks/stripe` → 503 `stripe_not_configured` (fail-closed).
  - `POST /api/checkout` (empty cart) → 400 `cart_empty` (route live, new code).
  - `/admin/integrations` → 307 → `/admin/login`.
  - `/admin/login` → 200 with no Stripe secret markers (`sk_test`, `sk_live`, `price_`, `STRIPE_WEBHOOK_SECRET`).
  - Homepage still serves `Shop Skin Script` + `Virtual Consultation`.

### Not completed (owner-gated)

Stripe secret **values** are not present in this checkout (no `.env.local`/`.dev.vars`), so none of the `STRIPE_*` secrets were set on the Worker. Until the owner runs `wrangler secret put` for the five Stripe vars (and enables Stripe Tax or sets `STRIPE_TAX_ENABLED=false`), live Stripe checkout, webhook-paid D1 writes, and the admin Stripe "healthy" panel cannot be exercised against production.

### Note on `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Checkout is redirect-based (server-side `stripe.checkout.sessions.create`); no client bundle loads Stripe.js. The publishable key is only read server-side in `lib/admin/stripe-health.js` as a "configured" flag, so it can be set as a Worker secret without any client-build implication.
