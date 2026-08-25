# Production deploy log — 2026-08-25

**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)  
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)  
**Repo:** `marinerxcapital/dew-theory-website`

## Deployed artifact

| Item | Value |
|---|---|
| Main deploy SHA | `17d4849a0c3bb502d2341552ee5573a12f46472f` |
| Audited revamp branch HEAD | `e4e036df18fccccbf36157de343419fce07218f1` |
| Cloudflare Worker version / deploy ID | `c76d0236-07e4-47b1-9e49-e413664e80e9` |
| Deploy timestamp (UTC) | `2026-08-25T22:57:41.090Z` |
| Auth | Wrangler OAuth token for `skyler@marinerxcapital.com`; no secret values exposed |

PR #7 (`cursor/brand-revamp-editorial-5502`) was already merged when Codex took over. GitHub reports squash merge `17d4849a0c3bb502d2341552ee5573a12f46472f`; `git diff e4e036df18fccccbf36157de343419fce07218f1..17d4849a0c3bb502d2341552ee5573a12f46472f` was empty, so the deployed merge commit contains the exact audited revamp tree.

## Commands run

```bash
git clone https://github.com/marinerxcapital/dew-theory-website.git C:\Users\Skyler B. Brown\Desktop\dew-theory
git fetch origin --prune
gh pr view 7 --repo marinerxcapital/dew-theory-website --json number,state,isDraft,headRefOid,baseRefOid,mergeCommit
npx wrangler whoami
npm ci
npm test
npm run build
npm run deploy
npm run smoke:routes -- https://dewtheoryco.com
npx wrangler deployments list --name dew-theory
npx playwright test tmp-production-smoke.spec.mjs --reporter=line
```

## Verification results

| Check | Result | Evidence |
|---|---|---|
| PR #7 merged | PASS | GitHub state `MERGED`, merge commit `17d4849a0c3bb502d2341552ee5573a12f46472f` |
| Revamp tree preserved | PASS | Empty diff between branch HEAD `e4e036df18fccccbf36157de343419fce07218f1` and deployed merge commit |
| `npm ci` | PASS | 406 packages installed; 8 existing audit findings reported (1 moderate, 7 high), dependency changes deferred |
| `npm test` | PASS | 192 pass / 0 fail |
| `npm run build` | PASS | Next build succeeded; 67/67 static pages generated |
| `npm run deploy` | PASS | OpenNext bundle deployed to Worker `dew-theory` |
| Worker readback | PASS | Deployment `c76d0236-07e4-47b1-9e49-e413664e80e9` at 100% |
| Apex root | PASS | `https://dewtheoryco.com` returned HTTP 200, Cloudflare, `text/html; charset=utf-8` |
| www root | PASS | `https://www.dewtheoryco.com` returned HTTP 200, Cloudflare, `text/html; charset=utf-8` |
| Public route/PDF smoke | PASS | `npm run smoke:routes -- https://dewtheoryco.com` returned `smoke-routes: all clear` |
| Brand smoke | PASS | Browser saw ivory ground, forest text, Bodoni display font, `this and no stress`, and myth-busting editorial copy |
| Shop reveal | PASS | Product cards revealed after scroll; add-to-cart worked |
| Cart | PASS | Cart persistence, quantity update, remove, and policy links passed in browser |
| Checkout handoff | PASS | Browser checkout flow reached confirmation/checkout handoff without making a paid order |
| Mobile | PASS | Mobile nav opened/closed; no horizontal overflow on `/`, `/shop`, `/cart`, `/privacy`, `/terms` at 390x844 |

## Notes

- OpenNext emitted its known Windows compatibility warning.
- Wrangler/workerd emitted the existing `DOQueueHandler` internal Durable Object warning; deployment completed and production route/browser checks passed.
- `SKIN_SCRIPT_MODE=mock` and `AUTO_FULFILL=false` remained configured in Worker vars.
- No product, service, medical, credential, pricing, or inventory facts were changed.

## Remaining technical debt

- Placeholder service menu prices (`OPEN_ITEMS.md`)
- `/studio` remains omitted from sitemap
- Stripe / Resend / Google Calendar / Skin Script live credentials remain owner-only configuration
- GSAP remains listed in `package.json` but unused by components
- Dependency audit still reports 8 findings (1 moderate, 7 high); not changed during this scoped production deploy
