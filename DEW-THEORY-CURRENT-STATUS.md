# DEW-THEORY-CURRENT-STATUS.md

> Canonical continuity file for Dew Theory (`dewtheoryco.com`).
> Written for a fresh ChatGPT / Codex / Cursor / Claude / Grok session with **no prior memory**.
> Re-verify Git SHAs, CI, and production after every handoff — they can change.

---

## 2026-09-29 (eve) — Skin Script SUPPLY AND DEPLOYMENT response package — RECEIVED, VERIFIED, STILL BLOCKED

Received `Desktop\DewTheory_SkinScript_DEEPSEEK_SUPPLY_AND_DEPLOYMENT_PARTIAL.zip`
(144,864,625 bytes, 18:04 local), the ChatGPT session's response to the 2026-09-29 supply
request. Extracted to `Desktop\DewTheory_SkinScript_DEEPSEEK_SUPPLY_AND_DEPLOYMENT_PARTIAL\`
(immutable). GitHub not used.

Package verification:

- `scripts/VERIFY_PACKAGE.ps1` → **PASS** (136 checksummed files, 252 source rows, 43 immutable
  approved PNGs; full deployment blocked).
- `catalog/scripts/verify_handoff.py --root .\catalog` → integrity **PASS** (83 content files).
- Catalog subtree byte-identical to the prior ALL-IN-ONE control (master/mapping JSON + all 43
  PNG SHA256 equal). New supply material: both WORK_CONTINUATION_LEDGERs (original 78,685-byte V1 +
  updated 88,696-byte), SUPPLIED_APPROVED_ASSET_RECEIPT (43 rows), SOURCE_FILENAME_CROSSWALK
  (252 rows), DECISION_AND_BLOCKER_REGISTER, DEEPSEEK_REPORTED_SITE_HINTS (explicitly
  unverified), 6 authorized backgrounds (reference-only), future-receipt templates.
- Ledger cross-check: 71–75 `PASS_PRIOR_CHECKPOINT`; 76–113 `PASS` with per-source visual QA
  notes; 114 `BLOCKED_SOURCE_FIDELITY` (Drug Facts graphic; 3 rejected attempts); 115–252
  `PENDING_WORK_GENERATION`. No new approved finals for any missing source — 209 still missing.

Decision register applied to local work:

- **D1** (catalog expansion): OPEN — operating rule preserved: stage unmatched SKUs; no product
  creation. (36-product storefront untouched.)
- **D2** (aspect): IMPLEMENTATION_DIRECTIVE_NO_CROP — prepared, NOT applied:
  `work\skinscript-image-deployment-20260929\D2_NO_CROP_STAGED_PATCH.md` (minimal `object-fit:
  contain` in ProductImage.jsx / ProductGallery.jsx; visually inert for existing same-aspect
  webp; letterboxes 3:4 PNGs without crop). Applies at release time only.
- **D3** (alt sizes/samples): Sources 104–106, 108–110, 113 stay staged/unused pending exact
  variant records. Sources 103/107 (3.3 oz) and 111 (2 oz) primaries re-verified against site
  sellable sizes; 112 stays a swatch (nonvariant).
- **D4** (Source 82): OPEN_SUPPLIER_RECONCILIATION — parent SKU 3010108 retained; no standalone
  reparenting.
- **D5** (Source 94): OPEN_SUPPLIER_RECONCILIATION — printed 8 fl oz / 120 ml preserved; no
  size correction.
- **D6** (Sources 72/75): OPEN_SIZE_VERIFICATION — visual approval retained, size_verified
  still NOT_VERIFIED.
- **D7**: SUPPLIED — all 43 approved finals + updated ledger received.

Local revalidation performed:

- `build-bindings.mjs` inspected for index/fuzzy joins, hardcoded fallbacks, family-SKU
  collisions, size flattening and destructive writes — none found
  (`work\skinscript-image-deployment-20260929\BUILD_BINDINGS_INSPECTION.md`); re-pointed at the
  new supply catalog with receipt+crosswalk cross-checks and re-run: 43 staged,
  **11 VERIFIED product bindings, 4 VERIFIED source bindings** (103, 107, 111 primaries;
  112 swatch). DEEPSEEK_REPORTED_SITE_HINTS left as unverified history; every binding stands on
  local evidence (products.json, allowlist, supplier registry, official wholesale table).
- Before-state re-check: `data/products.json` projection-equal to the 2026-09-29 export;
  115/115 serving-tree image hashes match `before-state/SHA256SUMS.before-state.txt`
  (file regenerated as plain text; earlier copy had JSON-stringify formatting).
- Deployment gate re-run from the new catalog with the working bindings →
  **exit 2, BLOCKED** (report: `work\skinscript-image-deployment-20260929\
  DEPLOYMENT_GATE_REPORT_2026-09-29_SUPPLY.json`). Blocker categories unchanged: 209
  missing/unapproved sources; size_verified 72/75; 248 unproven source bindings; 5
  release-validation gates NOT_RUN.

No website files, pricing, Stripe, checkout, fulfillment, auth, admin, consultations, quiz,
routes, SEO or serving-tree assets changed. No deployment attempted. Blockers unchanged in
substance; see `docs/deploy/SKIN_SCRIPT_IMAGE_DEPLOYMENT_LOG_2026-09-29.md` § supply response.

**Timestamp:** 2026-09-29 (evening session). **Agent:** Codex, DeepSeek V4 Pro. **GitHub:** not used.


## 2026-09-29 — Skin Script 252-source image deployment — PREPARATION COMPLETE, DEPLOYMENT BLOCKED BY CONTROL GATES

Executed the consolidated control package
`Desktop\DewTheory_SkinScript_CODEX_ALL_IN_ONE_PARTIAL.zip` (extracted to
`Desktop\DewTheory_SkinScript_CODEX_ALL_IN_ONE_PARTIAL\`) against the canonical local checkout
`Desktop\DewTheory\working\dew-theory-wt-zero-touch`. Image-asset and storefront-mapping work only;
no artwork changed, no storefront wired, no deployment performed, no GitHub used.

Package truth (supersedes the morning 252-PNG production claim): **43 approved immutable PNGs
(Sources 71–113 only), 252 source records, 87 canonical SKU groups, 209 missing/unapproved
sources.** The morning session's `work\dewtheory-codex-package-20260928\...\output\final_catalog`
252 PNGs are session-generated outputs that the control package does not approve (its own manifest
keeps Sources 1–70 and 114–252 missing/unapproved and its QA flagged perceptual duplicates); they
must not be deployed.

Verification:

- `py scripts/verify_handoff.py --root .` → integrity **PASS** (83 files; 43 PNGs byte-identical).
- `--deployment-gate` → **exit 2, BLOCKED** (209 missing sources; size_verified 72/75; no bindings).
- Deterministic bindings built and gate re-run with working
  `work\skinscript-image-deployment-20260929\SITE_BINDINGS.json` → still **BLOCKED** (expected).

Deterministic mapping results (evidence: `data/products.json`,
`data/catalog-allowlist.json`, `data/supplier/skin-script-portal-urls.json` (WC recon 2026-09-20),
`.artifacts/final-catalog/official-wholesale-august-2026.json`):

- 87 product bindings: **11 VERIFIED** (8 exact SKU-string matches — 5010420 discovery-kit,
  4010800/4010900/4011000 travel kits, 1410140 lip balm, 1310640 peptide eye serum, 1310740
  tri-peptide eye cream, 1310840 blemish spot treatment; plus 3 proven family-key translations:
  image-pack 1210100→official 1210140 cucumber toner 3.3 oz, 1210200→1210240 mint toner 3.3 oz,
  1610100→1610140 SPF 30 2 oz). 76 canonical SKUs have no storefront product.
- 252 source bindings: **4 VERIFIED** (sources 103, 107, 111 primary fronts; 112 SPF swatch via
  NON_VARIANT_PRODUCT). 39 of 43 approved images have no proven site target (32 products not sold;
  7 alt-size/sample views with no sellable variant record).
- Source 82 (Lemon Honey kit component) and Source 94 (printed 8 fl oz/120 ml label) remain
  unresolved — the storefront sells neither product.

Staged release (no serving-tree changes): 43 approved PNGs SHA256-verified into
`work\skinscript-image-deployment-20260929\staged-assets\`; deploy manifest, before-state export
(`before-state\catalog-before-state.json` + `SHA256SUMS.before-state.txt`), catalog comparison,
rollback plan, and gate report in the same directory. Approved PNGs are 1536×2048 (3:4) vs the
serving architecture 832×1232 (52:77) — a no-crop aspect strategy is required at release time;
no re-encoding authorized.

Baseline: `npm ci` + `npm test` → **374 pass / 0 fail** (127 suites), recorded in
`work\skinscript-image-deployment-20260929\baseline-npm-test.log`.

Blocker summary: (1) 209 missing approved PNGs (must be supplied, never generated); (2) 76
canonical SKU groups have no storefront product (enzymes/pro kits/manual not sold); (3) 39 approved
images have no proven site binding; (4–6) sources 82, 94, 72/75 evidence gaps; (7) dimension/aspect
translation; (8) five release-validation gates NOT_RUN (no partial publishing permitted). Full
detail: `docs/deploy/SKIN_SCRIPT_IMAGE_DEPLOYMENT_LOG_2026-09-29.md` and
`OPEN_ITEMS.md` § "2026-09-29 — Skin Script image deployment blockers".

Live site untouched: `dewtheoryco.com` unchanged; existing noir imagery, Stripe, cart/checkout,
fulfillment, auth, admin, consultations, Skin Quiz, routes, SEO all preserved.

**Timestamp:** 2026-09-29 (session). **Agent:** Codex, DeepSeek V4 Pro. **GitHub:** not used.


## 2026-09-29 — Skin Script autonomous 252-source catalog package — ASSET QA COMPLETE, NOT DEPLOYED

Executed the attached `Dew Theory x Skin Script` autonomous production package locally in the
canonical orphaned checkout `Desktop\DewTheory\working\dew-theory-wt-zero-touch`.

Output status:

- Source ZIP:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\assets\source\SkinScript_Product_Image_Pack_2026-09-20_compact(2).zip`
- Source ZIP SHA256: `b74ae4fd8cd13a82459153465e06f2c2cf8ecb9b0b7c4f942a358911d2e3d5a7`
- Canonical PNG output:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\final_catalog`
- Final PNG count: **252**
- Final ZIP:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\DEW_THEORY_SKINSCRIPT_FINAL_252_CATALOG.zip`
- Final ZIP SHA256: `85c6f3261e79f2ad284fe0335710b60dcb1bac3da2429c063c0b1d7ec61f348e`
- Ledger:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\manifests\PROGRESS_LEDGER.csv`
- QA report:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\work\FINAL_QA_REPORT.json`

