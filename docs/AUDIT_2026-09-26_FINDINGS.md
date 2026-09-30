# Dew Theory — comprehensive audit, 2026-09-26

**Auditor:** Codex (continuation session)
**Scope:** `Desktop\DewTheory\working\dew-theory-wt-zero-touch` (CLINICAL NOIR working copy) and
`https://dewtheoryco.com` (production, Cloudflare Worker `dew-theory`).
**Method:** live HTTP probes, browser rendering via Playwright, repo-wide static analysis, and the
project's own suites (`npm test`, `scripts/smoke-routes.mjs`, `scripts/smoke-checkout.mjs`,
`scripts/verify-ui.mjs`). Every finding below is backed by an executed command in this session.

## Status at time of writing

| Item | Value |
|---|---|
| Live Worker version | `41fbbdec-d3cd-4026-a49b-67d6b5192cde` (rollback applied this session) |
| Superseded version | `cd2a7f4c-58a2-4fea-a99d-8752320c505c` (deployed 21:43:53Z; broken) |
| Routes | all clear; `/virtual-consultation` 200 on 10/10 consecutive requests |

---

## F1 — CRITICAL — Production outage on the consultation route (mitigated by rollback)

**What happened.** A deploy from another session, `cd2a7f4c-58a2-4fea-a99d-8752320c505c`
(created 2026-09-26T21:43:53Z), served a production outage.

**Evidence (live probes while `cd2a7f4c` was at 100%):**

| Request | Result |
|---|---|
| `GET /virtual-consultation` | **503**, body `error code: 1102` — 6/6 then 3/3 consecutive failures |
| `GET /virtual-consultation/success` | 503 |
| `GET /api/availability` | 503, then 200 with real slots, then **500** — flapping |
| `GET /shop` | 503 on first sweep, 200 on later retries — flapping |
| `GET /routine` | 503 on first sweep, 200 on later retries — flapping |
| `GET /`, `/shop/[id]`, `/cart`, `/skin-quiz`, `/privacy`, `/admin/login` | 200 throughout |

Workers error **1102 = CPU time limit exceeded**, so the pattern is server-side CPU burn on the
dynamic routes that read runtime data, not a total isolate failure (static routes kept serving).
The same routes on the previous version returned 200 minutes earlier under the project's own
48-page `verify-ui` run.

**Mitigation applied.** Rolled production back to the last verified-good version:

```bash
npx wrangler rollback --name dew-theory \
  --message "rollback: cd2a7f4c returns Workers error 1102 / 503 on /virtual-consultation"
# -> 41fbbdec-d3cd-4026-a49b-67d6b5192cde
```

**Post-rollback verification:** `/virtual-consultation` 200 x10, `/shop` 200, `/routine` 200,
`/api/availability` 200, `/` 200, `/shop/hydrating-skin-serum` 200, `/admin/login` 200,
`smoke-routes` all clear.

**Root cause: not proven.** Honest statement of what is and is not known:

- The working tree shows **no source edits between 14:12:57 (when the rollback copy was taken)
  and the 14:43 deploy**, apart from `components/Hero.jsx` at 14:12:14 — which the rollback copy
  already contained. So `cd2a7f4c` was not built from an obviously different source revision.
- `data/runtime/store.json` and `commerce.json` are byte-identical to the pre-session snapshot
  (144,262 / 556,273 bytes, zero array-count delta), so a bloated bundled store is **not** the cause.
- Two live hypotheses remain: (a) the `cd2a7f4c` build artifact was partial/corrupt — its build may
  have run while another process held `.open-next` (see F2); (b) the failures were CPU-limit
  responses under request load rather than a code defect.

**Required before `cd2a7f4c` (or any successor) is promoted again:** rebuild from a clean output
directory, run `smoke-routes` and `verify-ui` against the candidate, and confirm
`/virtual-consultation` and `/api/availability` return 200 under repeated requests.

## F2 — HIGH — `.open-next` became un-removable, forcing a fresh-copy deploy

While deploying this session's changes, `opennextjs-cloudflare build` failed repeatedly:

```
EPERM: Permission denied: ...\.open-next
    at initOutputDir (@opennextjs/aws/dist/build/helper.js:348)
```

Findings from diagnosis:

- `Rename-Item` on `.open-next` was also denied, so a process held a **directory** handle on it.
- **No individual file inside it was locked** (all 1,531 files opened exclusively without error).
- Leftover `workerd.exe` processes and a `wrangler` `esbuild.exe` service were stopped; `workerd`
  **respawned repeatedly**, which means another live process is supervising `wrangler dev` against
  this project. After that point a `next start -p 3123` server (PID 7652/25044) owned by another
  session was also observed serving this same tree.
- Workaround used: `robocopy` the source to `working\dew-theory-deploy-20260926`, `npm ci`, and
  deploy from there. That deploy is the currently-live `41fbbdec`.

**Impact:** two workstreams building/deploying the same Worker from the same tree with a shared,
locked `.open-next` is the most likely mechanism behind F1. It will recur on the next deploy.

**Recommended fix:** one owner per working copy; delete `.open-next` before building; do not run
`wrangler dev`/`preview` against the same tree that is being deployed; add
`rm -rf .open-next` (or a `predeploy` script) so the failure mode is loud rather than EPERM.

## F3 — MEDIUM — `Strict-Transport-Security` is not set

Live response headers on `/shop/hydrating-skin-serum`:

| Header | Present |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Strict-Transport-Security` | **absent** |
| `Content-Security-Policy` | absent |

The apex serves HTTPS only, so this is a hardening gap rather than an active vulnerability. HSTS
should be added at the Cloudflare zone or via `_headers`/Worker response headers. CSP is harder:
the app ships inline JSON-LD and Next.js inline bootstrap scripts, so it needs nonces or hashes —
recommend a report-only rollout first.

## F4 — MEDIUM — Two design-token systems coexist in `app/globals.css`

- The file is **2,201 lines**; the retired ivory/sage palette sits in `:root` at lines 5-53 and the
  noir layer starts at ~line 1,320.
- **88 `var(--color-*)` references** remain against retired tokens (`--color-ivory: #EDEDE6`,
  `--color-forest: #1E2B22`, `--color-sage-deep: #5B7356`, `--color-specular: #EDEDE6`, …).
- Verified **not** a live visual bug: the noir layer re-declares `:focus-visible` (line 1,760) with
  `var(--accent-pink-bright)`, and the live CSS resolves focus rings to pink, not sage. Precedence,
  not correctness, is what saves it.
- **Risk:** any new rule that uses a `var(--color-*)` token silently inherits the retired palette;
  `tailwind.config.js` meanwhile claims the CSS custom properties are "the authoritative values",
  which is now false.

**Recommended fix:** delete the retired `:root` block and re-point the remaining `var(--color-*)`
usages at the noir custom properties, then re-run `verify-ui`.

## F5 — MEDIUM — 8 MB of unreferenced product imagery is shipped and publicly served

| Measure | Value |
|---|---|
| Images on disk under `public/images/products` | 135 files, 10.8 MB |
| Referenced by the catalog | 115 |
| **Unreferenced** | **20 files, 8.0 MB** |

The 20 are the 16 loose `00-…`–`07-…` master plates (`.png` + `.webp`) and four
`lip-treatment-peppermint-pomegranate/*` files for a product that has since been split into
`lip-treatment-peppermint` and `lip-treatment-pomegranate`.

Because `/images/*` is served `immutable, max-age=31536000`, these are publicly fetchable and are
uploaded on every deploy. They are dead weight, not a security issue.

**Recommended fix:** move them out of `public/` (e.g. to `backups/`) or delete them after
confirming nothing outside the catalog references them; then re-run the imagery test suite.

## F6 — LOW — Seven component files are not imported anywhere

Verified by fixed-string import search (control checks against known-imported components returned
the expected files):

| File | Note |
|---|---|
| `components/Accordion.jsx` | PDP defines its own local `AccordionSection` |
| `components/AidesignerRuntime.jsx` | experimental runtime |
| `components/AmbientField.jsx` | superseded by `AmbientGlow.jsx` |
| `components/BookingFlow.jsx` | `/book` is an unpublished route |
| `components/ContactForm.jsx` | `/contact` is an unpublished route |
| `components/MembershipInterestForm.jsx` | `/membership` is unpublished |
| `components/Stub.jsx` | placeholder |

Note the `app/api/membership/interest` and `app/api/contact` routes may still exist; confirm before
deleting the forms that back them.

## F7 — LOW — `lib/spectral.js` retains the retired palette under live call paths

