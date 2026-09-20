# Skin Script RPA — owner go-live runbook

Single owner checklist. **Do not invent credentials, payment methods, or a live supplier order.**
Agents and CI cannot complete the steps below.

Canonical architecture: [`docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md`](../SKIN_SCRIPT_RPA_ARCHITECTURE.md).  
Session history: [`docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md`](./SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md).  
This file is the remaining **owner action list** only.

---

## Current production-honest state (re-verify before acting)

| Item | Last verified | Meaning |
|---|---|---|
| Worker vars | `wrangler.jsonc` + 2026-09-04 / 2026-09-20 audits | `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false` |
| Durable commerce | D1 `dew-theory-commerce` `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` | Orders + fulfillment jobs persist when checkout/webhook write them |
| Supplier mappings | Remote D1 seed (2026-09-01) | 8 catalog rows `verified=1` — re-read with `wrangler d1 execute` before live RPA |
| Stripe webhook | `POST https://dewtheoryco.com/api/webhooks/stripe` (2026-09-20) | `400 missing_signature` — secret is present; unsigned posts fail closed. Was `503 stripe_not_configured` on 2026-09-04 |
| Fly.io RPA | Historically blocked | No Fly auth / `FLY_API_TOKEN` in agent or GitHub Actions secrets |
| Live Skin Script purchase | Not done | Needs saved payment method + owner authorization |

Admin Command Center (`/admin`) and customer confirmation/shipping copy must say **owner / mock queue**, not live automation, while the Worker vars above remain.

---

## Do not flip these until the later steps are done

Keep production at:

```text
SKIN_SCRIPT_MODE=mock
AUTO_FULFILL=false
SKIN_SCRIPT_RPA_ENABLED   # unset or false
SKIN_SCRIPT_DRY_RUN=true  # if you set RPA mode at all
```

`shouldAutoFulfill()` returns false when `AUTO_FULFILL=false`.  
It also returns false when `SKIN_SCRIPT_MODE=rpa` and `SKIN_SCRIPT_RPA_ENABLED` is not `true`.

---

## 1. Fly.io auth and RPA container (not done in this repo)

This environment must **not** deploy to Fly. Owner does it.

1. Create / confirm a Fly org that is **Dew Theory / MarinerX** (not CertaMaris).
2. Authenticate on a trusted machine:

   ```bash
   fly auth login
   # or export FLY_API_TOKEN=...  (never commit)
   ```

3. Optional CI: GitHub repo **Settings → Secrets and variables → Actions**

   | Secret | Purpose |
   |---|---|
   | `FLY_API_TOKEN` | `.github/workflows/deploy-production.yml` `deploy_rpa` |
   | `FLY_APP` | Optional; default `dew-theory-skin-script-rpa` |
   | `CLOUDFLARE_API_TOKEN` | Worker deploy job (separate from RPA) |
   | `CLOUDFLARE_ACCOUNT_ID` | Worker deploy job |

4. First Fly create (template: `services/skin-script-rpa/fly.toml`):

   ```bash
   cd services/skin-script-rpa
   fly apps create dew-theory-skin-script-rpa --org <dew-theory-org>
   fly volumes create skin_script_storage --region dfw --size 1
   fly deploy --remote-only
   ```

5. Container secrets (values from Emily’s password manager — **never commit**):

   ```bash
   fly secrets set \
     HMAC_SECRET=<same value as Worker SKIN_SCRIPT_RPA_HMAC_SECRET> \
     USERNAME=<Emily Skin Script wholesale username> \
     PASSWORD=<Emily Skin Script wholesale password>
   ```

   Aliases `SKIN_SCRIPT_USERNAME` / `SKIN_SCRIPT_PASSWORD` are also accepted by `services/skin-script-rpa/app/config.py`.

6. Leave Fly `[env] DRY_RUN = "true"` until a controlled live order is approved.

7. Confirm `GET https://<fly-app-host>/health` and `/ready` return 200. Record the public HTTPS base URL.

---

## 2. Worker `SKIN_SCRIPT_RPA_*` secrets (names only)

On a machine with `wrangler` logged in as the MarinerX Cloudflare account:

```bash
# Shared HMAC — generate a long random value; set the SAME value on Fly HMAC_SECRET
wrangler secret put SKIN_SCRIPT_RPA_HMAC_SECRET

# Public HTTPS origin of the Fly app, no trailing path
wrangler secret put SKIN_SCRIPT_RPA_SERVICE_URL
```

Optional Worker-side names (only if you want them on the Worker, not just the container):

```text
SKIN_SCRIPT_PORTAL_BASE_URL     # https://skinscript.com
SKIN_SCRIPT_LOGIN_URL           # https://skinscriptrx.com/my-account/
SKIN_SCRIPT_USERNAME
SKIN_SCRIPT_PASSWORD
SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME   # Emily
```

Portal credentials belong on the **RPA container**, not in git. Prefer Fly secrets. Do not paste values into PRs, chat, or `wrangler.jsonc`.

Keep `SKIN_SCRIPT_RPA_ENABLED` **unset or false** until dry-run against the deployed container succeeds.

---

## 3. Emily portal payment method (owner / Emily)

Live RPA checkout is blocked until the wholesale account has a **saved payment method**.

1. Sign in headed at `https://skinscriptrx.com/my-account/` (session continues on `skinscript.com`).
2. Add a card / NMI saved method on the account Emily uses for wholesale.
3. Confirm dropship “Yes - Ship direct to client” still works and that **client address fields are editable** in a headed browser (headless mapping was often read-only).
4. Do **not** place a customer-facing Dew Theory order yet.

If CAPTCHA or MFA appears, stop. Record `blocked_human_verification`. Never bypass.

---

## 4. First controlled live order (owner-authorized only)

Prerequisites: steps 1–3, 8/8 `verified=1` mappings re-read from D1, Stripe test or live paid order you intend to fulfill.

1. Deploy Worker with vars still **dry-run**:

   ```text
   SKIN_SCRIPT_MODE=rpa
   SKIN_SCRIPT_RPA_ENABLED=true
   SKIN_SCRIPT_DRY_RUN=true
   AUTO_FULFILL=false
   ```

2. From a trusted machine, run the existing operator dry-run (needs portal secrets locally or against the Fly service):

   ```bash
   npm run e2e:rpa-live
   ```

   Expected: `dry_run_ready`. If not, do not enable purchasing.

3. Place **one** low-value paid Dew Theory order (real customer or Emily self-order). Confirm D1 `orders` + `fulfillment_jobs` rows.

4. Fulfill from `/admin/orders/<id>` only after reading the job. First live purchase:

   ```text
   SKIN_SCRIPT_DRY_RUN=false
   AUTO_FULFILL=false          # keep owner-triggered until the first PO is confirmed
   ```

   Use admin Auto-submit / RPA path once — not a second click, not a parallel Fly job.

5. Confirm Skin Script PO number, then tracking. Record both on the order via **Manual owner fulfillment** if the portal confirmation is ambiguous.

6. Only after that PO is verified, consider `AUTO_FULFILL=true`. Kill switch: `SKIN_SCRIPT_RPA_ENABLED=false` and/or `AUTO_FULFILL=false`.

---

## 5. Stripe (related, not RPA)

Webhook on live now requires `stripe-signature` (`400 missing_signature` without it). Owner still confirms:

- Dashboard webhook URL `https://dewtheoryco.com/api/webhooks/stripe`
- Worker secrets `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`
- One test-card checkout → webhook → D1 `paid` + fulfillment job `queued_for_supplier`

See [`docs/DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md`](../DEW-THEORY-STRIPE-WORKER-SECRETS-CODEX-PROMPT.md).

---

## 6. What code already does (no owner action)

- Paid → webhook / mock checkout → `persistPaidOrderWithJob` (durable order + outbox job)
- `AUTO_FULFILL=false` skips `fulfillOrder` so mock/RPA adapters do not purchase
- Admin `/admin/fulfillment` + order-detail **Manual owner fulfillment** record PO / tracking without calling Skin Script
- Production copy (admin + cart confirmation + `/shipping`) labels mock / owner queue when RPA is not live

---

## Rollback

```text
wrangler secret / vars: SKIN_SCRIPT_RPA_ENABLED=false
wrangler vars:          AUTO_FULFILL=false
                        SKIN_SCRIPT_MODE=mock
```

D1 orders remain. Fly app can stay up; Worker will not call it.