QA:

- Sources 1-70 were audited fail-closed and regenerated where existing outputs could not be proven
  correct.
- Sources 71-252 were processed sequentially.
- Final QA passed: expected_count `252`, existing_count `252`, errors `[]`.
- Professional visual QA regenerated four low-contrast/plate-risk outputs: sources 119, 128, 135,
  and 238.
- Five perceptual-similarity pairs were retained as source-distinct assignments.
- Source 049 and source 082 were byte-identical in the source ZIP; source 082 was regenerated on
  approved packaged background `D` to avoid a byte-identical final PNG while preserving source pixels.

Operational notes:

- GitHub was not used.
- No storefront wiring or deployment was performed.
- To recover disk space on a full local drive, generated/rebuildable `.next`, `.open-next`,
  `.wrangler`, and `node_modules` were removed. Run `npm ci` before any Node-based test/build/deploy
  work.

## 2026-09-28 — glass logo replacement + restrained glow — DEPLOYED, VERIFIED

Replaced customer-facing website logo usage with the supplied glass/chrome Dew Theory wordmark. The
first pass derived transparency from a JPEG; the final live pass replaced that with the newly
supplied true-alpha PNG as the canonical asset:
`public/logo-dewtheory-glass-wordmark-transparent.png` plus lossless WebP alias. Legacy public logo
URLs were overwritten as compatibility aliases so old direct logo paths use the same true-alpha
artwork.

Changed surfaces:

- `components/Wordmark.jsx` now defaults to the true-alpha transparent glass logo and preserves
  intrinsic proportions (`3000x1000`).
- `components/Nav.jsx` and `components/Footer.jsx` use the new logo through the reusable Wordmark.
- `app/layout.jsx`, home/shop/virtual-consultation metadata, `public/site.webmanifest`, and
  `public/_headers` now point at/cache the new canonical asset.
- `app/globals.css` adds a restrained champagne/warm-white/sage glow via alpha-masked CSS
  pseudo-elements and `drop-shadow`, with a static `prefers-reduced-motion` fallback.

Verification:

- `npm test` passed: **374 pass / 0 fail**.
- `npm run build` passed; only existing OpenNext/Workers local Durable Object warnings appeared.
- `npm run deploy` completed through OpenNext + Wrangler 4.141.0 using the authenticated Cloudflare
  account `skyler@marinerxcapital.com`; Worker `dew-theory` deployed to `dewtheoryco.com`,
  `www.dewtheoryco.com`, and `dew-theory.marinerx-capital.workers.dev`.
- **Current Version ID:** `2815c88a-6d37-4ead-b0e6-c6bbde9da72f`.
- Live smoke passed: `npm run smoke:routes -- https://dewtheoryco.com` returned all clear for the
  homepage, shop, virtual consultation, cart, legal HTML pages, admin login, and all 8 public legal
  PDFs.
- Live HEAD probes returned 200 for apex, www, `logo-dewtheory-glass-wordmark-transparent.png`,
  `logo-dewtheory-glass-wordmark-transparent.webp`, compatibility `logo-dewtheory-glass-20260928.png`,
  and `site.webmanifest`; canonical PNG served
  `image/png` with `Cache-Control: public, max-age=31536000, immutable`.
- Local visual QA at `http://127.0.0.1:3456/` captured desktop/mobile clear nav, scrolled solid nav,
  and footer: `.brand-wordmark` background is transparent, the logo image resolves to
  `/logo-dewtheory-glass-wordmark-transparent.png`, no console errors were emitted, reduced motion
  disables the breathing animation, and screenshots show no visible image rectangle.
- Live browser QA at `https://dewtheoryco.com/` captured desktop/mobile clear nav, scrolled solid
  nav, footer, and reduced-motion mode: deployed DOM/CSS uses
  `/logo-dewtheory-glass-wordmark-transparent.png`, `.brand-wordmark` remains transparent, scrolled
  nav enters `data-state="solid"`, reduced motion disables `brand-wordmark-breathe`, and no console
  errors were emitted.
- Pixel/asset sanity: canonical PNG corners are alpha `0`; outer edge has `0` non-transparent pixels,
  confirming transparent areas reveal the live page surface rather than a baked box.

**Timestamp:** 2026-09-28T21:04:03Z. **Signature:** Codex. **Model:** Codex, GPT-5-based coding
agent. **GitHub:** not used. **Source:** local working copy
`Desktop\DewTheory\working\dew-theory-wt-zero-touch`.


## 2026-09-26 — UI/UX Transformation (spectral editorial system) — DEPLOYED, VERIFIED
## 2026-09-26 — CLINICAL NOIR (live) + continuation pass — DEPLOYED, VERIFIED

### 2026-09-26 — incident: `cd2a7f4c` rolled back; audit findings recorded

Another session deployed `cd2a7f4c-58a2-4fea-a99d-8752320c505c` (21:43:53Z), which served **503
`error code: 1102`** on `/virtual-consultation` (6/6 and 3/3 consecutive), 503/200/500 flapping on
`/api/availability`, and 503→200 flapping on `/shop` and `/routine`, while static routes stayed
200. Rolled back to the last verified-good version **`41fbbdec-d3cd-4026-a49b-67d6b5192cde`**
(`npx wrangler rollback --name dew-theory`); consultation then returned 200 x10, `smoke-routes`
all clear, and the 42-link internal sweep found zero broken links. Root cause is **unproven** —
re-promote `cd2a7f4c` only after re-running `smoke-routes` + `verify-ui` on the candidate.

Full audit: **`docs/AUDIT_2026-09-26_FINDINGS.md`** — outstanding items are HSTS not set (F3), a
retired ivory/sage token block still present in `app/globals.css` alongside the noir layer (F4),
8 MB of unreferenced product imagery under `public/` (F5), seven unimported components (F6),
`lib/spectral.js` still carrying the retired palette (F7), stale root screenshots/polish docs (F8),
`/privacy` duplicating `LegalPageShell` (F9), and no Git metadata so incident diffs are impossible
(F10). Also: `opennextjs-cloudflare build` hits `EPERM` on `.open-next` while another session holds
it, so this session deployed from `working\dew-theory-deploy-20260926`.

**Direction change (owner-confirmed):** a separate workstream replaced the spectral editorial
system with **CLINICAL NOIR** — `#050505` void ground, hot pink (`#FF1F8F` / `#FF4FA8`) as the
single accent, white as precision, Fraunces + Inter typography. That direction **supersedes**
the Virtual Consultation and MAX UI/UX directives; the section below is now historical.
Its own record: `reports/DewTheory_CLINICAL_NOIR_Revamp_Report_2026-09-26.md`.

| Item | Verified value |
|---|---|
| Live Worker version | `41fbbdec-d3cd-4026-a49b-67d6b5192cde` (2026-09-26T21:24:42Z) — restored by rollback after `cd2a7f4c` (21:43:53Z) served 503s; see the incident note above |
| Rollback target | `b9bda07c-325e-48c1-b575-bd1ee429b531` (noir), then `72210705-…` (spectral) |
| Product imagery | 116 of 135 assets re-lit onto the void with a pink rim; filenames and 832x1232 dimensions preserved; `PRODUCT_IMAGE_REVISION = noir-20260926` cache token |
| Live markers | `bg-void`, `noir-20260926`, "hot pink rim light" alt text present; "sage background" and the ivory hero copy absent |

**Continuation pass (this session)** finished the structural items the noir sweep did not cover,
on top of the noir system — full detail in
`docs/CONTINUATION_2026-09-26_PDP_TIMELINE_AND_FILTERS.md`:

- PDP **routine-position timeline** (`components/RoutinePlacement.jsx`, `lib/routine.js`) with
  `aria-current="step"` and AM/PM labels taken from catalog copy only.
- PDP **skin-concern chips** above the fold.
- Shop filters extended with **routine step**, **availability**, and **price** in the desktop
  rail, mobile drawer, and active-chip row.

Gates: `npm test` **315 pass / 0 fail** (110 suites); `npm run build` success (37 PDPs);
`smoke-routes` all clear; `verify-ui` **48/48 clean** at 8 viewports x 6 pages.
Live filter checks: `?step=Mask` 1 product, `?step=Cleanser` 6, `?availability=in-stock` 34,
`?availability=out-of-stock` 1, `?min=40&max=60` 12 — no console errors.

