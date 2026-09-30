# Active Work — Dew Theory

**Signed:** Codex  
**Model:** Codex, DeepSeek V4 Pro  
**Last updated (UTC):** 2026-09-29 (supply-and-deployment response session)  
**Branch:** Git unavailable in current orphaned worktree; deployment was local-only, no GitHub  
**Live Worker version:** `2815c88a-6d37-4ead-b0e6-c6bbde9da72f`

## This session

### 2026-09-29 (eve) — supply and deployment response package

Received and verified the ChatGPT session's supply response
(`DewTheory_SkinScript_DEEPSEEK_SUPPLY_AND_DEPLOYMENT_PARTIAL.zip`). D7 fulfilled (43 approved
finals + updated ledger); D1/D3/D4/D5/D6 remain OPEN with operating rules; D2 prepared as a
staged no-crop CSS patch (not applied). No new approved images for the 209 missing sources.

| Item | Outcome |
|------|---------|
| Outer package check | `VERIFY_PACKAGE.ps1` PASS — 136 files, 43 immutable PNGs |
| Catalog integrity | `verify_handoff.py` PASS (exit 0) |
| Catalog vs prior control | Byte-identical (master/mapping + 43 PNG SHA256 equal) |
| Ledger cross-check | 71–75 prior checkpoint; 76–113 PASS; 114 blocked; 115–252 pending |
| Bindings rebuilt (supply catalog) | 11 VERIFIED product / 4 VERIFIED source (103, 107, 111, 112) |
| Deployment gate | BLOCKED (exit 2) — 209 missing; 72/75 size; 248 unproven bindings; 5 validation gates NOT_RUN |
| Serving tree | Untouched — products.json projection-equal; 115/115 image hashes match baseline |
| D2 patch | Prepared in `work/skinscript-image-deployment-20260929/D2_NO_CROP_STAGED_PATCH.md` |

Blockers unchanged: see `OPEN_ITEMS.md` and `docs/deploy/SKIN_SCRIPT_IMAGE_DEPLOYMENT_LOG_2026-09-29.md`.

### 2026-09-29 — Skin Script image deployment preparation (control package; deployment BLOCKED)

Executed the consolidated partial control package
(`DewTheory_SkinScript_CODEX_ALL_IN_ONE_PARTIAL.zip`) in the canonical checkout. Result:
preparation complete, deployment blocked by the package's own gates.

| Item | Outcome |
|------|---------|
| Package integrity | `verify_handoff.py --root .` PASS — 83 files, 43 PNGs byte-identical |
| Deployment gate | BLOCKED (exit 2): 209 missing/unapproved sources; 72/75 size; no bindings → bindings built → still BLOCKED |
| Approved assets | 43 immutable PNGs (Sources 71–113 only) |
| Deterministic mapping | 11/87 product bindings VERIFIED (8 exact SKU matches + 3 official-SKU family-key translations); 4/252 source bindings VERIFIED (sources 103, 107, 111, 112) |
| Staged release | `work/skinscript-image-deployment-20260929/` — staged-assets (SHA256-verified), SITE_BINDINGS.json, deploy-manifest.json, before-state export, rollback plan, gate report |
| Serving tree | Untouched — no storefront changes, no partial publishing |
| Baseline tests | `npm test` 374 pass / 0 fail (127 suites) |
| Morning 252-catalog | Superseded — NOT approved by the current control; must not be deployed |

Remaining blockers: see `docs/deploy/SKIN_SCRIPT_IMAGE_DEPLOYMENT_LOG_2026-09-29.md` and
`OPEN_ITEMS.md`. Owner-only supply needed: approved PNGs for the 209 missing sources with
provenance.

### 2026-09-29 — Skin Script 252-source asset catalog

Completed the attached autonomous image-production package locally. This was asset production only;
the storefront was not wired or deployed.

| Item | Outcome |
|------|---------|
| Source package | `SkinScript_Product_Image_Pack_2026-09-20_compact(2).zip` |
| Source SHA256 | `b74ae4fd8cd13a82459153465e06f2c2cf8ecb9b0b7c4f942a358911d2e3d5a7` |
| Output directory | `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\final_catalog` |
| Final PNGs | 252 standalone PNGs, one per source assignment |
| Final ZIP | `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\DEW_THEORY_SKINSCRIPT_FINAL_252_CATALOG.zip` |
| ZIP SHA256 | `85c6f3261e79f2ad284fe0335710b60dcb1bac3da2429c063c0b1d7ec61f348e` |
| QA | `FINAL_QA_REPORT.json` PASS: 252 expected / 252 existing / 0 errors |
| Exception | Source 049 and 082 are byte-identical in the source ZIP; source 082 uses approved background `D` to avoid a byte-identical final PNG |
| GitHub/deploy | GitHub not used; no deployment performed |

Professional visual QA regenerated sources 119, 128, 135, and 238 with source-preserving detail-card
treatment for better readability/presentation.

Disk note: generated/rebuildable `.next`, `.open-next`, `.wrangler`, and `node_modules` were removed
to complete the package on a full local disk. Run `npm ci` before Node tests/builds.

### 2026-09-28 — glass logo replacement

Canonical Dew Theory logo replacement and production deploy. The final asset is the newly supplied
true-alpha PNG, installed across customer-facing logo surfaces.

| Item | Outcome |
|------|---------|
| Logo asset | `public/logo-dewtheory-glass-wordmark-transparent.png` plus lossless WebP; legacy logo aliases overwritten for compatibility |
| Customer-facing logo surfaces | `Wordmark`, header/nav, footer, metadata, manifest, cache headers |
| Animation | Restrained alpha-masked champagne/sage glow + shimmer; reduced-motion static fallback |
| Tests/build | `npm test` 374/0; `npm run build` passed |
| Deploy | `npm run deploy` completed through OpenNext + Wrangler 4.141.0; Worker version `2815c88a-6d37-4ead-b0e6-c6bbde9da72f` |
| Live verification | `smoke:routes` all clear on `https://dewtheoryco.com`; apex/www/canonical assets/manifest HEAD 200; live desktop/mobile/reduced-motion browser QA passed with no console errors |
| Live order | Not touched; checkout/Stripe/Skin Script/RPA behavior preserved |

