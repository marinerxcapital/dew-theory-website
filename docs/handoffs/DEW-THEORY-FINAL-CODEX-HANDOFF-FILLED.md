# DEW THEORY — FINAL CODEX HANDOFF (FILLED + FULL OWNER AUTHORIZATION)

**Audience:** A **fresh Codex session** on the owner Mini PC (Windows PowerShell).  
**Purpose:** Last LLM closeout prompt. SuperGrok finished Waves 0–13 / PR #19 engineering. Codex completes owner/third-party-blocked go-live work, verifies end-to-end, updates memory, and closes the project.  
**Owner authorization (Skyler / MarinerX — 2026-09-04):** Codex has **full authorization** to execute every step in this file, including Cloudflare `wrangler` login/secrets/deploy, Stripe Dashboard/API/CLI operations in **test mode**, production test-card checkout on dewtheoryco.com, admin login verification, D1 reads, merging PR #19, and any other non-destructive interrogation needed to finish. Codex must **not** place a live Skin Script supplier purchase order and must **not** switch Stripe to live keys unless the owner later revises this file in writing.

**SECURITY:** This file contains secrets. Keep on Desktop. Do **not** commit to git. Scrub/delete after secrets are on the Worker.

Copy this **entire** file into a fresh Codex session. Read it completely. Then begin Wave A.

---

## 0. FULL AUTHORIZATION STATEMENT (OWNER)

Codex is authorized to:

1. Use the canonical repo `C:\Users\Skyler B. Brown\Desktop\dew-theory` only (not the stale `Projects\dew-theory` clone).
2. Run `wrangler login` / use existing Wrangler OAuth; put all secrets listed below; `npm run deploy`.
3. Use the Stripe **test** secret/publishable keys and webhook secret in this file; call Stripe API; use Stripe CLI if installed; verify/create webhook endpoint `https://dewtheoryco.com/api/webhooks/stripe`.
4. Run a real **test-mode** checkout on https://dewtheoryco.com with card `4242 4242 4242 4242`.
5. Log into `/admin` as Emily with the credentials below to verify the Command Center.
6. Merge PR #19 to `main` (`gh pr merge 19` or GitHub UI equivalent).
7. Read local `.env.local` for Skin Script password if present; interrogate D1, Worker versions, health endpoints, admin HTML for secret leakage.
8. Update all project memory/status/deploy logs with verified results (no secret values in git-tracked docs).

Codex is **not** authorized to:

- Charge live Stripe keys / live customer cards.
- Place a live Skin Script Place Order / spend wholesale payment.
- Bypass CAPTCHA, MFA, or anti-bot controls.
- Commit secrets, PANs, or passwords into git.
- Force-push or destroy unknown local work.

---

## 1. MISSION

