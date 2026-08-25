# DEW-THEORY-CODEX-PRODUCTION-DEPLOYMENT-HANDOFF.md

> **Definitive takeover package for Codex** (or any agent with Cloudflare credentials).
> Cursor Cloud completed the editorial brand revamp implementation and verification **locally**, but **could not deploy** to the Worker serving https://dewtheoryco.com because this environment has **no Wrangler login / no `CLOUDFLARE_API_TOKEN`**.
>
> **Independently re-verify** Git, GitHub, CI, hosting, and the live domain. Do not trust stale SHAs in this file.

---

## Mission

Finish the production release of the Dew Theory brand revamp:

1. Ensure the audited revamp commit is on `main` (merge PR if still open)
2. Deploy **that exact commit** to Cloudflare Worker `dew-theory`
3. Directly verify https://dewtheoryco.com (and www)
4. Run full post-deploy smoke
5. Update `DEW-THEORY-CURRENT-STATUS.md` with the final deployed SHA + Worker version ID

A preview deploy, successful Git push, or “deploy started” message is **not** completion.

---

## Verified repository truth (re-check)

| Item | Value at handoff time — RE-VERIFY |
|---|---|
| Repo | `https://github.com/marinerxcapital/dew-theory-website` |
| Origin remote | `origin` → GitHub above |
| Default / production branch | `main` |
| Revamp branch | `cursor/brand-revamp-editorial-5502` |
| Base main SHA when work started | `e9f64da2652832b150811c75db0aa1c504ec656e` |
| First revamp commit | `c2e1a022855b18b3d5ee51cbc142f70027b70ec3` |
| Latest revamp HEAD | `9f5da67c1f38a1a923e9c1d7d6916d8a27d8ff6b` |
| Expect later commits on same branch | `git log origin/cursor/brand-revamp-editorial-5502 -5 --oneline` |
| Working tree at Cursor handoff | Should be clean after final push — run `git status` |
| PR | https://github.com/marinerxcapital/dew-theory-website/pull/7 (draft) — merge then deploy |
| Last **live** production deploy | SHA `1e56d6c` / Worker version `e6bc265f-97d8-4518-a96b-6f37a0983bca` (2026-08-16) — **does not include this revamp** |

```bash
git fetch origin
git rev-parse --show-toplevel
git status --short --branch
git branch --show-current
git rev-parse HEAD
git remote -v
git log -10 --oneline --decorate
gh pr view --head cursor/brand-revamp-editorial-5502 || true
```

---

## Why Cursor could not complete production deployment

- `npx wrangler whoami` → **not authenticated**
- Environment has **no** `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` (or equivalent)
- Deploy path is established: `npm run deploy` = OpenNext build + Wrangler deploy to Worker `dew-theory` with custom domains `dewtheoryco.com` + `www.dewtheoryco.com` (see `wrangler.jsonc`, `docs/DEPLOY_DEWTHEORYCO.md`)

Cursor **did** complete: implementation, local tests, production build, local route smoke, mock checkout smoke (storefront path), branch push, continuity docs.

---

## Exact sequence Codex should execute

### A. Re-verify and land code on `main`

```bash
cd "$(git rev-parse --show-toplevel)"
git fetch origin
git checkout cursor/brand-revamp-editorial-5502
git pull origin cursor/brand-revamp-editorial-5502
git status
npm ci
npm test
npm run build
```

If PR open: merge through permitted workflow (do not force-push protected `main`).  
If already merged: `git checkout main && git pull origin main` and confirm SHA includes revamp.

### B. Deploy exact audited commit

```bash
# Auth — use existing project secrets; do not invent credentials
export CLOUDFLARE_API_TOKEN=...   # from secure store
export CLOUDFLARE_ACCOUNT_ID=...  # if required
# OR: npx wrangler login

git rev-parse HEAD   # record this as FINAL_REVAMP_SHA
npm run deploy
# Capture Worker version ID from Wrangler output
```

### C. Live verification (required)

```bash
curl -sI https://dewtheoryco.com | head -20
curl -sI https://www.dewtheoryco.com | head -20
npm run smoke:routes -- https://dewtheoryco.com
```

Manually confirm on production HTML/CSS:

- Ivory ground `#EDEDE6`, forest text `#1E2B22`
- Sage surfaces `#93A890`, accents `#5B7356`, stone `#C9C4B8`
- Bodoni-style display; hero brand “dew theory”; motifs like “this and no stress”
- Nav, mobile menu, `/shop`, PDP, add-to-cart, cart update/remove, checkout handoff (no real paid order unless Stripe test mode)
- Forms where safe, policies, FAQ, footer, favicon, metadata, sitemap, robots, redirects, 404
- HTTPS valid; www ↔ apex canonical relationship as configured

### D. Record success

Update `DEW-THEORY-CURRENT-STATUS.md` **CURRENT PRODUCTION STATE** with:

- Final deployed SHA
- Worker version ID
- Deploy timestamp
- Smoke results

Append a new log under `docs/` (e.g. `docs/PRODUCTION_DEPLOY_LOG_YYYY-MM-DD.md`) mirroring `docs/PRODUCTION_DEPLOY_LOG_2026-08-16.md`.

---

## Tests already run (Cursor) — re-run after merge

| Command | Result |
|---|---|
| `npm test` | 192 passed |
| `npm run build` | success |
| `npm run smoke:routes -- http://localhost:3000` | all clear |
| `npm run smoke -- http://localhost:3000` | mock checkout OK; admin login 401 without local admin env (expected) |
| Live `npm run deploy` | **not run** — auth missing |
| Live brand smoke on dewtheoryco.com for this revamp | **not possible until deploy** |

---

## Hosting / CI notes

- Hosting: **Cloudflare Workers** + OpenNext (`@opennextjs/cloudflare`)
- Worker name: `dew-theory`
- Domains: `dewtheoryco.com`, `www.dewtheoryco.com`
- Public URL var: `NEXT_PUBLIC_SITE_URL=https://dewtheoryco.com`
- Secrets stay in Wrangler secret store (never commit)
- CI: check GitHub Actions on the PR / `main` after push; fix failures before deploy if required

---

## Brand / product constraints for Codex

- Do not invent products, prices, inventory, credentials, reviews, medical claims
- PDRN is educational-only unless catalog/services source truth changes
- Service menu in `lib/services.js` remains placeholder — keep disclaimers
- Continuity SoT: `DEW-THEORY-CURRENT-STATUS.md`

---

## Done definition for Codex

Only declare complete when **all** are true:

- [ ] Revamp SHA is on production `main`
- [ ] `npm run deploy` succeeded for that SHA
- [ ] https://dewtheoryco.com serves the new brand (direct verification)
- [ ] www behavior confirmed
- [ ] Post-deploy smoke (routes + storefront/cart/checkout handoff + policies + mobile) passed
- [ ] Status docs updated with final SHA + Worker version
