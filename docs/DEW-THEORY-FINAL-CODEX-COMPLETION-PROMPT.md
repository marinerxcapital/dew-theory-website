# DEW THEORY — Final Codex Completion Prompt

**Repository:** `marinerxcapital/dew-theory-website`  
**Purpose:** Complete all remaining external/deployment tasks Cursor Cloud Agents could not finish.  
**Copy this entire file into Codex as your working prompt.**

---

## 0. Before you start

```bash
git fetch origin
git checkout main
git pull origin main
# Or continue branch: cursor/admin-command-center-e021 if PR not merged
git log -5 --oneline
git rev-parse HEAD
```

Read:

- `DEW-THEORY-CURRENT-STATUS.md`
- `OPEN_ITEMS.md`
- `docs/ADMIN_COMMAND_CENTER_ARCHITECTURE.md`
- `docs/ADMIN_COMMAND_CENTER_RUNBOOK.md`
- `docs/implementation/DEW_THEORY_ADMIN_COMMAND_CENTER_IMPLEMENTATION_LOG.md`
- `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md`

Run:

```bash
npm test
npm run build
node scripts/check-project-continuity.mjs
```

---

## 1. Merge open PRs (if not on main)

- Admin Command Center PR from `cursor/admin-command-center-e021`
- Deploy automation PR from `cursor/finish-dew-theory-completion-e021` (if applicable)

Verify `main` contains: D1 commerce, verified mappings seed, RPA service code, admin command center.

---

## 2. Cloudflare Worker — production deploy

**Why Cursor could not:** No `wrangler whoami` / Cloudflare API token in Cloud Agent VM.

**Required secret NAMES (set via Wrangler, do not commit values):**

- `ADMIN_OWNER_EMAIL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_TOTP_SECRET` (if 2FA enabled)
- `ADMIN_REQUIRE_TOTP`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SKIN_SCRIPT_USERNAME`
- `SKIN_SCRIPT_PASSWORD`
- `SKIN_SCRIPT_RPA_SERVICE_URL`
- `SKIN_SCRIPT_RPA_HMAC_SECRET`
- `SKIN_SCRIPT_RPA_ENABLED`
- `SKIN_SCRIPT_MODE`
- `SKIN_SCRIPT_DRY_RUN`
- `RESEND_API_KEY` (if email live)
- `EMAIL_FROM`

**Commands:**

```bash
npm run deploy
# Or GitHub Actions workflow if configured
```

**Acceptance:**

- `https://dewtheoryco.com` serves new SHA
- `npm run smoke:routes -- https://dewtheoryco.com` passes
- D1 binding `DEW_THEORY_D1` active

**Rollback:** Revert Worker version in Cloudflare dashboard.

---

## 3. D1 — verify commerce data

```bash
npm run seed:verified-mappings:d1
```

Confirm 8 verified Skin Script mappings in production D1 (`cd55d01f-2c27-4b53-a8aa-9b10555d3b17`).

---

## 4. Skin Script RPA service — deploy to Fly.io

**Why Cursor could not:** No `FLY_API_TOKEN` in Cloud Agent.

**Prereqs:** `services/skin-script-rpa/` + `fly.toml` + GitHub Actions workflow (if present).

**Required secrets:**

- `FLY_API_TOKEN`
- Portal credentials (already in Worker secrets)
- `SKIN_SCRIPT_RPA_HMAC_SECRET` (shared with Worker)

**Deploy:**

```bash
cd services/skin-script-rpa
fly deploy
```

Mount storage state for authenticated session when available (see RPA runbook).

**Verify:**

```bash
curl -s https://<rpa-host>/health
curl -s https://<rpa-host>/ready
```

Worker `SKIN_SCRIPT_RPA_SERVICE_URL` must point to this host.

---

## 5. Emily — Skin Script portal saved payment

**Why Cursor could not:** Requires Emily logging into `https://skinscriptrx.com/my-account/` and adding a saved wholesale payment method.

**Acceptance:** Live dry-run transitions to purchasable; live order test succeeds in dry-run-off mode with RPA.

---

## 6. Admin Command Center — production verification

**After Worker deploy:**

1. `/admin/login` — unauthenticated redirect/gate works
2. Emily login with owner email + TOTP if configured
3. Non-owner admin row rejected
4. `/admin` — KPIs, connections, attention queue render (zeros OK if no orders)
5. `/admin/fulfillment` — D1 jobs visible
6. `/admin/integrations` — Stripe/RPA status truthful; **no secrets in HTML**
7. Mobile iPhone viewport — nav drawer, no horizontal overflow
8. `robots.txt` / metadata — admin not indexed

Document results in `docs/deploy/ADMIN_COMMAND_CENTER_DEPLOYMENT_LOG.md`.

---

## 7. Stripe webhook — production

Register webhook endpoint `https://dewtheoryco.com/api/webhooks/stripe` for required events.

Test with Stripe CLI or dashboard replay.

Verify `webhook_events` rows in D1 and admin integrations panel shows recent activity.

---

## 8. Live supplier order (TASK-06)

With RPA deployed, mappings verified, dry-run validated, saved payment on portal:

```bash
npm run e2e:rpa-live
```

Or process a real paid checkout end-to-end.

**Never bypass CAPTCHA/MFA.** Use blocked states if human verification required.

---

## 9. Memory updates (mandatory)

After each completed task update:

- `DEW-THEORY-CURRENT-STATUS.md` (SHA, deploy ID, test commands)
- `OPEN_ITEMS.md` (resolve or add blockers)
- `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md`
- `docs/implementation/DEW_THEORY_ADMIN_COMMAND_CENTER_IMPLEMENTATION_LOG.md`
- `docs/deploy/ADMIN_COMMAND_CENTER_DEPLOYMENT_LOG.md` (when admin verified live)

```bash
node scripts/check-project-continuity.mjs
```

---

## 10. Definition of done

- [ ] `main` deployed to production Worker
- [ ] RPA service reachable from Worker
- [ ] D1 commerce + verified mappings live
- [ ] Emily admin login owner-only verified
- [ ] Command center shows real integration health
- [ ] Stripe webhook processing verified
- [ ] Live or dry-run supplier order path verified (or documented blocker)
- [ ] All memory docs updated with verified SHAs and test output
- [ ] CI green on `main`

---

## 11. If blocked

Record exact blocker in `OPEN_ITEMS.md` with evidence (HTTP status, log snippet without secrets). Do not fabricate success.
