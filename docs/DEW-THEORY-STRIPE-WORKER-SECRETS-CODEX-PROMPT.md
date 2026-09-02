# Dew Theory — Stripe Worker Secrets + Production Go-Live (Codex Prompt)

**Copy this entire file into Codex on your Windows machine.**

Repository: `marinerxcapital/dew-theory-website`  
Branch: merge `cursor/stripe-wire-e021` → `main` first (or checkout branch)

---

## Context

Cursor wired Stripe **test mode** locally:

- Shared config: `lib/stripe/config.js` (Payments + Tax)
- Bootstrap: `npm run stripe:bootstrap`
- VC Price: `price_1UAs0SHduoXRObFl9oFsdRuX` ($95 test)
- Webhook URL registered in Stripe test account: `https://dewtheoryco.com/api/webhooks/stripe`
- `.env.local` has keys + webhook secret — **do not commit**

Production Worker still returns **503** on webhook until Cloudflare secrets are set.

---

## Step 1 — Merge and verify

```powershell
git fetch origin
git checkout main
git pull origin main
# After PR merge, or: git checkout cursor/stripe-wire-e021
npm install
npm test
npm run build
node scripts/check-project-continuity.mjs
```

---

## Step 2 — Cloudflare auth

```powershell
npx wrangler login
npx wrangler whoami
```

---

## Step 3 — Push Worker secrets (names only in repo; paste values interactively)

From repo root, with values from `.env.local` or Stripe Dashboard:

```powershell
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
npx wrangler secret put STRIPE_TAX_ENABLED
```

For `STRIPE_TAX_ENABLED` enter: `true`

Optional: re-run bootstrap if price ID differs:

```powershell
node --env-file=.env.local scripts/stripe-bootstrap.mjs --webhook-url https://dewtheoryco.com/api/webhooks/stripe
```

---

## Step 4 — Deploy Worker

```powershell
npm run deploy
```

Record deployed SHA in `DEW-THEORY-CURRENT-STATUS.md`.

---

## Step 5 — Verify production

```powershell
npm run smoke:routes -- https://dewtheoryco.com
```

Manual:

1. Add item to cart → checkout → Stripe Checkout redirect (test card `4242…`)
2. Confirm order in `/admin/orders` after webhook
3. `/admin/integrations` → Stripe panel **healthy** (no secrets in HTML)
4. Virtual consultation checkout uses VC price
5. Webhook: Stripe Dashboard → send test `checkout.session.completed`

---

## Step 6 — Stripe Tax (Dashboard)

1. Stripe Dashboard → **Settings → Tax** → Enable
2. Set business address + product tax categories
3. Test checkout shows tax line for US shipping address

If Tax not enabled yet, set Worker secret `STRIPE_TAX_ENABLED=false` temporarily.

---

## Step 7 — Memory updates

Update:

- `DEW-THEORY-CURRENT-STATUS.md` (Stripe test/live status, deploy SHA)
- `OPEN_ITEMS.md` (resolve Stripe config item)
- `docs/implementation/STRIPE_WIRE_IMPLEMENTATION_LOG.md`
- `docs/deploy/ADMIN_COMMAND_CENTER_DEPLOYMENT_LOG.md` (Stripe panel verification)

---

## Remaining after Stripe (unchanged)

| Task | Owner |
|------|-------|
| Fly.io RPA deploy | `fly auth login` + secrets |
| Emily Skin Script saved payment | Emily portal |
| Live supplier order | After RPA + payment |
| Emily admin login + TOTP | Owner credentials |

See also: `docs/DEW-THEORY-FINAL-CODEX-COMPLETION-PROMPT.md`

---

## Definition of done

- [ ] Worker secrets set (5 Stripe vars)
- [ ] `npm run deploy` success
- [ ] Test checkout completes on dewtheoryco.com
- [ ] Webhook marks order paid in D1
- [ ] Admin Stripe integration healthy
- [ ] Memory docs updated with verified SHA + test commands
