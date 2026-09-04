# Active Work — Dew Theory

**Signed:** SuperGrok (Lead Orchestrator / Memory)  
**Last updated (ET):** 2026-09-04 ~10:30 ET  
**Canonical clone:** `C:\Users\Skyler B. Brown\Desktop\dew-theory` (do **not** use `Desktop\Projects\dew-theory` — stale at `e9f64da`)  
**Branch:** `cursor/supergrok-wave0-durable-orders-e021` (SuperGrok work)  
**`main` HEAD:** `a11626fc4e5aa67d4c5ea0269ea6d1c0e0b89370`  
**Latest feature on `main`:** PR #17 Stripe wiring `04d6534` (deployed; docs closeout `a11626f` may sit ahead of live Worker)

## Wave 0 verification (2026-09-04)

| Gate | Result |
|------|--------|
| `npm test` | **241 pass** (post Wave 2/7/8/9 tests) |
| RPA `pytest` | **15 pass** |
| `ruff` | clean |
| `npm run continuity` | OK |
| `npm run smoke:routes -- https://dewtheoryco.com` | all clear |
| Live `POST /api/webhooks/stripe` | **503** `stripe_not_configured` (fail-closed) |
| Live `/admin` | **307** → `/admin/login` |
| Wrangler vars | `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false` |
| Stripe Worker secrets | **NOT SET** |
| Fly RPA | **not deployed** / blocked by owner auth |

**Public surface (verified):** Shop, PDP, Cart/Checkout, Virtual Consultation, legal pages.  
**Not public live:** `/book`, `/services`, `/membership` (and related unpublished routes) → application **404**.

## Status

- Durable commerce D1 + Admin Command Center + Stripe Checkout/webhook/Tax **code** are on production Worker from PR #17; Stripe secrets still absent → webhook stays 503.
- **Wave 2 (pending Stripe checkout → D1):** **code complete on branch** (`persistPendingCheckoutOrder`, durable-first webhook, durable webhook idempotency) — deploy with this branch; production Stripe E2E still needs secrets.
- **Wave 4:** Image ZIP at `dist\Dew-Theory-Skin-Script-Product-Images-2026-09-04.zip` (SHA256 `6DBCAFA9…BEBD7`).
- **Wave 7/8:** Owner manual fulfillment panel + admin nav gaps + honest automation labels.
- **Wave 9/10:** VC mock honesty + RPA SSRF allowlist on signedFetch.
- RPA portal recon + local dry-run previously verified; production RPA container still owner-blocked.
- Final report: `docs/implementation/SUPERGROK_FINAL_REPORT.md`

## Remaining (owner / infra — not inventable in code)

1. **Stripe Worker secrets** — `wrangler secret put` for `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`, `STRIPE_TAX_ENABLED` (see `docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`); then test-card checkout + webhook-paid D1 verify.
2. **Fly.io RPA deploy** — owner `fly auth login` or `FLY_API_TOKEN` (+ GitHub Actions secrets if using workflow).
3. Worker `SKIN_SCRIPT_RPA_*` / portal credential secrets after RPA host exists.
4. Saved payment method on Skin Script wholesale account (Emily).
5. One **controlled live supplier order** after 2–4.
6. Finish / review Wave 2 durable pending-checkout on this branch; merge + deploy only after gates.

## Next exact commands

```bash
cd "C:\Users\Skyler B. Brown\Desktop\dew-theory"
git fetch origin
git checkout cursor/supergrok-wave0-durable-orders-e021
git status
git rev-parse HEAD

npm test
npm run continuity
npm run smoke:routes -- https://dewtheoryco.com

# RPA unit gates (from services/skin-script-rpa when Python env ready)
python -m pytest -q
python -m ruff check .

# After owner sets Stripe secrets on Worker:
# wrangler secret put STRIPE_SECRET_KEY
# wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# wrangler secret put STRIPE_WEBHOOK_SECRET
# wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
# wrangler secret put STRIPE_TAX_ENABLED
# then re-check: POST /api/webhooks/stripe (no longer stripe_not_configured for unsigned empty — expect signature failure without valid Stripe sig)
```

See `DEW-THEORY-CURRENT-STATUS.md`, `OPEN_ITEMS.md`, and `docs/implementation/SUPERGROK_EXECUTION_LOG.md`.
