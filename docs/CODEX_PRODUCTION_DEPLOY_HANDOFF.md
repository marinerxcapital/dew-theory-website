# Codex production deploy directive — Dew Theory redesign

You have `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Use them to deploy the already-merged Sephora-inspired Dew Theory storefront redesign to the live public domain.

## Mission

Deploy canonical `main` of `marinerxcapital/dew-theory-website` to production so the public can see the redesign on:

- https://dewtheoryco.com
- https://www.dewtheoryco.com

This is a **deploy + live verification** task. The redesign code is already on `main`. Do not re-implement the redesign unless deploy/build fails and requires a fix.

## Current truth (as of 2026-08-16)

| Item | Value |
|---|---|
| Repo | `https://github.com/marinerxcapital/dew-theory-website` |
| Canonical branch | `main` |
| Latest main SHA | `7a737cdb5fe8524d30763a4545386305475284ba` |
| Redesign merge | PR #1 → `c17ac1bc5ea293b776ce4d225e6beff8278a11dc` |
| Docs / deploy-blocker note | PR #2 → `4ce7ff7` |
| Policy token polish | PR #3 → `7a737cd` |
| Working tree expectation | clean on `main` |
| Hosting | Cloudflare Workers via OpenNext |
| Worker name | `dew-theory` |
| Deploy command | `npm run deploy` (= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`) |
| Deploy docs | `docs/DEPLOY_DEWTHEORYCO.md` |
| Redesign source-of-truth doc | `docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md` |

A prior Cursor Cloud agent completed implementation, tests, and merge to main, but could not deploy because Wrangler was unauthenticated in that environment. Live domain still appears to serve older homepage copy in places (e.g. “Clinical formulations…”), so production must be redeployed from current `main`.

## What was shipped in this redesign (already on main)

- Black/white retail shell + restrained promo red + Dew green guidance accent
- Sticky header, announcement bar, global search, black category nav, richer footer
- Homepage merchandising rebuild
- Shop PLP filters/sort/URL state + Quick Add cards
- Richer PDPs, bag/free-shipping UX
- Premium Skin Quiz + AM/PM Routine Builder visuals
- Services / Virtual Consultation / About / Membership interest / Contact / FAQ upgrades
- Customer-facing prototype language scrubbed where feasible
- Membership remains **interest-list only** (no fake billing)
- Security/payment/admin/consultation privacy boundaries preserved

Validation already done before merge:

- `npm test` → **182 pass / 0 fail**
- `npm run build` → pass

## Exact steps to execute

1. **Authenticate to the repo and sync**

```bash
git fetch origin main
git checkout main
git reset --hard origin/main
git rev-parse HEAD   # confirm starts with 7a737cd...
git status           # must be clean
```

2. **Confirm Cloudflare auth using existing secrets**

- Export / use `CLOUDFLARE_API_TOKEN`
- Export / use `CLOUDFLARE_ACCOUNT_ID` if required by Wrangler
- Run:

```bash
npx wrangler whoami
```

- Must succeed. If it fails, stop and report the exact auth error.

3. **Install dependencies from lockfile**

```bash
npm ci
```

4. **Re-validate before deploy**

```bash
npm test
npm run build
```

Fix only genuine deploy/build blockers. Do not invent business facts.

5. **Deploy to production**

```bash
npm run deploy
```

Monitor OpenNext + Wrangler output to completion. Capture Worker version / deploy ID if printed.

6. **If deploy fails**

- Diagnose from logs
- Fix only what is required
- Re-run tests/build
- Commit/push through normal PR→main workflow if code changes are needed
- Redeploy
- Do **not** disable security, commit secrets, or weaken Stripe/admin/consultation privacy

7. **Live verification (required)**

After deploy succeeds, verify on the **real** domain (not preview-only):

Smoke:

- https://dewtheoryco.com/
- https://www.dewtheoryco.com/ (canonical/www behavior)
- `/shop`
- at least 3 PDPs (e.g. green-tea-citrus-cleanser, hydrating-skin-serum, ageless-moisturizer)
- `/cart`
- `/quiz`
- `/routine`
- `/services`
- `/virtual-consultation`
- `/about`
- `/membership`
- `/contact`
- `/faq`
- `/shipping` `/returns` `/privacy`

Confirm redesign markers are live, especially homepage:

- “Clinical skincare, selected by the aesthetician who uses it.”
- announcement bar free-shipping messaging
- black category nav / search present
- Dew green guidance accents on quiz/routine/services CTAs

Journey checks (no real paid charge):

- Home → Search/Shop → PDP → Add to Bag → Cart
- Home → Skin Quiz → results
- Home → Routine Builder → add routine
- Home → Services / Virtual Consultation

8. **Update memory after live verification**

Update:

- `docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md`
- `OPEN_ITEMS.md` deploy-blocker section (mark deploy complete or record remaining issue)

Record:

- deployed main SHA
- Cloudflare deploy/version ID
- verification timestamp
- pass/fail per critical route
- any remaining blockers

9. **Commit docs only if needed**

- Push via a short PR into `main`, or direct main only if that is the established safe path
- Keep working tree clean afterward

## Non-negotiables

- Do not invent studio address, license number, membership prices, deposits, fake reviews, scarcity, or sale claims
- Do not enable paid membership unless canonical config already proves it
- Do not commit `.env` secrets, tokens, or private intake data
- Do not weaken Stripe/webhook/admin/consultation photo security
- Do not stop after a successful local build — completion requires **live domain verification**

## Definition of done for Codex

- [ ] `main` at expected SHA deployed
- [ ] `npm run deploy` succeeded
- [ ] https://dewtheoryco.com serves the redesign
- [ ] www behavior verified
- [ ] critical routes smoke-tested
- [ ] memory/docs updated with deploy evidence
- [ ] working tree clean
- [ ] final report returned with deploy ID + live verification results

## Final report format for Codex

Return:

1. Deployed main SHA
2. Cloudflare Worker / version / deploy ID
3. Live verification results by route
4. Whether the redesign is publicly visible
5. Any remaining blockers

**Begin now. Deploy current `main` to dewtheoryco.com and verify it live.**
