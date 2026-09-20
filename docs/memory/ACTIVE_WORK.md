# Active Work — Dew Theory

**Signed:** Cursor Cloud Agent (site polish rebase)  
**Last updated (UTC):** 2026-09-20  
**Current branch:** `cursor/site-polish-ux-68ea` (PR #23 — storefront UX polish)  
**`origin/main` (rebase base):** `6e518e0` (PR #24 catalog honesty) after PR #21 secrets-closeout docs `243858d`  
**Catalog honesty:** Emily did **not** confirm SPF retail, lip SKU structure, mask size, or DEW15 rate. Defaults remain engineered and explicitly unconfirmed (PR #24).  
**Canonical clone:** `C:\Users\Skyler B. Brown\Desktop\dew-theory` (do **not** use `Desktop\Projects\dew-theory` — stale at `e9f64da`)

## Security cleanup (2026-09-20)

- **Closed PR #20 without merge** (draft Codex handoff that committed filled credential files under `docs/handoffs/`). Remote branch `cursor/codex-handoff-desktop-e021` **deleted**.
- **Do not restore that branch.** If the Raw GitHub URL for the copy-paste handoff was ever fetched or shared, **rotate Worker Stripe secrets** (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) plus admin password/session, `CRON_SECRET`, and `SKIN_SCRIPT_RPA_HMAC_SECRET`. Never put values in git.
- Also closed obsolete draft-only handoffs: PR #13 (Codex takeover prompt), PR #18 (SuperGrok master prompt), PR #10 (RPA/D1 closeout — fully superseded on `main`).
- Scan of remaining remotes found **no other filled COPYPASTE/FILLED handoff files**. Remaining `sk_test_` / `ADMIN_PASSWORD=` hits on `main` are documented placeholders (`ENV.md`, `.env.example`, unit-test dummies). One stale non-PR branch `supergrok/mobile-consultation-production` has a filled `CRON_SECRET=` assignment in `Dew Theory - Architecture To Implement.txt` — do not merge that file; treat as suspect.

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
7. **Emily catalog confirmation (2026-09-19 still pending):** SPF retail $30, lip one-SKU + variants, Botanical Bloom 2 oz, DEW15 15% launch-promo placeholder. Do not flip honesty flags without her answer.

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
