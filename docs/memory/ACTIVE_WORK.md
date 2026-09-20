# Active Work — Dew Theory

**Signed:** Cursor Cloud Agent  
**Last updated (UTC):** 2026-09-20  
**Branch:** `cursor/skin-script-rpa-go-live-17c7` (PR #22, rebase onto `main`)  
**`main` HEAD (rebase base):** `8f7786a` (PR #23 site polish) after `6e518e0` (PR #24 catalog honesty) and `243858d` (PR #21 secrets-closeout)  
**Catalog honesty:** Emily did **not** confirm SPF retail, lip SKU structure, mask size, or DEW15 rate. Defaults remain engineered and explicitly unconfirmed (PR #24).

## This session (PR #22 rebase)

Advance Skin Script fulfillment as far as code + docs allow without owner credentials, then rebase onto latest `main` so catalog honesty and secrets-closeout notes are kept.

| Item | Outcome |
|---|---|
| Audit `main` fulfillment | mock + `AUTO_FULFILL=false`; durable paid → job; admin manual panel; no live RPA |
| Production-honest labels | Admin + cart confirmation + `/shipping` do not imply live supplier automation |
| PR #10 | **Superseded** — D1 closeout already on `main`; merging would delete later work |
| Owner runbook | `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md` |
| Code bugs | `fulfillOrder` now completes jobs created in the same call; failures write to commerce-only orders |
| Deploy | **Not done** (no Fly; no Worker deploy this session) |
| Live order | **Not done** |
| Rebase | Onto `origin/main` after PR #21 + #24 + #23; keep fulfillment honesty + catalog/secrets + polish notes |

## Live probe (2026-09-20)

- `POST https://dewtheoryco.com/api/webhooks/stripe` → **400 `missing_signature`**

## Security cleanup (2026-09-20, from PR #21)

- **Closed PR #20 without merge** (draft Codex handoff that committed filled credential files under `docs/handoffs/`). Remote branch `cursor/codex-handoff-desktop-e021` **deleted**.
- **Do not restore that branch.** If the Raw GitHub URL for the copy-paste handoff was ever fetched or shared, **rotate Worker Stripe secrets** (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) plus admin password/session, `CRON_SECRET`, and `SKIN_SCRIPT_RPA_HMAC_SECRET`. Never put values in git.
- Also closed obsolete draft-only handoffs: PR #13 (Codex takeover prompt), PR #18 (SuperGrok master prompt), PR #10 (RPA/D1 closeout — fully superseded on `main`).
- Scan of remaining remotes found **no other filled COPYPASTE/FILLED handoff files**. Remaining `sk_test_` / `ADMIN_PASSWORD=` hits on `main` are documented placeholders (`ENV.md`, `.env.example`, unit-test dummies). One stale non-PR branch `supergrok/mobile-consultation-production` has a filled `CRON_SECRET=` assignment in `Dew Theory - Architecture To Implement.txt` — do not merge that file; treat as suspect.

## Catalog honesty (PR #24, merged)

Emily did **not** confirm SPF retail, lip SKU structure, mask size, or DEW15 rate. Defaults remain engineered and explicitly unconfirmed (`retail_price_confirmed` / `size_confirmed` / `rate_confirmed` stay false). Do not flip honesty flags without her answer.

## Remaining owner / infra

1. Confirm Stripe test-card checkout → webhook → D1 paid (webhook already returns `400 missing_signature`; rotate secrets if the PR #20 Raw URL was ever fetched).
2. Fly.io auth + RPA container (`FLY_API_TOKEN` / `fly auth login`).
3. Worker `SKIN_SCRIPT_RPA_HMAC_SECRET` + `SKIN_SCRIPT_RPA_SERVICE_URL`.
4. Emily saved payment method on Skin Script wholesale.
5. One controlled live supplier order after dry-run.
6. Emily catalog confirmation: SPF retail $30, lip one-SKU + variants, Botanical Bloom 2 oz, DEW15 15% launch-promo placeholder.

See `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md`.