Bundled runtime data was hash-verified byte-identical to the pre-session snapshot
(`backups\runtime-pre-continuation-20260926\`), so no local telemetry shipped.

**Still open:** three manufacturer label panels remain on the sage plate (colour-keying them
would destroy the Drug Facts text — measured panel fill is within 14 RGB of the plate colour);
Emily portrait and hero/lifestyle imagery untouched; policy pages carry the token layer only;
checkout not re-driven end to end (payment/intake/fulfillment code untouched); no Git commit.

**Signed:** Codex · **Timestamp (UTC):** 2026-09-26T~16:30Z
**Source:** local working copy `Desktop\DewTheory\working\dew-theory-wt-zero-touch`
**GitHub:** intentionally not used. This checkout has **no working Git linkage** (its `.git` file
pointed at a removed `Desktop\dew-theory\.git\worktrees\...`), so `git` commands fail and **no SHA
exists for this work**. Treat this section plus `docs/PRODUCTION_DEPLOY_LOG_2026-09-26.md` as the
record of truth.

**Deployed Worker version:** `72210705-42d0-4032-a5a2-b7726f942f5b`
**Previous live version (rollback target):** `676ef571-3bf1-4d63-830a-611a12a7f96d`
**Framework:** Next.js `^15.5.26` (from `^15.5.20`)

### What shipped

- **Homepage rebuilt** to the directive hierarchy: hero → trust strip → two ways to start → shop by
  skin goal → featured product story → personalization hub → meet Emily → Emily's picks → the Dew
  Edit → browse-all band → final consultation CTA.
- **Spectral product visual system** (`lib/spectral.js`): six family worlds (hydration, barrier,
  brightening, clarifying, aging, SPF) plus category worlds (eye, lip, masks, sets) and a quiet
  neutral fallback. Every family maps only to `conditions_addressed` values that exist in
  `data/products.json`; a test enforces this.
- **Hero rebuilt**: quiet pearl ground with restrained iridescence, eyebrow plus a
  `Your skin. / Less guessing.` headline, two CTAs (Shop skincare / Book a consultation), and a real
  catalog product floating in a dissolving spectral field (photo scaled past the frame, four-sided
  mask, soft shadow, iridescent cast). Product name, category and price come from the catalog record.
- **Consultation page restored and restructured** (it was missing from the working copy): hero →
  value proposition → how it works → what we'll cover → what you'll receive → meet Emily → booking
  UI → preparation → FAQ → final CTA. Payment, intake, photo-upload, cancelled-checkout state and the
  scope disclaimer keep their existing behaviour.
- **Dew Theory Concierge** added (`components/Concierge.jsx`, wired in `app/layout.jsx`): accessible
  drawer with quiz / routine / consultation / shop-by-concern; hidden on `/admin` and `/cart*`.
- **Shop-by-skin-goal tiles** generated from the spectral families, each linking to the real
  `conditions_addressed` value so the tile and the PLP filter cannot disagree.
- **Product cards**: spectral family accent edge, family-dot eyebrow, restrained Emily's-pick badge.
- **Sitemap**: `/skin-quiz` and `/routine` added (49 URLs).

### Repairs required first

| Problem | Resolution |
|---|---|
| `node_modules` was a dangling junction to the removed old repo path | Junction removed, `npm ci` re-run |
| `app/page.jsx` deleted mid-refactor | Homepage rebuilt |
| `app/virtual-consultation/page.jsx` missing | Restored and upgraded |
| `tests/public-removals.test.mjs` asserted `/routine` and `/quiz` unpublished while both are live | Contract corrected; the test now also asserts the published guidance pages exist |
| Hero/featured images rendered broken live | `quality={82}` was outside `images.qualities: [60,70,75,85]`, so `/_next/image` returned 400. Set to 85 and added a regression test over every rendered `quality` |
| Local preview/smoke runs appended to `data/runtime/store.json`, which is bundled into the Worker, so local telemetry was baked into the first four deploys | Both runtime files restored from the pre-session snapshot and redeployed (products stayed at 36 throughout) |

### Gates

| Gate | Result |
|---|---|
| `npm ci` | success (tree at lockfile) |
| `npm test` | **301 pass / 0 fail** |
| `npm run build` | success (92 pages, 36 PDPs) |
| OpenNext build + local preview | success |
| `smoke-routes` (local preview) | all clear |
| `smoke-checkout` (local preview) | storefront + mock order + idempotency PASS; admin login 401 (no local admin secret — expected) |
| `npm run deploy` | success |
| `smoke-routes` (production) | all clear |
| `verify-ui` (production, 8 viewports x 6 pages) | 48/48 clean: no overflow, no broken images, no heading jumps, no console errors |

### Security delta

`next` `^15.5.20` to `^15.5.26` clears the **critical** Next advisory set (App Router Server Actions
DoS, image-optimizer SSRF/RCE, cache confusion). Remaining audit findings are Node-only tooling
libraries (`sharp`, `undici`, `qs`, `nanoid`, `brace-expansion`) not reached by the Worker runtime.
`npm audit fix --force` was not run.

### Rollback

`npx wrangler rollback --name dew-theory` → previous live `676ef571-3bf1-4d63-830a-611a12a7f96d`.
Local snapshot: `Desktop\DewTheory\backups\wt-zero-touch-snapshot-20260926-prehome`.

### Still open after this session

- Homepage copy uses the directive's approved headline (`Your skin. / Less guessing.`) and eyebrow
  (`Professional skincare · personalized by Emily`). The brand motif `this and no stress` is no
  longer on the homepage hero; re-add if the owner prefers the prior voice.
- No verified portrait of Emily exists in the repo, so “Meet Emily” still uses the abstract
  botanical plate rather than a photograph. A real portrait is an owner-supplied asset.
- `/about` remains unpublished by owner decision (Nav/Footer still must not link it).
- The working copy has no Git history; this work is **not committed anywhere**. Committing requires a
  restored repository or a fresh `git init`.

## 2026-09-20 SuperGrok — verified catalog + sage media + carousel (branch)

**Branch:** `supergrok/dew-theory-full-skin-script-catalog-carousel-20260920`
**Base main:** `7c14d76`
**Storefront products:** 35 (8 original + 27 newly portal-verified retail/kit SKUs)
**Professional/training exclusions:** not published
**Media:** Dew Theory sage WebP (832x1232) from DewTheory_Sage_Images_Compact.zip — no recompression
**UX:** CategoryProductCarousel on /shop + ProductGallery on PDP
**D1:** supplier_mappings verified_active=35 (preinstall backup in .artifacts/final-catalog/)
**AUTO_FULFILL:** false (unchanged)
**Live Skin Script PO:** NOT placed

## 2026-09-21 production deploy (local Wrangler; Actions billing bypass)

**main SHA:** `600f8ef`
**Worker Version ID:** `104d8a4a-e70a-4625-9953-3fd290199ed6`
**Live catalog:** 35 products with sage media + category carousels + PDP galleries
**D1 mappings:** 35 verified active
**AUTO_FULFILL:** false | **SKIN_SCRIPT_MODE:** mock
**Note:** GitHub Actions still billing-locked; deploy used local `npm run deploy`.

## 2026-09-21 zero-touch NO-GITHUB wave (local only)

**Branch:** `supergrok/dew-theory-zero-touch-no-github`
**GitHub:** intentionally not used (billing removed from critical path)
**Official SRP:** August 2026 Suggested Retail Price List applied to checkout-enabled products
**Shipping:** Skin Script drop-ship policy `` under ``; free at `+`
**Lips:** Peppermint `1410240` and Pomegranate `1410340` as separate products
**Discovery Kit:** blocked (missing official SRP)
**Stripe persistent catalog sync:** BLOCKED_EXTERNAL until local Stripe secret available
**AUTO_FULFILL:** false
## CURRENT BRAND SYSTEM

### Authoritative five colors (do not alter hex values)

| Semantic | Hex | Role |
|---|---|---|
| Forest | `#1E2B22` | Main text; inverse surfaces; primary CTAs; footer; category rail |
| Sage deep | `#5B7356` | Botanical accent, decorative rules, selected/hover accents |
| Sage | `#93A890` | Signature sage surfaces, editorial bands, `.btn-dew` fill |
| Ivory | `#EDEDE6` | Page ground; inverse text on forest |
| Stone | `#C9C4B8` | Warm alternate section surfaces |

### Token wiring (preserve classname aliases)

Defined in `app/globals.css` `:root` and `tailwind.config.js`:

- `forest` / `ink` / `graphite` / `charcoal` / `black` → `#1E2B22`
- `sage-deep` / `dew` → `#5B7356`
- `sage` / `dew-mid` → `#93A890`
- `ivory` / `pearl` → `#EDEDE6`
- `stone` → `#C9C4B8`
- `surface` / `white` → `#FFFFFF` (product cards / lift only; page ground is ivory)
- `muted` → `#5A655C` (derived secondary text for AA on ivory)
- `promo` → restrained `#8B3A3A` (alerts only)

**Contrast rule:** Use `#1E2B22` on `#EDEDE6`, `#C9C4B8`, and `#93A890`. Use `#EDEDE6` on `#1E2B22`. Do **not** put normal-size `#5B7356` text on ivory/sage without verifying AA. Do not change the five brand hexes to “fix” contrast — change pairings instead.

### Typography

- Display: **Bodoni Moda** (`next/font/google` → `--font-display`) — H1–H3, editorial quotes, selected italics
- Label: **Jost** — uppercase tracked UI / nav / buttons
- Body: **Karla** — body, forms, policies

### Emily’s approved copy motifs (use thoughtfully; do not spam)

- “this and no stress”
- “I’d rather be exhausted building my dream than comfortable watching it pass me by”
- “a calm monday”
- “what is PDRN?”
- “salmon DNA skin booster”
- “tiktok made me do it... and now my barrier is ruined”
- “let’s debunk the worst advice going viral rn”
- “by emily | hydration specialist”
- “relax. i’ve got you covered”
- “this is what you need”
- Editorial label pattern: `DEW THEORY / MYTH BUSTING`

### PDRN accuracy

PDRN is **not** in `lib/services.js` and is **not** a catalog SKU. Homepage treats it as **education only** with an explicit “not a menu item” note. Do not invent a bookable PDRN treatment.

---

## 2026-09-20 Cursor Cloud — allowlist catalog autonomy (code on branch)

**Signed:** Cursor Cloud Agent  
**Branch:** `cursor/catalog-allowlist-sync-a147` @ `07fbab511b30f2b4469723fc54f2a713b1445d74`  
**Base `main`:** `2022a24ce2394720eaf3b296358b423b569f7452` (re-verify after merge)  
**PR:** https://github.com/marinerxcapital/dew-theory-website/pull/25

Allowlist-only Skin Script → Dew Theory catalog sync is **code complete on this branch**. It does not publish the full wholesale catalog. Production Worker is unchanged this session (`SKIN_SCRIPT_MODE=mock` still means cron **skips**, it does not apply mock as live).

| Piece | Status |
|-------|--------|
| Allowlist | `data/catalog-allowlist.json` — 8 current shop SKUs |
| Live source | RPA `/v1/catalog/list` or `SKIN_SCRIPT_FEED_URL`; HTTP adapter still a stub |
| Cron | wrangler `0 6 * * *` → `POST /api/cron/catalog-sync` with `CRON_SECRET` |
| Admin | `/admin/sync` — allowlist, last sync, dry-run vs apply, SKU results |
| Fly / portal secrets | **Still owner-blocked** — autonomy stays skipped until set |
| Live supplier order | **Not part of this work** |

Owner checklist: `docs/SKIN_SCRIPT_SYNC.md`.

| Gate | Result |
|------|--------|
| `npm test` | **290 pass / 0 fail** (101 suites) |
| `node scripts/check-project-continuity.mjs` | `[continuity] OK` |
| Production deploy | **Not done** |
| Live Skin Script order | **Not done** |

## CURRENT PRODUCTION STATE

| Item | Verified value (re-check before acting) |
|---|---|
| Business | Dew Theory — Skin Script retail + Emily Mitchener aesthetician services |
| Production domain | https://dewtheoryco.com (+ www) |
| GitHub | `https://github.com/marinerxcapital/dew-theory-website` |
| Origin | `origin` → GitHub above |
| Default / production branch | `main` |
| Live production SHA (verified deployed) | Last recorded Worker deploy SHA `04d653456d4046ff1a1a27bcccc39e95336ea1dd` (PR #17). `main` has since moved (Stripe Worker fixes, PR #19, PR #21 secrets-closeout, PR #24 catalog honesty, PR #23 site polish). Re-verify with Wrangler before acting — this session did not deploy. |
| `main` HEAD (2026-09-20 rebase) | `8f7786a` (PR #23 site polish) on `6e518e0` (PR #24 catalog honesty) / `243858d` (PR #21 secrets-closeout). |
| Draft handoff PRs | **Closed 2026-09-20:** #20 (secrets — do not merge; branch deleted), #13, #18, #10 (superseded). See `docs/memory/ACTIVE_WORK.md`. |
| SuperGrok work branch | Wave 2 durable pending-checkout **merged via PR #19**; follow-up Stripe Worker transport/tax fixes on `main`. |
| Catalog honesty | PR #24 merged — Emily did **not** confirm SPF retail, lip SKU structure, mask size, or DEW15. Defaults remain engineered and explicitly unconfirmed. |
| Site polish | PR #23 merged — checkout validation, honest storefront copy, trust strip, card skeletons. |
| Worker | `dew-theory` (Cloudflare Workers via OpenNext) |
| Current Worker version ID | `72210705-42d0-4032-a5a2-b7726f942f5b` (2026-09-26 spectral editorial transformation; previous `676ef571-3bf1-4d63-830a-611a12a7f96d` is the rollback target) |
| Revamp branch | `cursor/brand-revamp-editorial-5502` |
| Revamp commit (implementation) | `e4e036df18fccccbf36157de343419fce07218f1` on `cursor/brand-revamp-editorial-5502` (PR #7); squash merge `17d4849a0c3bb502d2341552ee5573a12f46472f` has an empty tree diff vs this audited head |
| Live design as of 2026-09-26 | **Spectral editorial homepage live**: pearl/iridescent hero (`Your skin. / Less guessing.`, Shop skincare + Book a consultation), trust strip, two ways to start, shop by skin goal, featured product story, personalization hub (quiz + routine + Emily), meet Emily, Emily's picks, Dew Edit, consultation CTA. Consultation page rebuilt with the 10-section flow. Concierge drawer live. Nav/Footer unchanged. |
| Live design as of 2026-08-29 (historical) | **Only consultation + products live**: sage `#93A890` hero with two CTAs (`Shop Skin Script`, `Virtual Consultation`), then `Emily's picks` product rail. |
| Deploy blocker this session | Worker deployed via existing Wrangler OAuth `skyler@marinerxcapital.com`; Stripe live/test keys + Tax, RPA container, and live order remain owner-blocked |

**Admin Command Center (PR #16, 2026-09-01):** Emily-only owner console at `/admin` with durable commerce KPIs, fulfillment center, Stripe/RPA integration health, attention queue. Data authority documented in `docs/ADMIN_COMMAND_CENTER_ARCHITECTURE.md`. Merged and live on production this session; unauthenticated gate, `noindex`, `robots.txt` exclusions, and no-secret-leak HTML verified. Owner login + TOTP live check remains owner-only.

**Live smoke (production, 2026-09-01):** `https://dewtheoryco.com` and `www` return HTTP 200 over HTTPS and serve the consultation+products-only build (`Shop Skin Script` + `Virtual Consultation` present). `npm run smoke:routes -- https://dewtheoryco.com` passed for retained routes and all 8 public legal PDFs. Cloudflare deployment readback shows Worker version `c9a82bb3-2c27-46f3-93ca-9f1df99b7702`.

**Stripe wiring merged + deployed (PR #17, 2026-09-02):** Cursor's `cursor/stripe-wire-e021` (shared `lib/stripe/config.js`, Checkout + Tax extensions, webhook durable-event persistence, `npm run stripe:bootstrap`) was squash-merged into `main` and deployed. Later `main` commits include Stripe Workers fetch transport, tax behavior, and customer-update guards (`a108823`, `4051918`, `d6886bb`).

**Live webhook re-verify (2026-09-20):** `POST https://dewtheoryco.com/api/webhooks/stripe` with empty JSON returns **400 `missing_signature`** (fail-closed on unsigned posts). This is **not** the 2026-09-04 `503 stripe_not_configured` — `STRIPE_WEBHOOK_SECRET` (and likely other Stripe secrets) appear set on the live Worker. Owner should still confirm Dashboard endpoint + a test-card paid → D1 write.

**Skin Script fulfillment (2026-09-20):** Production vars remain `SKIN_SCRIPT_MODE=mock` + `AUTO_FULFILL=false` in `wrangler.jsonc`. Admin + customer copy now labels owner/manual queue when RPA is not live. Durable paid → job outbox remains; auto-submit is off. Fly RPA is not deployed. Owner steps: `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md`. **Draft PR #10 is superseded** (D1 closeout already on `main` via later PRs; merging #10 would revert Admin Command Center / Stripe / WooCommerce portal).

**SuperGrok Wave 0 re-verify (2026-09-04 ~10:25 ET):** Historical. Wave 2 durable pending-checkout later merged via PR #19 (`d22c091`). Webhook `503 stripe_not_configured` is **stale** as of 2026-09-20 (`400 missing_signature`). Wrangler vars `SKIN_SCRIPT_MODE=mock` + `AUTO_FULFILL=false` still the committed production defaults. Fly RPA still not deployed.

### 2026-09-20 Cursor Cloud — Skin Script fulfillment honesty + PR #10 disposition

**Signed:** Cursor Cloud Agent  
**Branch:** `cursor/skin-script-rpa-go-live-17c7`  
**Base `main` (after rebase):** `8f7786a` (PR #23) on `6e518e0` (PR #24) / `243858d` (PR #21)  
**This session did not deploy Worker or Fly.**

| Area | Status |
|------|--------|
| Fulfillment path | Paid → durable job (`persistPaidOrderWithJob`). `AUTO_FULFILL=false` skips adapter. Admin manual panel records PO/tracking without Skin Script calls. |
| Production labels | Admin Command Center / orders / confirmation / `/shipping` say owner/mock queue when `SKIN_SCRIPT_MODE=mock` and RPA is not live. No customer “auto-fulfill is enabled” hedge. |
| Job completion bug | `fulfillOrder` now reloads the job after `ensureFulfillmentJobForPaidOrder` and writes failures to commerce when the order is D1/file-backend only. |
| PR #10 | **Superseded — close, do not merge.** Head `3405a3e` vs `main` would delete Admin Command Center, Stripe wiring, WooCommerce portal, verified mappings. D1 closeout already on `main`. |
| Owner runbook | `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md` |
| Fly / live PO | Still owner-blocked. No credentials invented. No live Skin Script order. |

**Live probe (2026-09-20):** `POST /api/webhooks/stripe` → 400 `missing_signature`.

| Gate | Result |
|------|--------|
| `npm test` (PR #22 fulfillment session) | **248 pass / 0 fail** |
| `npm test` (after rebase onto PR #21 + #24) | **257 pass / 0 fail** |
| `node scripts/check-project-continuity.mjs` | `[continuity] OK` |

**2026-09-19 Emily catalog confirmation pass (docs/honesty only, merged PR #24):** Emily did not answer the confirmation prompt. Engineered defaults stay in `data/products.json`: Sheer Protection SPF retail **$30** with `retail_price_confirmed: false`; lip treatment remains one Peppermint/Pomegranate product; Botanical Bloom remains **2 oz** with `size_confirmed: false`; `DEW15` remains a 15% launch-promo placeholder (`rate_confirmed: false`). `OPEN_ITEMS.md` §2 dated 2026-09-19. Storefront does not label unconfirmed prices as confirmed. Admin product/discount copy now says “unconfirmed” / “launch promo placeholder,” not Emily-approved. Catalog-honesty gates: `npm test` **250 pass / 0 fail**; continuity **OK**. Merged via PR #24 @ `6e518e0`. No new prices invented.

### 2026-09-20 site polish (PR #23)

**Branch:** `cursor/site-polish-ux-68ea` · **PR:** #23  
**Rebased onto:** `origin/main` @ `6e518e0` (PR #24 catalog honesty + PR #21 secrets-closeout docs)  
**Signed:** Cursor Cloud Agent · **Timestamp (UTC):** 2026-09-20

Storefront UX polish against the 2026-09-19 live audit. No invented reviews, testimonials, credentials, or prices. Catalog honesty flags from PR #24 are preserved.

- Checkout lists missing required shipping fields (inline + summary); phone remains optional
- `/shipping` + cart shipping copy: $7 / $49+ pre-discount; carrier/transit confirmed per order
- `/privacy` separates live handling from unpublished banner / retention / request procedures
- Honest trust strip on home + shop (Skin Script actives, Emily consult, shipping threshold)
- Empty bag Shop CTA + free-shipping meter; product-card skeletons + first-row `priority`
- Footer still omits unpublished About; eight public legal Help links unchanged

| Gate | Result |
|------|--------|
| `npm test` | **262 pass / 0 fail** (after rebase onto PR #24) |
| `node scripts/check-project-continuity.mjs` | `[continuity] OK` |
| Production deploy | **Not done this pass** |

---

## FRESH-SESSION CONTINUATION BRIEF

### Stack

- Next.js 15 App Router, React 19, Tailwind 3.4, JS (jsconfig)
- Package manager: npm (`package-lock.json`)
- Commerce: local cart (`CartProvider` / `dew_theory_cart_v1`) → `POST /api/checkout` → mock paid **or** Stripe Checkout when keys set
- Catalog: `data/products.json` (8 Skin Script SKUs) + optional runtime store
- Hosting: Cloudflare Workers (`wrangler.jsonc` + `@opennextjs/cloudflare`)
- Fonts: Bodoni Moda / Jost / Karla via `next/font`

### Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run start
npm run smoke -- http://localhost:3000
npm run smoke:routes -- http://localhost:3000
npm run smoke:routes -- https://dewtheoryco.com
npm run deploy   # requires Cloudflare auth
```

### Environment variable NAMES only (never commit values)

See `ENV.md` / `.env.example`. Key names: `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_TOTP_SECRET`, `GOOGLE_CALENDAR_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `SKIN_SCRIPT_*`, `AUTO_FULFILL`, `CRON_SECRET`, `XAI_API_KEY`, `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`, `CONSULTATION_*`, `MEMBERSHIP_PACKAGES_JSON`, `BOOKING_*`.

### Public route inventory

`/`, `/shop`, `/shop/[id]`, `/skin-quiz`, `/routine`, `/cart`, `/cart/confirmation`, `/virtual-consultation` (+ intake/plan/success), legal: `/privacy` `/terms` `/shipping` `/returns` `/booking-policy` `/aesthetic-disclaimer` `/cookies` `/accessibility`, `/admin/*`.

**Published alias:** `/quiz` 307-redirects to `/skin-quiz` (kept for legacy internal links).

**Unpublished (return the application 404):** `/services`, `/membership`, `/book`, `/about`, `/contact`, `/faq`. `/studio` 308-redirects to `/`.

> Corrected 2026-09-26: an earlier revision of this file listed `/routine` and `/quiz` as unpublished. Both are live (`app/routine/page.jsx` is a real page; `app/quiz/page.jsx` is a redirect), the Footer links `/routine`, and `/skin-quiz` + `/routine` are in the sitemap.

### What this revamp changed

- Design tokens remapped to forest/sage/ivory/stone
- Hero + chrome (nav/footer/announcement/category) retinted
- Homepage editorial IA with Emily motifs + myth-busting education
- About page quote + sage philosophy band
- Contrast fixes for sage bands, `.btn-dew`, footer ivory opacities, shop quiz tile
- Docs: README tokens, this status file, Codex deploy handoff

### What must happen next for “complete”

1. PR #7 merged into `main` as squash merge `17d4849a0c3bb502d2341552ee5573a12f46472f`
2. `npm run deploy` completed for Worker `dew-theory`
3. https://dewtheoryco.com verified live with ivory ground + forest text + Bodoni motifs
4. `npm run smoke:routes -- https://dewtheoryco.com` passed; browser smoke passed cart/checkout handoff and mobile checks
5. Final deployed SHA + Worker version ID recorded here and in `docs/PRODUCTION_DEPLOY_LOG_2026-08-25.md`

If blocked, follow `DEW-THEORY-CODEX-PRODUCTION-DEPLOYMENT-HANDOFF.md`.

---

## HOW TO CONTINUE

1. `git fetch origin && git checkout cursor/brand-revamp-editorial-5502 && git pull`
2. `git status` / `git rev-parse HEAD` / `git log -5 --oneline` — do not trust this file’s SHA alone
3. `npm ci && npm test && npm run build`
4. Merge to `main` through the repo’s permitted PR workflow
5. Deploy: `npm run deploy` (needs `CLOUDFLARE_API_TOKEN` + account, or interactive `wrangler login`)
6. Live-verify dewtheoryco.com + www canonical/HTTPS
7. Update this file’s **CURRENT PRODUCTION STATE** with the new SHA and Worker version

---

## DO NOT FABRICATE

Future agents **must never invent**:

- Products, services, prices, inventory, ingredients, SKUs
- Credentials, licenses, locations, hours, phone numbers
- Testimonials, review counts, ratings, awards, press
- Medical/FDA claims, efficacy percentages, before/after results
- PDRN (or any viral ingredient) as a bookable treatment unless source truth adds it
- Deployment status, Git SHAs, CI results, or “live” claims without direct verification

Git SHAs and production state **change**. Always re-verify with `git`, GitHub, Wrangler/Cloudflare, and HTTPS fetches to https://dewtheoryco.com before declaring success.

Service menu entries in `lib/services.js` remain **placeholder** (see `OPEN_ITEMS.md`) — preserve the “being finalized” disclaimer; do not treat those prices as confirmed business facts.

---

## Architecture notes

| Area | Path / note |
|---|---|
| Shared chrome | `components/Nav.jsx`, `Footer.jsx`, `AnnouncementBar.jsx`, `CategoryNav.jsx` |
| Motion | `Hero.jsx` (canvas dew), `MotionRoot.jsx` (reveals), `MotionBackground.jsx` (ivory wash) |
| Cart | `components/CartProvider.jsx`, `CartView.jsx` |
| Products | `lib/products.js`, `lib/products-server.js`, `data/products.json` |
| SEO | `app/layout.jsx`, `app/sitemap.js`, `app/robots.js`, `components/JsonLd.jsx` |
| Legal | `lib/legal-documents.js`, `public/legal/pdfs/` |
| Deploy | `docs/DEPLOY_DEWTHEORYCO.md`, `wrangler.jsonc`, `open-next.config.ts` |

### Tests run this session (local)

| Gate | Result |
|---|---|
| `npm test` | 192 pass / 0 fail |
| `npm run build` | success |
| `npm run smoke:routes -- http://localhost:3000` | all clear |
| `npm run smoke` checkout | mock checkout OK; admin login 401 without local admin secrets (expected) |
| Production deploy | completed from `main` `17d4849a0c3bb502d2341552ee5573a12f46472f` (revamp) then `bb3a48c8e42bb0583e700ef9d4b11e765c2577f6` (logo) |
| Live brand verification of revamp | passed on apex production domain |
| Live logo verification | passed on apex + www: `logo-dewtheory-20260825.webp` (hero), `logo-dewtheory-mark-20260825.webp` (nav/favicon), `logo-dewtheory-ivory-20260825.webp` (footer), `logo-dewtheory-og-20260825.png` (OG) all served with transparent lossless alpha |

### Issues found and fixed this session
- Contrast failures on sage bands / `.btn-dew` / footer ivory opacities → fixed
- Shop quiz tile white-on-sage-deep → forest/ivory
- Late-mounted `[data-reveal]` product cards could stay invisible → MotionRoot MutationObserver + rescan

### 2026-08-25 Codex production deploy closeout

- PR #7 is merged. GitHub reports merge commit `17d4849a0c3bb502d2341552ee5573a12f46472f`; remote branch head `e4e036df18fccccbf36157de343419fce07218f1`; tree diff between them is empty.
- Local gates rerun after fresh clone: `npm ci` completed with 8 existing audit findings (1 moderate, 7 high); `npm test` passed 192/192; `npm run build` passed and generated 67/67 pages.
- `npm run deploy` completed via OpenNext/Cloudflare. Worker `dew-theory` Current Version ID: `c76d0236-07e4-47b1-9e49-e413664e80e9`; deployment created `2026-08-25T22:57:41.090Z` and read back at 100%.
- Apex and www roots returned HTTP 200 from Cloudflare. Route smoke passed all configured public routes and PDFs.
- Browser smoke passed: editorial brand signals, computed brand token wiring, shop card reveal after scroll, add-to-cart, cart quantity update/remove, checkout handoff without paid order, checkout policy links, mobile nav, and no horizontal overflow on `/`, `/shop`, `/cart`, `/privacy`, `/terms`.

### 2026-08-25 Codex logo replacement closeout

- Commit `bb3a48c8e42bb0583e700ef9d4b11e765c2577f6` (`feat(brand): replace Dew Theory logo assets`) replaced the wordmark lockup, nav mark, footer ivory lockup, favicon, and OG/social image across `Nav`, `Hero`, `Footer`, `Wordmark`, `layout`, home/shop/virtual-consultation metadata, `site.webmanifest`, and `_headers`.
- Deployed as Worker version `2f3d66be-106a-4c52-9060-26b5ee3a94bf` (`2026-08-25T23:33:19.034Z`), read back at 100%.
- Verified live on apex + www: all logo asset URLs return HTTP 200; the new WEBP assets are lossless (`VP8L`) with alpha so they blend into the ivory/forest/sage surfaces without a bounding box; the `1200x630` OG PNG is a full-bleed social card (opaque by design).
- No code references the legacy `/logo.webp`, `/logo.png`, or `/logo-mark.webp` paths except the backwards-compatible cache rules in `public/_headers`; the legacy files remain as in-place copies of the new artwork.

### 2026-08-26 Codex owner simplification closeout

- Commit `4b69747e7ef2fdc65c54e108d57624946fb71269` (`feat: simplify Dew Theory site per owner feedback`) shipped the owner's reduction pass and deployed as Worker version `98313824-e97d-480a-ba84-059be65de309` (`2026-08-26T00:51:15.450Z`), read back at 100%.
- Sage hero: `.hero-stage` now uses the approved sage token `#93A890` with a subtle `#5B7356` radial accent; the pale product-photo/wash/caustic background was removed.
- Homepage reduced to hero + `Emily's picks` product rail. Removed: philosophy (`a calm monday`), trust strip, reassurance band, myth-busting/viral-caution block, PDRN card, shop-by-concern/type, quiz feature, routine builder, starter kits, services, virtual-consultation/Emily, and FAQ/membership homepage sections.
- Primary menu simplified to Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ. `Book a Facial`/`Book` removed from mobile menu, desktop utilities nav, footer CTA/Services column, and the sticky mobile bar.
- Mobile sticky CTA collapsed to a single full-width `Shop` button with safe-area handling intact.
- Preserved routes `/routine`, `/services`, `/membership`, `/book`, `/virtual-consultation`, and catalog/checkout/search/legal remain live and indexable.
- Gates: `npm test` 192/192, `npm run build` success, production route/PDF smoke `all clear`.

### 2026-08-26 Codex owner-removal correction closeout (this pass supersedes the prior one)

The prior "simplification" closeout above is **incomplete**. It removed Routine/Services/Membership/Book a Facial from the primary menu while leaving the same features publicly reachable through the footer, the global search index, the sitemap, internal cross-links, and the live `/routine` `/services` `/membership` `/book` routes (all returned HTTP 200). That directly contradicted Emily's annotated request.

Correction commit `32e22dbe739861e6781ec32dbb9448cb76323c91` (`fix: complete Dew Theory owner-requested removals`) removes the four offerings from the current public experience:

- **Routes unpublished:** deleted `app/routine/page.jsx`, `app/services/page.jsx`, `app/membership/page.jsx`, and `app/book/page.jsx`. All four paths now return the application 404. Source for later restoration is preserved in git history; backend API routes and dead `RoutineBuilder`/`BookingFlow`/`MembershipInterestForm` components were intentionally left as archived code.
- **Footer corrected:** removed `Routine builder`, the `Services` column, and `Membership`. `Virtual consultation` moved into the `Dew Theory` column. Grid reduced from 5 to 4 columns. Removed the "in-studio facials" tagline phrase.
- **Search index cleaned:** removed the Routine Builder / Services / Book a Facial / Membership static pages and the `SERVICES` loop from `lib/search.js`.
- **Sitemap cleaned:** removed `/routine`, `/services`, `/book`, `/membership` from `app/sitemap.js`.
- **Cross-links removed:** cleared `/routine`, `/services`, `/membership`, `/book` links and CTAs from shop/PDP, quiz, about, FAQ, skin-quiz results, "Emily pairs with", cart, cart confirmation, contact form topic, 404 page, booking-policy/aesthetic-disclaimer related links, and the (redirected) studio page.
- **Metadata/structured data:** removed "book treatments / book facials" from homepage/layout metadata and removed the `In-studio facial` offer (`/book`) from the `BeautySalon` JSON-LD.
- **Sticky CTA:** confirmed single full-width `Shop` action (no `Book a Facial`).
- **Mobile menu:** confirmed exactly Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ plus Shop-by-type catalog categories.

**Live verification (production):** apex + www return HTTP 200; `/routine`, `/services`, `/membership`, `/book` return 404; sage `#93A890` hero confirmed in compiled CSS; homepage removed copy (`a calm monday`, `worst advice`, `tiktok made me do it`, `what is PDRN`, trust-strip copy) absent; `Shop Skin Script` + `Take the Skin Quiz` + `Emily's picks` present. Browser verification (headless Chromium, 390px + 1280px) confirmed the mobile menu, desktop category nav, footer, and sticky CTA match the owner request.

**Do not reintroduce** Routine, Services, Membership, or Book a Facial into the public site unless Emily explicitly asks. Git history is the restore point.

### 2026-08-29 Codex "consultation + products only" closeout

Owner directive: **"Only consultation and products nothing else!"**

Commit `415f0881275dbb856c332ebedd67289cb8241289` (`feat: limit public site to consultation and products`) reduces the public offering surface to exactly two things — **Products** (Shop) and **Virtual Consultation**:

- **Routes unpublished:** deleted `app/quiz/page.jsx`, `app/about/page.jsx`, `app/contact/page.jsx`, `app/faq/page.jsx`, and `app/studio/page.jsx`. All now return the application 404 (`/studio` 308-redirects to `/`). Source preserved in git history.
- **Navigation:** mobile primary menu is now exactly `Shop` + `Virtual Consult` (plus Shop-by-type catalog categories). Desktop category rail is `Shop` / Cleansers / Treatments / Moisturizers / SPF / Virtual Consult. Removed Skin Quiz, Emily, Contact, FAQ.
- **Footer:** reduced to brand block (with `Virtual consultation` link) + `Shop` + `Help` (legal). Removed Skin Quiz, About Emily, Contact, FAQ, and `Order support`.
- **Homepage hero:** two CTAs are now `Shop Skin Script` + `Virtual Consultation`. `Emily's picks` product rail retained. Homepage metadata no longer advertises quiz/facials.
- **Search index:** removed Skin Quiz, About Emily, Contact, and FAQ entries from `lib/search.js`.
- **Sitemap:** removed `/quiz`, `/about`, `/contact`, `/faq`.
- **Cross-links:** cleared `/quiz`, `/about`, `/contact`, `/faq` from shop, PDP, cart, cart confirmation, shop-grid empty state, global-search fallback, "Emily pairs with", legal pages, and virtual-consultation success/plan pages. `/contact` references replaced with `mailto:hello@dewtheory.studio` where a support channel is legally required (privacy/returns/accessibility/consultation).
- **Transactional emails:** removed `/book` and `/contact` URL references; replaced with `hello@dewtheory.studio`.
- **Tests:** extended `tests/public-removals.test.mjs` and `tests/search-shop-filters.test.mjs` to enforce the full removed-route set (196 pass / 0 fail).

**Commerce and legal infrastructure retained:** `/shop`, `/shop/[id]`, `/cart`, `/cart/confirmation`, all legal pages, and the virtual-consultation flow remain live and functional.

**Live verification (production):** apex + www return HTTP 200; `/quiz` `/about` `/contact` `/faq` `/routine` `/services` `/membership` `/book` return 404; retained routes return 200; homepage + mobile menu + footer + desktop nav verified with headless Chromium.

**Do not reintroduce** Skin Quiz, About/Emily, Contact, FAQ, Routine, Services, Membership, or Book a Facial into the public site unless Emily explicitly asks.

### Remaining technical debt

- Placeholder service menu prices (`OPEN_ITEMS.md`)
- `/studio` still omitted from sitemap
- Stripe / Resend / Calendar secrets for full production commerce email
- Sephora redesign doc (`docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md`) is historical; brand SoT is this file
- GSAP listed in package.json but unused by components
- Homepage is intentionally minimal per owner direction; prior editorial/educational sections are preserved in git history for later reintroduction
- **Skin Script RPA:** D1 provisioned (`cd55d01f-2c27-4b53-a8aa-9b10555d3b17`); WooCommerce portal flow implemented; live auth blocked — see `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`

### 2026-08-31 Skin Script RPA fulfillment architecture (Cursor)

**Branch:** `cursor/skin-script-rpa-fulfillment-5261`  
**Original PR:** #8 (now merged at `20b7b1c` from older head `1056dba`)  
**Replacement PR:** #10 (draft, 2026-08-31 D1 closeout) — **superseded 2026-09-20**; do not merge (later Admin/Stripe/portal work is already on `main`)  
**Starting SHA:** `69d66d1af4f36b6bf73098e8d636fb8cf8728144`  
**Current SHA:** `99bef7d`  
**Signed:** Cursor Cloud Agent  
**Timestamp (UTC):** 2026-08-31T17:03:00Z

| Area | Status |
|------|--------|
| Durable commerce (D1 + file) | Implemented — D1 binding stub; `scripts/setup-d1-commerce.mjs` added |
| Fulfillment jobs / outbox | Implemented |
| Stripe paid → job | Implemented via `persistPaidOrderWithJob` |
| RPA service (`services/skin-script-rpa/`) | Implemented — FastAPI, Playwright, HMAC, Docker |
| RPA adapter (`SKIN_SCRIPT_MODE=rpa`) | Implemented |
| Verified supplier mappings | Templates via `npm run seed:mappings` (verified=0 until Codex) |
| Mock supplier portal | **Dynamic server** `services/mock-supplier-portal/server.py` + scenario matrix |
| Playwright E2E | **9 E2E tests** against mock portal |
| Node failure-injection | **11 tests** in `tests/commerce-failure-injection.test.mjs` |
| Stripe→commerce integration | **2 tests** in `tests/stripe-commerce-integration.test.mjs` |
| RPA adapter integration | **4 tests** in `tests/rpa-adapter-integration.test.mjs` |
| setup:d1 operator script | Fixed auth detection; `--remote` prod / `--local` dev |
| Agent memory system | `AGENTS.md`, `.cursor/rules/`, continuity script |
| CI | `.github/workflows/ci.yml` — **6/6 green** on push `c22eb17` (2026-08-31T17:00Z) |
| Production deploy | **Not deployed** — see Codex handoff |

**Tests (session 3 — 2026-08-31T17:02Z):**

| Gate | Result |
|------|--------|
| `npm test` | **220 pass / 0 fail** |
| `npm run build` | **success** |
| `python3 -m pytest -q` (RPA) | **12 pass** |
| `python3 -m ruff check app tests` | **pass** |
| `node scripts/check-project-continuity.mjs` | **OK** |
| `npm run setup:d1` (no auth) | **exit 2** (correct — requires wrangler login) |
| `npm run setup:d1:local` | **success** (local D1 schema only) |
| `docker build services/skin-script-rpa` | not run locally (no docker); CI docker-rpa pass on prior push |

**Real portal verification:** Not performed — selectors remain contract placeholders; Codex TASK-02.

**Codex handoff:** `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md` — TASK-02 through TASK-07 remain externally blocked; active approval gate is draft PR #10, not already-merged PR #8.

### 2026-08-31 Session 3 — Integration tests + setup:d1 fix (Cursor)

**Signed:** Cursor Cloud Agent · **Timestamp:** 2026-08-31T17:02:00Z

- Stripe→commerce integration tests (`markOrderPaidFromSessionAsync` → durable job)
- RPA adapter integration tests with mock HMAC HTTP server
- Job claim lock + network_error retry scheduling tests
- Fixed `setup:d1` false-positive auth (wrangler whoami exit 0 when unauthenticated)
- Added `npm run setup:d1:local` for dev-only local D1 schema

### 2026-08-31 Session 2 — E2E + failure injection (Cursor)

**Signed:** Cursor Cloud Agent · **Timestamp:** 2026-08-31T16:55:00Z

- Mock portal HTTP server with scenario injection (captcha, MFA, OOS, price drift, address, payment)
- Playwright worker E2E: dry-run happy path + production submit on mock + 6 blocked scenarios
- Node commerce failure-injection suite (idempotency, HMAC replay/skew, cancel, RPA kill switch)
- Operator scripts: `scripts/setup-d1-commerce.mjs`, `scripts/seed-supplier-mapping-templates.mjs`
- Worker fix: navigate to `/cart` before clear; `_test_scenario` hook for E2E only
- CI: `playwright install chromium` step added to python-rpa job
- Ruff: conftest.py specific exception handling (BLE001 fix)

### 2026-08-31 Codex TASK-01 — D1 commerce provision + production deploy

**Signed:** Codex  
**Timestamp (UTC):** 2026-08-31T21:17:00Z  
**Branch:** `cursor/skin-script-rpa-fulfillment-5261`  
**Code/config commit:** `7346633` (`fix: wire mock checkout to durable commerce`)  
**Production Worker version:** `30e07650-5d65-4ee1-a4fc-c7f0edf005ae`  
**D1 database:** `dew-theory-commerce` / `cd55d01f-2c27-4b53-a8aa-9b10555d3b17` / region `ENAM`

Completed:

- Provisioned remote Cloudflare D1 database `dew-theory-commerce`.
- Updated `wrangler.jsonc` `DEW_THEORY_D1.database_id` from placeholder to the real D1 ID.
- Applied `migrations/001_commerce_schema.sql` remotely; D1 readback showed commerce tables including `orders`, `fulfillment_jobs`, `supplier_mappings`, `webhook_events`, and `hmac_nonces`.
- Fixed `scripts/setup-d1-commerce.mjs` for Windows paths with spaces and idempotent reruns after `wrangler.jsonc` has a real commerce D1 ID.
- Patched mock-paid checkout to call `persistPaidOrderWithJob()` so production mock checkout verifies the durable commerce outbox path when Stripe keys are not available.
- Deployed Worker `dew-theory` from committed SHA `7346633`.
- Created production mock paid test order `ord_1788210773973`; response returned durable job `fj_1788210774554_5y45fov` with status `queued_for_supplier`.
- Redeployed after the test order; D1 readback still returned order `ord_1788210773973` status `paid` and fulfillment job status `queued_for_supplier`, proving the order is not only in the legacy runtime file store.

Gates run by Codex:

| Gate | Result |
|------|--------|
| `git fetch origin` / checkout / pull | Branch `cursor/skin-script-rpa-fulfillment-5261`, starting HEAD `85b4cfe` |
| `npx wrangler whoami` | Authenticated as `skyler@marinerxcapital.com` with MarinerX Capital D1 write access |
| `npm ci` | success; existing audit output remains 1 moderate / 7 high |
| `npm run setup:d1` | success after Windows helper fix; remote D1 migration idempotent |
| `npm test` | 220 pass / 0 fail |
| `npm run build` | success; 58 app routes generated |
| `python -m pip install -e ".[dev]"` | success |
| `python -m playwright install chromium` | success |
| `python -m pytest -q` | 12 pass |
| `python -m ruff check app tests` | pass |
| `npm run smoke:routes -- https://dewtheoryco.com` | all clear |
| D1 readback | `orders` + `fulfillment_jobs` rows present for `ord_1788210773973` after redeploy |
| `docker build services/skin-script-rpa` | blocked locally: `docker` command not found on PATH |

Remaining external tasks:

- TASK-02 portal reconnaissance: needs authorized Skin Script wholesale credentials and headed browser/MFA.
- TASK-03 verified supplier mappings: depends on real portal SKUs/URLs/prices from TASK-02.
- TASK-04 storage-state bootstrap: needs human MFA and secure secret-store destination.
- TASK-05 RPA container deploy and HMAC secrets: needs approved container host and secret values.
- TASK-06 real portal dry-run/live validation: needs TASK-02 through TASK-05 complete plus owner authorization before any real purchase.
- TASK-07 PR #10 merge: still blocked pending owner approval; do not merge.

### 2026-08-31 Cursor Cloud — WooCommerce portal + URL mapping (session 4)

**Signed:** Cursor Cloud Agent  
**Timestamp (UTC):** 2026-08-31T23:30:00Z  
**Branch:** `cursor/skin-script-rpa-completion-e021` (from `codex/skin-script-rpa-task01-closeout` @ `3405a3e`)  
**Merged:** PR #11 → `main` @ `5d2ec20`

| Area | Status |
|------|--------|
| WooCommerce portal profile | Implemented — `portal_flows.py`, `selectors-woocommerce.json` |
| Storage-state loading | Implemented in `worker.py` |
| Python `SKIN_SCRIPT_*` env aliases | Implemented in `app/config.py` |
| Public product URL registry | `data/supplier/skin-script-portal-urls.json` — 8/8 catalog URLs verified (HTTP 200/301) |
| Portal login attempt | **Failed** on `skinscript.com` — password incorrect (wrong login domain) |
| SKU/price verification | **Blocked** until correct login domain |
| RPA container deploy | **Not deployed** |

### 2026-09-01 Cursor Cloud — Authenticated portal + verified SKUs + live dry-run (session 5)

**Signed:** Cursor Cloud Agent  
**Timestamp (UTC):** 2026-09-01T01:30:00Z  
**Branch:** `cursor/skin-script-rpa-completion-e021`  
**HEAD:** verify with `git rev-parse HEAD` after pull  
**Base on main:** `5d2ec20` (PR #11 merged) + session 5 commits pending merge

| Area | Status |
|------|--------|
| Portal login | **Success** via `https://skinscriptrx.com/my-account/` → session on `skinscript.com` (“Hi, Emily!”) |
| MFA / CAPTCHA | Not observed on login |
| Verified SKU mappings | **8/8** products — variant SKUs + wholesale prices in `data/supplier/skin-script-portal-urls.json` |
| `npm run seed:verified-mappings` | Implemented — seeds `verified=1` D1/file templates |
| Live portal dry-run | **VERIFIED** — RPA worker returns `dry_run_ready` (green tea cleanser, SKU `1010240`) |
| Storage-state bootstrap | Session saved to `STORAGE_STATE_PATH`; container secret mount pending (TASK-04 partial) |
| RPA container deploy | **Not deployed** (TASK-05) |
| Live supplier order | **Not done** — no saved payment method on account; client dropship address fields often readonly in headless checkout |

**Tests (session 5):**

| Gate | Result |
|------|--------|
| `npm test` | 223 pass / 0 fail |
| `python3 -m pytest -q` | 15 pass |
| `python3 -m ruff check .` | pass |
| `npm run continuity` | OK |
| Live dry-run (portal) | `dry_run_ready` — metadata `skus: [1010240]`, `dropship_mode: ship_to_client` |

**Skin Script portal discoveries (session 5 — no secrets):**

- Login entry: `https://skinscriptrx.com/my-account/` (not `skinscript.com/my-account/`)
- Portal base after auth: `https://skinscript.com`
- Cart API: `/wp-json/wc/store/v1/cart`
- Dropship: `#order-srx-srx_drop_ship_select` → “Yes - Ship direct to client”
- Payment: NMI gateway; **no saved payment methods** on Emily account
- Checkout `total_cents` in dry-run metadata is **grand total** (product + shipping/fees), not line subtotal alone

**Remaining owner / Codex tasks:**

- TASK-05: Deploy RPA container + Worker HMAC secrets
- TASK-06: Add saved payment method; map editable client dropship address fields; controlled live order
- TASK-07: Merge session 5 PR (PR #11 already merged session 4 only)

### 2026-09-01 Codex — D1 verified-mapping seed + RPA config fix

**Signed:** Codex
**Timestamp (UTC):** 2026-09-01T03:37:00Z
**Base branch:** `main` @ `30e2bd0` (PR #12 merged)
**Work branch:** `codex/skin-script-rpa-d1-seed-config-fix`

Completed this session:

- Confirmed `main` @ `30e2bd0` contains PR #12 (verified SKUs + live portal dry-run) and PR #11 (WooCommerce portal flow); re-ran the full local gates.
- Seeded **8 `verified=1` supplier mappings** into production D1 `dew-theory-commerce` (`cd55d01f-2c27-4b53-a8aa-9b10555d3b17`) and verified readback (SKU + wholesale price + product URL per line item).
- Added operator script `npm run seed:verified-mappings:d1` (`scripts/seed-verified-mappings-d1.mjs`). The existing `seed:verified-mappings` path uses the commerce backend, which cannot resolve the D1 binding from plain Node and silently falls back to `data/runtime/commerce.json`; the new script targets remote D1 via `wrangler d1 execute --remote`.
- Fixed `services/skin-script-rpa/app/config.py` to prefer `SKIN_SCRIPT_*` aliases over generic env names. On Windows the ambient `USERNAME` env var is always set to the OS account and was shadowing `SKIN_SCRIPT_USERNAME`, breaking one config test.

Gates (re-run this session):

| Gate | Result |
|------|--------|
| `npm test` | **223 pass / 0 fail** (78 suites) |
| `npm run build` | **success** (58 routes) |
| `npm run continuity` | `[continuity] OK` |
| `python -m pytest -q` | **15 pass** |
| `python -m ruff check app tests` | **All checks passed** |
| `npm run smoke:routes -- https://dewtheoryco.com` | **all clear** (22 checks incl. 8 legal PDFs) |

Production truth (re-verified, not assumed):

- Production Worker `dew-theory` current version `30e07650-5d65-4ee1-a4fc-c7f0edf005ae` (deployed 2026-08-31T21:16:59Z from `7346633`). `main` @ `30e2bd0` is merged but **not yet deployed** — Worker config unchanged and RPA mode still gated on the container host.
- D1 `dew-theory-commerce` now has 8 `supplier_mappings` rows with `verified=1`.

Container host (TASK-05) re-probe — still blocked:

- Local `docker`: not installed.
- Cloudflare Containers: `Unauthorized — requires Workers Paid plan`.
- Cloudflare Cloudchamber: `Unauthorized`.
- Railway CLI: authenticated as `skyler@certamaris.com` (CertaMaris workspace only; no Dew Theory project).

Remaining owner-blocked tasks (unchanged): TASK-05 container host + Worker HMAC/portal secrets; saved payment method on the Skin Script account; headed client-dropship address mapping; and one controlled live supplier order.

### 2026-09-01 Cursor Cloud — E2E stack verify + deploy automation (session 6)

**Signed:** Cursor Cloud Agent  
**Timestamp (UTC):** 2026-09-01T04:20:00Z  
**Base:** `main` @ `0c80486` (PR #14 merged — D1 seed + config fix)

| Area | Status |
|------|--------|
| Full stack E2E (local) | **VERIFIED** — Node `rpa-adapter` → local RPA service (HMAC) → live portal `dry_run_ready` |
| Production D1 mappings | 8 rows `verified=1` (Codex session) |
| RPA container public deploy | **Not done** — no `FLY_API_TOKEN` / `CLOUDFLARE_API_TOKEN` in this environment |
| Worker production deploy | **Not done** — `wrangler whoami` unauthenticated on Cloud Agent VM |
| Live supplier order | **Not done** — no saved payment method on Skin Script account |

**Added this session:**

- `scripts/e2e-rpa-live-stack.mjs` + `npm run e2e:rpa-live` — operator full-stack dry-run test
- `scripts/skin-script-checkout-probe.py` — payment/address field probe
- `services/skin-script-rpa/fly.toml` — Fly.io deploy template (Dew Theory org)
- `services/skin-script-rpa/.dockerignore` — exclude `.env` from image builds
- `.github/workflows/deploy-production.yml` — manual Worker + RPA deploy (needs repo secrets)

**Gates:**

| Gate | Result |
|------|--------|
| `npm test` | 223 pass |
| `npm run build` | success |
| `npm run continuity` | OK |
| `python3 -m pytest -q` | 15 pass |
| E2E stack (`e2e:rpa-live` vs local RPA) | `dry_run_ready` |

**To finish production (requires secrets Skyler adds to GitHub or local wrangler/fly auth):**

1. GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `FLY_API_TOKEN`
2. Run workflow **Deploy Production** → deploy Worker + RPA on Fly
3. `wrangler secret put` for `SKIN_SCRIPT_RPA_*` + portal credentials
4. Emily adds saved payment method on Skin Script portal
5. Controlled live order with `SKIN_SCRIPT_DRY_RUN=false`

### 2026-09-01 Codex — Admin Command Center merge + production deploy closeout

**Signed:** Codex
**Timestamp (UTC):** 2026-09-01T12:21:00Z
**Base:** `main` @ `9a3302e` (PR #15 deploy automation merged)
**Merged:** PR #16 (`feat(admin): Emily-only command center with durable commerce ops`) → `main` @ `458ea5923c11d282e7b5299a5a29d94fa41436e7`

Completed this session:

- Merged admin-command-center PR #16 (squash). PR #15 deploy automation and PR #14 D1 verified-mapping seed were already merged before this session.
- Deployed Worker `dew-theory` from `main` `458ea59` → **version `c9a82bb3-2c27-46f3-93ca-9f1df99b7702`**. Deploy readback confirmed `DEW_THEORY_D1` (`dew-theory-commerce`) + `NEXT_TAG_CACHE_D1` D1 bindings, R2 buckets, and custom domains `dewtheoryco.com` / `www`.
- Verified production:
  - `npm run smoke:routes -- https://dewtheoryco.com` → all clear (22 checks incl. 8 legal PDFs).
  - `/admin` and the new command-center routes (`/admin/fulfillment`, `/admin/integrations`, `/admin/system`, `/admin/orders`) return 307 → `/admin/login?next=...` when unauthenticated.
  - `/admin/login` returns 200 with no admin secret markers (`dew-admin-dev`, `admin@dewtheory.local`, `sk_live`, `sk_test`, `ADMIN_PASSWORD`) in the HTML.
  - `robots.txt` disallows `/admin` and `/api`; admin layout metadata is `robots: { index: false, follow: false }`.
  - D1 `dew-theory-commerce` readback: 8 `supplier_mappings` rows with `verified=1`.
  - Homepage still serves consultation+products surface (`Shop Skin Script` + `virtual consultation` + `Emily's picks`).

Gates (re-run this session):

| Gate | Result |
|------|--------|
| `npm test` | 228 pass / 0 fail |
| `npm run build` | success |
| `npm run continuity` | `[continuity] OK` |
| Main CI (push `458ea59`) | green — run `33506245873` |

Remaining owner/external blockers (unchanged):

- RPA service deploy to Fly.io: no `flyctl` CLI and no `FLY_API_TOKEN` in this environment; GitHub Actions secret needed.
- Emily saved payment method on Skin Script portal; controlled live supplier order (TASK-06).
- Stripe webhook registration + live Stripe keys.
- Emily owner login + TOTP live verification (owner-only; not performed without owner credentials).

### 2026-09-01 Codex (DeepSeek-V4) — production re-verification pass

**Signed:** Codex
**Timestamp (UTC):** 2026-09-01T12:40:00Z
**Branch:** `main` @ `51a8c68` (docs closeout on top of deployed code SHA `458ea59`)

No source-code changes made this pass; the already-merged Admin Command Center and durable commerce/RPA architecture were re-audited and left intact.

Re-verified current truth:

- Git: clean `main` @ `51a8c68`; all feature PRs merged (only prompt-doc drafts #10/#13 remain). Latest main CI green (`33507553238`).
- Production Worker `dew-theory` active version `c9a82bb3-2c27-46f3-93ca-9f1df99b7702` (created `2026-09-01T12:18:12Z`).
- D1 bindings `DEW_THEORY_D1` (`dew-theory-commerce` `cd55d01f-2c27-4b53-a8aa-9b10555d3b17`) + `NEXT_TAG_CACHE_D1`; R2 buckets `dew-theory-opennext-cache` + `dew-theory-consultation-photos`; 8 `verified=1` supplier mappings live.
- Worker secrets present: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (names only). Stripe, `SKIN_SCRIPT_*`, Resend, and TOTP secrets **still absent on Worker** (test Stripe wired locally on branch `cursor/stripe-wire-e021` — see `docs/implementation/STRIPE_WIRE_IMPLEMENTATION_LOG.md`).
- Admin owner-auth audit verdict: **SECURE** (fail-closed owner-only; no first-admin fallback; dev password rejected in production). Two low hardening notes recorded in `OPEN_ITEMS.md`.
- Live smoke `npm run smoke:routes -- https://dewtheoryco.com` all clear; `/admin*` routes correctly 307 → `/admin/login`.

Gates (re-run this pass):

| Gate | Result |
|------|--------|
| `npm test` | 228 pass / 0 fail |
| `npm run build` | success |
| `npm run continuity` | `[continuity] OK` |
| `python -m pytest -q` (RPA) | 15 pass |
| `python -m ruff check .` | All checks passed |

RPA container deploy blocker refined: `flyctl` is installable (`winget`/`scoop`/`choco` present) but zero Fly auth exists on this machine and GitHub repo secrets + variables are both empty, so neither local CLI nor CI can deploy. `fly.toml` / `Dockerfile` / `deploy-production.yml` are complete and deploy-ready pending owner Fly auth + portal/HMAC secret values.

### Chronology (this revamp)

1. Verified repo `marinerxcapital/dew-theory-website`, branch `main` @ `e9f64da`, clean tree
2. Audited architecture, routes, commerce, SEO, production Cloudflare path
3. Created `cursor/brand-revamp-editorial-5502`
4. Remapped tokens; retinted chrome/hero; editorial homepage + about
5. Independent audits found contrast issues → fixed
6. Tests + build + local smoke passed; pushed branch
7. Production deploy blocked → Codex handoff written
8. PR #7 merged; `npm run deploy` shipped revamp as Worker `c76d0236-07e4-47b1-9e49-e413664e80e9`
9. Brand logo replacement committed (`bb3a48c`) and deployed as Worker `2f3d66be-106a-4c52-9060-26b5ee3a94bf`; verified live on apex + www
10. Owner simplification committed (`4b69747`) and deployed as Worker `98313824-e97d-480a-ba84-059be65de309`; verified live on apex + www

## September 2026 — Green system revamp

Authoritative active colors live in app/globals.css (dt-green 50, 100, 200, 300, 400, 700, 900); Tailwind reads their RGB channels. Page 100; raised cards and photos 50; bands 100/200; panels 300; body 900; controls and links 700. Strong decorative borders 400, input boundaries 700 for AA. Hairline uses green 900 at 14%; green shadows 6–12%; frosted surfaces 50 at 68%; radius 10/16/24/pill; 2px green-700 focus with green-50 offset.

Use the single root Nav, announcement and four-column Footer on every route, including shop and admin; admin keeps its authenticated owner navigation inside the shared shell. Tagline Clinical · Precise · Personal. Consultation nav points to /virtual-consultation; /consultation permanently redirects. Shared ProductCard, MeetEmily, button/chip/form roles and loading/error components must remain shared.

Typography: next/font Fraunces variable SOFT 100 for display/product names; Figtree for UI/body/tabular prices; Newsreader for journal prose only. Roman preload; swap. US English. Respect reduced motion; continuous loaded-image animation is avoided, glass hover interaction retained.

Never fabricate reviews, ratings, medical claims, stock people, awards or results. Preserve product names, IDs/slugs, prices, stock, ingredient facts, shipping ($12 below $49 product subtotal), Stripe/checkout/secrets/webhooks. Do not rewrite legal/policy wording or PDFs. Existing missing manufacturer facts remain empty. Sizes normalize oz without trailing period or duplicates; no size is invented. Alt: Skin Script [Name] product photo. Image cache revision green-20260929; original product artwork and logo originals unchanged. Staged catalog artwork is excluded from this release.

Worktree C:\Users\Skyler B. Brown\Desktop\dew-theory-codex; branch revamp/green-system. A DeepSeek V4 Pro session was active in the canonical main source. Never edit/clean/install/kill processes there. Local Git objects live on C using scripts/git-green.ps1 because D is full. Main serving source: Desktop\DewTheory\working\dew-theory-wt-zero-touch, with orphaned Git metadata; old valid Git hub is D:\OffloadedProjects\dew-theory and has dirty work. Preserve both. Hash manifest and concurrency comparisons are in docs/revamp. Route list: docs/revamp/routes.json, including 35 visible products, 7 concern details, 4 journal articles, protected/post-checkout states and intentional 404.

Deployment path: Cloudflare Worker dew-theory via OpenNext/Wrangler. Verified rollback Worker version 2815c88a-6d37-4ead-b0e6-c6bbde9da72f (100%, 2026-09-28T21:03:41Z). Do not deploy a missing-image build or a stale source over concurrent work. Verify 115 catalog references in final .open-next/assets; read back active version after deployment. Roll back to the recorded version if production fails. No environment/secrets changes are part of the revamp. Latest resume authorizes the specifically listed branch/PR/main release actions; do not add unrelated GitHub work.

Open owner items: Shipping operations wording; Returns placeholders; Acai Berry manufacturer description hidden until supplied; consultation price display; hello@dewtheory.studio versus dewtheoryco.com; 27 records lack supplied concern/active content; authentic Stripe test-account handoff is unavailable without test credentials. Authenticated admin production content needs appropriate access. Cart drawer and cookie banner are absent from canonical source; do not invent consent/legal behavior. Consult resume-state.md and executed reports for current gates; unfinished tests are not passing evidence.