You are the final closer for Dew Theory Skin Care (https://dewtheoryco.com).

1. Canonical repo:
   ```text
   C:\Users\Skyler B. Brown\Desktop\dew-theory
   ```
2. Prefer:
   - Branch: `cursor/supergrok-wave0-durable-orders-e021`
   - PR: https://github.com/marinerxcapital/dew-theory-website/pull/19
   - Feature SHA (SuperGrok): `a57df22950691dcb2a7c8a1f3ea45add69ecd8f7`
   - Worker version at SuperGrok close: `f4a7283e-7953-4852-8102-5c7212ec4c9f`
3. Do **not** rewrite architecture. Engineering for durable pending orders, admin manual fulfillment, and honesty is done.
4. Complete Stripe Worker secrets + test E2E, admin login, PR merge, memory closeout.
5. Keep fulfillment **mock / manual queue** (no Fly RPA live order this session).
6. Stop when Definition of Done is met.

Trace: Stripe → D1 order **with line items** → fulfillment job → admin view. Labels like Connected/Live/Automated are not proof.

---

## 2. FILLED CREDENTIALS & DECISIONS

### 2.1 Stripe (TEST MODE — go live on Worker with these)

| Item | Value |
|------|-------|
| Mode | `test` |
| `STRIPE_SECRET_KEY` | `sk_test_51UArs2HduoXRObFlh8Ekq9hp7O59g694QTjiQG9yGINpEo5t1rMHlu50YNgrMtpa4FfwfGKsTfa22it3xfxVcW0A00ERm3otOy` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51UArs2HduoXRObFl19Hyln2jS1LEpdiLlbybyOqqxJfQPvMr2RPU3b2WN0afTbQNmviMHiMTz2WvzIZRfdF5Al1n00o8CYtLFd` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_gBcuwr9p1beAgqiaHfdXkCl7PW99FckM` |
| Webhook URL | `https://dewtheoryco.com/api/webhooks/stripe` |
| Webhook endpoint ID | `we_1UBzTbHduoXRObFlXmNRNvSa` |
| `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID` | `price_1UAs0SHduoXRObFl9oFsdRuX` ($95) |
| `STRIPE_TAX_ENABLED` | `true` |
| Enable Stripe Tax in Dashboard | `yes` — verify/enable Settings → Tax |
| Production test-card checkout authorized | `yes` |
| Test card | `4242 4242 4242 4242` |

### 2.2 Admin / Emily owner identity

| Item | Value |
|------|-------|
| `ADMIN_OWNER_EMAIL` | `emilyberit1@gmail.com` |
| `ADMIN_EMAIL` | `emilyberit1@gmail.com` |
| `ADMIN_PASSWORD` | `DTSwag2026!` |
| `ADMIN_SESSION_SECRET` | `mk6UMA5HjJDEhhlFUFdnzrQhwt3iIXufMObzOjSeramc05IpwAnZRqj9F_NxSzGV` |
| Enable TOTP this session | `no` |
| `ADMIN_TOTP_SECRET` | `N/A` |

### 2.3 Email (Resend)

| Item | Value |
|------|-------|
| `RESEND_API_KEY` | `SKIP` — log-only |
| `EMAIL_FROM` | `Dew Theory <noreply@dewtheoryco.com>` (inactive until Resend exists) |
| `EMAIL_REPLY_TO` | `emilyberit1@gmail.com` |
| Domain verified | `no` |

### 2.4 Virtual consultation

| Item | Value |
|------|-------|
| `CONSULTATION_SCHEDULING_URL` | `SKIP` |
| `CONSULTATION_ADMIN_EMAIL` | `emilyberit1@gmail.com` |
| `CONSULTATION_TIMEZONE` | `America/Chicago` |

### 2.5 Skin Script / fulfillment

| Item | Value |
|------|-------|
| Capability | `portal-only` (no confirmed official API) |
| Deploy Fly RPA now | `no` — manual owner queue |
| `FLY_API_TOKEN` | `SKIP` |
| `SKIN_SCRIPT_USERNAME` | `emilyberit1@gmail.com` |
| `SKIN_SCRIPT_PASSWORD` | Read from `Desktop\dew-theory\.env.local` if needed; **not required** while Fly=no |
| `SKIN_SCRIPT_RPA_HMAC_SECRET` | `6r6X4sl1pZmWtWOs18vpwQFhQmjXO4jU1eCvWAQlj5BiE62BoVESzlyac4_r1EkO` (store for future RPA; do not enable RPA now) |
| Saved portal payment | `no` |
| First live supplier order authorized | `no` |
| Set `SKIN_SCRIPT_MODE=rpa` | `no` — keep `mock` |
| Set `AUTO_FULFILL=true` | `no` — keep `false` |
| Keep `SKIN_SCRIPT_DRY_RUN=true` if RPA ever enabled | `yes` |

Portal: login `https://skinscriptrx.com/my-account/` · catalog `https://skinscript.com` · 8/8 verified SKUs in `data/supplier/skin-script-portal-urls.json`.

### 2.6 Business confirmations

| Item | Value |
|------|-------|
| SPF retail | `$30` |
| Botanical Bloom size | `2 oz` |
| Lip = one product + Peppermint/Pomegranate variants | `yes` |
| Launch discount | `DEW15` @ `15%` |
| Free-shipping threshold basis | `pre_discount` |

### 2.7 Extras

| Item | Value |
|------|-------|
| Merge PR #19 now | `yes` |
| `CRON_SECRET` | `knq7IiD3OKrTZhmIYh0_0GQ3bxNCtf9fdt4iMB7FnLI` |
| `FULFILLMENT_ALERT_WEBHOOK_URL` | `SKIP` |
| Google Calendar now | `skip` |
| ChatGPT image transform this session | `no` |

Image ZIP (already on disk):

```text
C:\Users\Skyler B. Brown\Desktop\dew-theory\dist\Dew-Theory-Skin-Script-Product-Images-2026-09-04.zip
SHA256: 6DBCAFA9A5B34607FE8801E0715B0EF0BF6685F8259B8FE3328F472CAAFBEBD7
```

---

## 3. NON-NEGOTIABLE RULES

1. Canonical repo path only (section 1).
2. No force-push; no discarding unknown work.
3. No invented APIs, revenue, orders, or “connected” status.
4. No CAPTCHA/MFA bypass.
5. No live Skin Script Place Order.
6. No “automated fulfillment” UI claims while mode is `mock`.
7. Stripe settlement ≠ instant Skin Script cash.
8. Update memory after each major step with real Eastern Time; never put secret values in git-tracked Markdown.
9. Prefer safe reversible changes.

---

## 4. WAVE A — SOURCE TRUTH (ALWAYS FIRST)

```powershell
cd "C:\Users\Skyler B. Brown\Desktop\dew-theory"
git status
git fetch --all --prune
git checkout cursor/supergrok-wave0-durable-orders-e021
git pull origin cursor/supergrok-wave0-durable-orders-e021
git rev-parse HEAD
git log -5 --oneline
npx wrangler whoami
npm ci
npm test
npm run build
node scripts/check-project-continuity.mjs
npm run smoke:routes -- https://dewtheoryco.com
```

Then merge PR #19 (`yes`):

```powershell
gh pr merge 19 --merge
git checkout main
git pull origin main
git rev-parse HEAD
```

---

## 5. WAVE B — STRIPE SECRETS + TEST E2E (HIGHEST PRIORITY)

### B1. Put secrets (paste values from section 2)

```powershell
cd "C:\Users\Skyler B. Brown\Desktop\dew-theory"
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID
npx wrangler secret put STRIPE_TAX_ENABLED
npx wrangler secret put ADMIN_OWNER_EMAIL
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put CONSULTATION_ADMIN_EMAIL
npx wrangler secret put CRON_SECRET
```

### B2. Deploy

```powershell
npm run deploy
```

Record Worker version ID in status + closeout log.

### B3. Webhook probe

Empty/unsigned POST must **not** return `503 stripe_not_configured` (expect `400` signature errors).

### B4. Test checkout (authorized)

1. https://dewtheoryco.com/shop → cart → checkout  
2. Pay `4242 4242 4242 4242`  
3. Confirm paid D1 order with **non-empty items**, fulfillment job, admin detail  
4. Replay webhook → no duplicate fulfill  
5. VC checkout uses Price `price_1UAs0SHduoXRObFl9oFsdRuX` (not mock)

If Stripe Dashboard Tax is off, enable it (authorized).

---

## 6. WAVE C — ADMIN

1. Login `/admin/login` as `emilyberit1@gmail.com` / `DTSwag2026!`  
2. Non-owner rejected  
3. Integrations Stripe healthy; **no secrets in HTML**  
4. Fulfillment labeled mock/manual  
5. Manual fulfillment panel works on test paid order  

---

## 7. WAVE D — EMAIL / VC OPS

Resend SKIP; scheduler SKIP. Keep honest log-only / unconfigured states. `CONSULTATION_ADMIN_EMAIL` already set.

---

## 8. WAVE E — MANUAL FULFILLMENT CLOSEOUT

Keep `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false`. Verify owner manual PO queue + runbook. Do not deploy Fly RPA.

---

## 9. WAVE F — CATALOG CONFIRMS

Apply section 2.6 if products differ; retest; redeploy only if storefront changed.

---

## 10. WAVE G — OPTIONAL

VC pending durability if quick; rate-limit docs only; no fake inventory.

---

## 11. WAVE H — FINAL GATES

```powershell
cd "C:\Users\Skyler B. Brown\Desktop\dew-theory"
npm test
npm run build
node scripts/check-project-continuity.mjs
npm run smoke:routes -- https://dewtheoryco.com
cd services\skin-script-rpa
python -m pytest -q
python -m ruff check .
cd ..\..
```

Update: `DEW-THEORY-CURRENT-STATUS.md`, `OPEN_ITEMS.md`, `docs/memory/ACTIVE_WORK.md`, `docs/implementation/CODEX_FINAL_CLOSEOUT_LOG.md`, deploy logs.

---

## 12. DEFINITION OF DONE

- [ ] PR #19 merged  
- [ ] Stripe test secrets on Worker + deploy  
- [ ] Test checkout E2E passed  
- [ ] Webhook idempotent  
- [ ] Emily admin login works with `DTSwag2026!`  
- [ ] Fulfillment = mock/manual (honest)  
- [ ] No live supplier order  
- [ ] Tests + smoke recorded  
- [ ] Memory updated (no secrets)  
- [ ] Closeout report (section 13)

---

## 13. FINAL CLOSEOUT REPORT

1. Branch + SHA  
2. PR merge status  
3. Worker version ID  
4. Stripe test E2E  
5. Stripe mode (`test`)  
6. Fulfillment mode  
7. Admin login  
8. Email status  
9. Consultation status  
10. Skin Script conclusion  
11. Business confirms  
12. Tests/smoke  
13. Remaining human actions  
14. Next action if any  

---

## 14. BEGIN NOW

Read this file completely. Run Wave A. Execute Wave B with full authorization. Continue C–H. Prefer manual excellence over unsafe RPA. Write the closeout report.

---

## APPENDIX — QUICK SECRET PASTE (operator / Codex interactive only)

```
STRIPE_SECRET_KEY=sk_test_51UArs2HduoXRObFlh8Ekq9hp7O59g694QTjiQG9yGINpEo5t1rMHlu50YNgrMtpa4FfwfGKsTfa22it3xfxVcW0A00ERm3otOy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51UArs2HduoXRObFl19Hyln2jS1LEpdiLlbybyOqqxJfQPvMr2RPU3b2WN0afTbQNmviMHiMTz2WvzIZRfdF5Al1n00o8CYtLFd
STRIPE_WEBHOOK_SECRET=whsec_gBcuwr9p1beAgqiaHfdXkCl7PW99FckM
STRIPE_VIRTUAL_CONSULTATION_PRICE_ID=price_1UAs0SHduoXRObFl9oFsdRuX
STRIPE_TAX_ENABLED=true
ADMIN_OWNER_EMAIL=emilyberit1@gmail.com
ADMIN_EMAIL=emilyberit1@gmail.com
ADMIN_PASSWORD=DTSwag2026!
ADMIN_SESSION_SECRET=mk6UMA5HjJDEhhlFUFdnzrQhwt3iIXufMObzOjSeramc05IpwAnZRqj9F_NxSzGV
CONSULTATION_ADMIN_EMAIL=emilyberit1@gmail.com
CRON_SECRET=knq7IiD3OKrTZhmIYh0_0GQ3bxNCtf9fdt4iMB7FnLI
SKIN_SCRIPT_RPA_HMAC_SECRET=6r6X4sl1pZmWtWOs18vpwQFhQmjXO4jU1eCvWAQlj5BiE62BoVESzlyac4_r1EkO
```
