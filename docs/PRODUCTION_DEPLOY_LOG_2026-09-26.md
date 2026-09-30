# Production deploy log — 2026-09-26

**Workstream:** Dew Theory UI/UX Transformation (spectral editorial system)
**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)
**GitHub:** not used (hard scope boundary for this task)

## Source location

This session worked in the local working copy:

`C:\Users\Skyler B. Brown\Desktop\DewTheory\working\dew-theory-wt-zero-touch`

The checkout has **no working Git linkage**: its `.git` file points at
`C:/Users/Skyler B. Brown/Desktop/dew-theory/.git/worktrees/dew-theory-wt-zero-touch`,
and `Desktop\dew-theory` no longer exists. `git status` / `git rev-parse` fail with
`not a git repository`. All work was therefore done directly in the working copy,
with a filesystem snapshot taken before edits and a Git bundle kept as the
last-known-good reference:

- Snapshot: `Desktop\DewTheory\backups\wt-zero-touch-snapshot-20260926-prehome` (593 files)
- Reference bundle: `Desktop\DewTheory\backups\DewTheory_Final_Production_main.bundle` (HEAD `fc42be84`)

## Deployed artifact

| Item | Value |
|---|---|
| Cloudflare Worker version (final) | `72210705-42d0-4032-a5a2-b7726f942f5b` |
| Deploy timestamp (UTC) | `2026-09-26T~16:55Z` |
| Previous live version (rollback target) | `676ef571-3bf1-4d63-830a-611a12a7f96d` (deployed 2026-09-21T21:39:29Z) |
| Auth | Wrangler OAuth (`skyler@marinerxcapital.com`, MarinerX Capital), workers/write scopes |
| Framework | Next.js `15.5.26` (was `15.5.20`) |

Deploy chain this session (each step rebuilt and re-verified):

1. `75194372-3af4-4411-92f7-230efc2b26ff` — transformation build
2. `ffefc668-85d6-43cd-b1d1-dadcd25197cb` — fix broken hero/featured images
3. `fc291f38-09f4-48fa-b262-50d08ecec568` — Next `^15.5.26` + hero treatment
4. `ea848a0f-ccc4-4729-b212-b8bee9071256` — hero mask refinement
5. `72210705-42d0-4032-a5a2-b7726f942f5b` — restore local runtime data (final)

## Repairs required before the build could run

| Problem | Resolution |
|---|---|
| `node_modules` was a dangling junction to the removed `Desktop\dew-theory\node_modules`; `next` was not recognised | Removed the junction (reparse point only; target already absent), then `npm ci` |
| `app/page.jsx` had been deleted mid-refactor; `/` would not exist | Rebuilt the homepage |
| `app/virtual-consultation/page.jsx` was missing entirely | Restored and upgraded the consultation page |
| `tests/public-removals.test.mjs` asserted `/routine` and `/quiz` are unpublished while the repo publishes both | Test contract corrected (see below) |
| `data/runtime/store.json` + `commerce.json` are bundled into the Worker, and local preview/smoke runs append to them — local telemetry (events 44→88, outbound_emails 36→72, audit_log 6→15) was baked into the first four deploys | Both files restored from the pre-session snapshot and redeployed; product count never changed (36) |

## Commands run

```bash
npm ci                       # 407 packages, tree rebuilt at lockfile
npm test                     # 301 pass / 0 fail (105 suites + new UI suites)
npm run build                # pass (92 static pages, 36 product pages)
npm run preview              # OpenNext build + local workerd preview on :8787
node scripts/smoke-routes.mjs http://127.0.0.1:8787            # all clear
BASE_URL=http://127.0.0.1:8787 node scripts/smoke-checkout.mjs # mock checkout + idempotency pass
npm run deploy               # opennextjs-cloudflare build && deploy → succeeded
node scripts/smoke-routes.mjs https://dewtheoryco.com          # all clear
node scripts/verify-ui.mjs https://dewtheoryco.com             # 48/48 clean
```

## Live verification checklist

| Check | Result | Evidence |
|---|---|---|
| Apex `/` 200 | PASS | `Invoke-WebRequest` 200, 133,698 bytes |
| `www` root 200 | PASS | 200, byte length matches apex |
| 12 public HTML routes + 8 legal PDFs 200 | PASS | `smoke-routes: all clear` |
| 8 legal PDFs serve `application/pdf` | PASS | Content-Type header on each |
| Homepage carries the new spectral system | PASS | HTML contains `Your skin.`, `Less guessing.`, `hero-product__media`, `spectral-field`, `family-chip`, `Shop by skin goal`, `the dew edit` |
| Hero + featured product images render | PASS | `/_next/image?...&q=85` → 200 `image/webp`; 0 broken images across 48 render checks |
| `/shop`, 2 PDPs, `/virtual-consultation`, `/skin-quiz`, `/routine` | PASS | 200 each |
| `/quiz` legacy alias | PASS | 307 → `/skin-quiz` |
| Sitemap | PASS | 49 `<loc>` entries; includes `/skin-quiz`, `/routine`; excludes unpublished `discovery-kit` |
| Responsive 320/375/390/430/768/1024/1280/1440 × 6 pages | PASS | no horizontal overflow, no broken images, no heading-order jumps, no console errors |
| h1 count per page | PASS | exactly 1 on each checked page |
| Reduced motion | PASS | CSS + canvas branches preserved; `.hero-product__media` animation disabled under `prefers-reduced-motion` |