## Remaining owner / infra

1. Turn catalog autonomy on: Fly RPA + Worker `SKIN_SCRIPT_MODE=rpa` + HMAC **or** `SKIN_SCRIPT_FEED_URL` + `csv_feed`. Until then production cron skips (`catalog_source_mock`).
2. `wrangler secret put CRON_SECRET`.
3. Stripe secrets + test-card → webhook → D1 paid (rotate if PR #20 Raw URL was fetched).
4. Emily saved payment method + one controlled live supplier order (fulfillment, not catalog).
5. Emily catalog confirmation: SPF retail, lip SKU structure, mask size, DEW15.

See `docs/SKIN_SCRIPT_SYNC.md`.

## September 2026 — Green system revamp

Authoritative active colors live in app/globals.css (dt-green 50, 100, 200, 300, 400, 700, 900); Tailwind reads their RGB channels. Page 100; raised cards and photos 50; bands 100/200; panels 300; body 900; controls and links 700. Strong decorative borders 400, input boundaries 700 for AA. Hairline uses green 900 at 14%; green shadows 6–12%; frosted surfaces 50 at 68%; radius 10/16/24/pill; 2px green-700 focus with green-50 offset.

Use the single root Nav, announcement and four-column Footer on every route, including shop and admin; admin keeps its authenticated owner navigation inside the shared shell. Tagline Clinical · Precise · Personal. Consultation nav points to /virtual-consultation; /consultation permanently redirects. Shared ProductCard, MeetEmily, button/chip/form roles and loading/error components must remain shared.

Typography: next/font Fraunces variable SOFT 100 for display/product names; Figtree for UI/body/tabular prices; Newsreader for journal prose only. Roman preload; swap. US English. Respect reduced motion; continuous loaded-image animation is avoided, glass hover interaction retained.

Never fabricate reviews, ratings, medical claims, stock people, awards or results. Preserve product names, IDs/slugs, prices, stock, ingredient facts, shipping ($12 below $49 product subtotal), Stripe/checkout/secrets/webhooks. Do not rewrite legal/policy wording or PDFs. Existing missing manufacturer facts remain empty. Sizes normalize oz without trailing period or duplicates; no size is invented. Alt: Skin Script [Name] product photo. Image cache revision green-20260929; original product artwork and logo originals unchanged. Staged catalog artwork is excluded from this release.

Worktree C:\Users\Skyler B. Brown\Desktop\dew-theory-codex; branch revamp/green-system. A DeepSeek V4 Pro session was active in the canonical main source. Never edit/clean/install/kill processes there. Local Git objects live on C using scripts/git-green.ps1 because D is full. Main serving source: Desktop\DewTheory\working\dew-theory-wt-zero-touch, with orphaned Git metadata; old valid Git hub is D:\OffloadedProjects\dew-theory and has dirty work. Preserve both. Hash manifest and concurrency comparisons are in docs/revamp. Route list: docs/revamp/routes.json, including 35 visible products, 7 concern details, 4 journal articles, protected/post-checkout states and intentional 404.

Deployment path: Cloudflare Worker dew-theory via OpenNext/Wrangler. Verified rollback Worker version 2815c88a-6d37-4ead-b0e6-c6bbde9da72f (100%, 2026-09-28T21:03:41Z). Do not deploy a missing-image build or a stale source over concurrent work. Verify 115 catalog references in final .open-next/assets; read back active version after deployment. Roll back to the recorded version if production fails. No environment/secrets changes are part of the revamp. Latest resume authorizes the specifically listed branch/PR/main release actions; do not add unrelated GitHub work.

Open owner items: Shipping operations wording; Returns placeholders; Acai Berry manufacturer description hidden until supplied; consultation price display; hello@dewtheory.studio versus dewtheoryco.com; 27 records lack supplied concern/active content; authentic Stripe test-account handoff is unavailable without test credentials. Authenticated admin production content needs appropriate access. Cart drawer and cookie banner are absent from canonical source; do not invent consent/legal behavior. Consult resume-state.md and executed reports for current gates; unfinished tests are not passing evidence.


## September 30, 2026 continuation
Fraunces is now the local SOFT100 variable-weight WOFF2 loaded through next/font/local, 37,152 bytes, original OFL retained. Figtree stays next/font/google; Newsreader only journal body. Explicit roman font preload hints are mandatory build-validated because emitted Next font manifest is empty. Stable external CSS supersedes the inline-CSS experiment. Preview candidates never imply a public release; provider default remains original Worker 2815c88a-6d37-4ead-b0e6-c6bbde9da72f. Latest draft QA version 59db36af-bf6e-4354-b107-576059447ccd at zero traffic. PR #27 / remote checkpoint b45ff05a preserve exact local tree 4bd78d4. CI is externally blocked by the verified account billing lock. Mobile performance and edge hydration checks remain unresolved; keep release held and preserve all local changes.

September 30 release hold: candidate 54592990 at 0%, original 2815c88a at 100%. Full crawl 294 cases/axe0/overflow0 but four hydration errors; mobile Lighthouse 87/82/86, A100, CLS0, LCP >3.2s. CI account billing lock verified. Source 1dc3424 published exactly as 92c65047 in draft PR #27. Required gates still block main/public release. Continue from docs/revamp/resume-state.md; never infer deployment from preview upload.