`spectralStyle()` was correctly narrowed to `NOIR_MATERIAL`, and no component imports it. However
`SPECTRAL_FAMILIES` / `NEUTRAL_FAMILY` still carry retired hexes (`Kit.accent: '#5B7356'`,
`NEUTRAL_FAMILY.accent: '#5A655C'`, sage/champagne washes), and `spectralFamilyForProduct()` returns
them for **20 of 35 visible products**. No current component renders `.accent`, but
`tests/home-structure.test.mjs` asserts on it, so the old palette is still load-bearing in the test
contract.

**Recommended fix:** either reduce the families to keys plus noir material, or add an explicit test
that no rendered surface uses a family hex.

## F8 — LOW — Stale artifacts and docs from the retired design

- `SCREENSHOT-home-hero.png`, `SCREENSHOT-home-products.png`, `SCREENSHOT-home-scrolled.png`
  (2026-09-20) show the ivory/sage build and sit in the project root.
- `POLISH_REPORT.md`, `POLISH_PROGRESS.md`, `SEPHORA_INSPIRED_REDESIGN_2026-08.md`,
  `DEW_THEORY_OVERNIGHT_POLISH_LOOP.md` describe superseded work.
- `reports/ui-verify/` now holds current noir captures (rewritten this session), but earlier
  spectral screenshots in the same folder are gone — confirm nothing else links to them.

## F9 — LOW — `/privacy` duplicates the legal shell instead of using it

`components/LegalPageShell.jsx` exists and is used by the other policy pages, but
`app/privacy/page.jsx` re-implements the eyebrow/heading/PDF-action block inline. Cosmetic
duplication; aligning it removes a second place to update legal page chrome.

## F10 — PROCESS — no Git metadata, therefore no artifact-level diff

The checkout's `.git` file points at `Desktop\dew-theory\.git\worktrees\...`, which no longer
exists, so `git status`/`git rev-parse` fail and no commit, diff, or `git bisect` is possible.
This is why F1's root cause could not be proven by diffing `cd2a7f4c` against `41fbbdec`.

**Recommended fix:** `git init` a local repository (no remote, no GitHub) at the working-copy root
and commit the current tree so future incidents are diffable. Rollback artifact for this session:
`working\dew-theory-deploy-20260926` (full source + the executed `.open-next` build, 113 MB).

---

## Verified clean (no action needed)

| Check | Result |
|---|---|
| `npm test` | **318 pass / 0 fail**, 111 suites |
| `npm run build` | success, 37 PDPs prerendered |
| `smoke-routes` (live) | all clear — 14 HTML routes + 8 legal PDFs |
| `smoke-checkout` (local preview) | storefront ok, mock order created, totals correct, idempotency replay returned the same order id |
| `verify-ui` (live) | **48/48 clean** — 8 viewports x 6 pages, no overflow/broken images/heading jumps/console errors |
| Catalog integrity | 36 products in `data/products.json` and in the runtime store; zero id mismatches; every product has a SKU, positive price, alt text, and gallery images |
| Referenced imagery on disk | zero missing files |
| Product/breadcrumb structured data | present and accurate; **no** `FAQPage`, **no** `AggregateRating` (no fake review markup) |
| `robots.txt` | disallows `/admin` and `/api`; `/admin` returns 307 when unauthenticated |
| Sitemap | includes `/skin-quiz` and `/routine`; excludes `/about` and the unpublished `discovery-kit` |
| Secret scan | no live keys, webhook secrets, or private keys in source; only `sk_test_`/`sk_live_` prefix *comparisons* in Stripe config/health code |
| Untrusted HTML | one `dangerouslySetInnerHTML`, in `components/JsonLd.jsx`, fed by `JSON.stringify` on static objects |
| `eval` | zero occurrences |
| Internal links | 42 checked live; zero broken after the rollback |
| Label panels | three Drug Facts panels now render on a light document surface with accurate alt text (fixed this session); the sage plate inside the artwork itself remains, because background-keying it would blacken regulatory text |

## Applied during this session

| Change | Where |
|---|---|
| Routine-position timeline on the PDP | `components/RoutinePlacement.jsx`, `lib/routine.js` |
| Above-fold concern chips | `app/shop/[id]/page.jsx` |
| Shop filters: routine step, availability, price | `lib/shop-filters.js`, `components/ShopGrid.jsx` |
| Label-panel surface + accurate alt text + caption | `lib/product-image.js`, `components/ProductGallery.jsx`, `app/globals.css` |
| 16 new tests | `tests/pdp-routine-and-filters.test.mjs`, `tests/product-image.test.mjs` |
| Production rollback to `41fbbdec` | `npx wrangler rollback` |