`scripts/verify-ui.mjs` is a repo-local QA tool added this session. It drives real
device emulation through a locally installed Chrome/Edge via `playwright-core`, which is
**not** a declared project dependency (install with
`npm i --no-save --no-package-lock playwright-core` to run it).

## Dependency / security delta

| Item | Before | After |
|---|---|---|
| `next` | `^15.5.20` (lockfile 15.5.20) | `^15.5.26` (lockfile 15.5.26) |
| npm audit (incl. dev) | 11 vulnerabilities, 1 **critical** (`next`) | 11 vulnerabilities, 0 critical |
| npm audit (`--omit=dev`) | 9 vulnerabilities incl. critical `next` | 9 vulnerabilities, no `next` advisory |

All remaining advisories resolve to Node-only libraries reached through build/tooling
and the image pipeline — `sharp` (libvips/libheif), `undici` (Node HTTP client),
`qs`, `nanoid`, `brace-expansion` — none of which are reached by the deployed Worker
runtime. `npm audit fix --force` was deliberately **not** run; it would move outside the
declared ranges without a verification cycle.

## Rollback

```bash
npx wrangler rollback --name dew-theory   # restores the previous deployment
# Explicit target if needed:
npx wrangler versions list --name dew-theory
# Previous live version: 676ef571-3bf1-4d63-830a-611a12a7f96d
```

Local restore point: `Desktop\DewTheory\backups\wt-zero-touch-snapshot-20260926-prehome`.

## Not changed

Commerce, catalog, Skin Script SKU mapping, Stripe wiring, cart, checkout, booking,
intake, photo upload, fulfillment, D1/R2 bindings and Worker vars
(`SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false`) are untouched by this workstream.

---

# Continuation pass — PDP routine timeline + shop filter completion

**Timestamp (UTC):** 2026-09-26T~20:30Z
**Worker version:** `aaa4a6c3-9ed8-4fb7-89c2-c706b3853bcb`
**Previous live version (rollback target):** `b9bda07c-325e-48c1-b575-bd1ee429b531`

Applies the structural items still open from the earlier directives on top of the
CLINICAL NOIR system (owner confirmed noir supersedes the ivory/sage direction).
Full detail: `docs/CONTINUATION_2026-09-26_PDP_TIMELINE_AND_FILTERS.md`.

| File | Change |
|---|---|
| `lib/routine.js` | added `ROUTINE_TIMELINE` + `routinePlacement()` |
| `components/RoutinePlacement.jsx` | new — routine-position timeline |
| `app/shop/[id]/page.jsx` | mounts the timeline; adds above-fold concern chips |
| `lib/shop-filters.js` | routine step / availability / price dimensions, `collectPriceBounds`, chip + range labels |
| `components/ShopGrid.jsx` | three new filter fieldsets and their active-filter chips |
| `tests/pdp-routine-and-filters.test.mjs` | new — 13 tests |

Gates: `npm test` **315 pass / 0 fail**; `npm run build` success (37 PDPs);
`smoke-routes` all clear; `verify-ui` **48/48 clean**.

Runtime data: snapshot at `backups\runtime-pre-continuation-20260926\`; both files
restored before deploy and the **bundled** copies in `.open-next/.../data/runtime/`
hash-matched that snapshot (no local telemetry shipped).

---

# Incident — bad deploy `cd2a7f4c` rolled back

**Timestamp (UTC):** 2026-09-26T21:43-22:00Z

Another session deployed `cd2a7f4c-58a2-4fea-a99d-8752320c505c` at 21:43:53Z. It served a
production outage on the consultation path:

| Request | Result while `cd2a7f4c` was live |
|---|---|
| `GET /virtual-consultation` | **503** `error code: 1102` (Workers CPU limit) — 6/6 and 3/3 consecutive |
| `GET /virtual-consultation/success` | 503 |
| `GET /api/availability` | 503, then 200, then 500 — flapping |
| `GET /shop`, `GET /routine` | 503 on first sweep, 200 on retries |
| static routes (`/`, `/shop/[id]`, `/cart`, `/skin-quiz`, `/privacy`, `/admin/login`) | 200 throughout |

Mitigation: rolled back to the last verified-good version and re-verified.

```bash
npx wrangler rollback --name dew-theory \
  --message "rollback: cd2a7f4c returns Workers error 1102 / 503 on /virtual-consultation"
# -> 41fbbdec-d3cd-4026-a49b-67d6b5192cde
```

Post-rollback: `/virtual-consultation` 200 x10, `/shop` 200, `/routine` 200, `/api/availability`
200, `smoke-routes` all clear, 42 internal links zero broken.

Root cause unproven — the working tree shows no source edit between the rollback copy (14:12:57)
and the 14:43 deploy, and the bundled runtime data is byte-identical to the snapshot. Two live
hypotheses: a partial/corrupt `cd2a7f4c` build (its build likely ran while another process held
`.open-next`), or CPU-limit responses under request load. Do not re-promote `cd2a7f4c` without
re-running `smoke-routes` and `verify-ui` against the candidate.

Also deployed this session: `41fbbdec` carried the PDP routine timeline, above-fold concern chips,
the shop step/availability/price filters, and the label-panel treatment. Full findings:
`docs/AUDIT_2026-09-26_FINDINGS.md`.

**Build caveat:** `opennextjs-cloudflare build` fails with `EPERM` on `.open-next` while another
process holds it (a `wrangler dev`/`next start` from another session). This session deployed from a
clean `robocopy` copy at `working\dew-theory-deploy-20260926` instead.
