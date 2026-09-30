# Dew Theory — continuation pass: PDP routine timeline + shop filter completion

**Date:** 2026-09-26 (afternoon continuation)
**Working copy:** `Desktop\DewTheory\working\dew-theory-wt-zero-touch`
**GitHub:** not used.
**Direction:** CLINICAL NOIR is authoritative. It supersedes the earlier
Virtual Consultation and MAX UI/UX directives (owner-confirmed 2026-09-26), so the
structural items below were applied on top of the noir system rather than the
ivory/sage system.

## What shipped

Three items remained open from the earlier directives that are structural rather
than colour decisions. All three are now live.

| Item | Directive source | Where |
|---|---|---|
| Routine-position timeline on the PDP | MAX §13 | `components/RoutinePlacement.jsx`, `lib/routine.js` |
| Shop filters: routine step, price, availability | MAX §10 | `lib/shop-filters.js`, `components/ShopGrid.jsx` |
| Skin-concern chips above the fold on the PDP | MAX §12 | `app/shop/[id]/page.jsx` |

### Routine-position timeline

`lib/routine.js` gained `ROUTINE_TIMELINE` and `routinePlacement(category)`.
The timeline is a superset of the existing `ROUTINE_ORDER` (it adds Eye Treatment
and Spot Treatment, and omits Kit, which is a bundle rather than a step). Every
category in it exists in `data/products.json`; a test enforces that and enforces
that the relative layering order is preserved.

AM/PM labels come from the catalog's own copy, never from a guess:

| Step | Time | Basis |
|---|---|---|
| SPF | AM | `how_to_use`: "Apply in the morning" |
| Exfoliant | AM or PM | `how_to_use`: "once daily (AM or PM)" |
| Toner, Serum, Moisturizer | AM + PM | `how_to_use`: "morning and evening" |
| Mask, Lip Treatment | PM | PM path used by `defaultRoutineTemplate()` in `lib/skin-quiz.js` |
| Eye Treatment, Spot Treatment | *(none)* | catalog copy states no time — no label invented |

`components/RoutinePlacement.jsx` renders it as an ordered, wrapping list (so it
cannot overflow at 320 px), marks the current step with
`aria-current="step"` plus a screen-reader text equivalent rather than colour
alone, and prints the placement sentence ("After Exfoliant, before Eye
Treatment"). Products that are not a routine step render nothing.

### Shop filters

`lib/shop-filters.js` now has seven dimensions: type, concern, skin type,
routine time, **routine step**, **availability**, and **price**. Availability
uses the existing `isOutOfStock()` helper, so it cannot disagree with the badge
shown on a product card. `collectPriceBounds()` derives the supported range from
real visible `retail_price` values, and `formatPriceChip()` /
`formatPriceRange()` reuse the project's `formatMoney()` so currency is not
duplicated.

Price inputs commit on blur or Enter (never per keystroke), which keeps one
navigation per change instead of one per digit. All three new dimensions appear
in the desktop rail, the mobile drawer, and the active-filter chip row.

## Verification performed

| Check | Result |
|---|---|
| `npm test` | **315 pass / 0 fail** (110 suites; was 302 — 13 tests added in `tests/pdp-routine-and-filters.test.mjs`) |
| `npm run build` | success; 37 PDPs prerendered |
| `node scripts/smoke-routes.mjs https://dewtheoryco.com` | all clear (14 HTML routes + 8 legal PDFs) |
| `node scripts/verify-ui.mjs https://dewtheoryco.com` | **48/48 clean** — no overflow, broken images, heading-order jumps, or console errors at 8 viewports x 6 pages |
| Live PDP timeline | `Step 4 of 10`, 10 steps, current step = Serum, caption "After Exfoliant, before Eye Treatment · AM + PM" |
| Live PDP concern chips | 4 chips rendered from `conditions_addressed` |
| Live shop fieldsets | Product type, Skin concern, Skin type, Routine time, Routine step, Availability, Price |
| Live `?step=Mask` | 1 product |
| Live `?step=Cleanser` | 6 products |
| Live `?availability=in-stock` | 34 products |
| Live `?availability=out-of-stock` | 1 product |
| Live `?min=40` | 17 products |
| Live `?min=40&max=60` | 12 products |
| Live `?step=Mask&availability=in-stock` | 1 product · 2 filters |
| Console errors during those flows | none |

## Deploy

| Item | Value |
|---|---|
| Worker version | `aaa4a6c3-9ed8-4fb7-89c2-c706b3853bcb` |
| Previous live version (rollback target) | `b9bda07c-325e-48c1-b575-bd1ee429b531` |
| Path | `npm run deploy` (OpenNext -> Cloudflare Workers, account MarinerX Capital) |
| Domains | `dewtheoryco.com`, `www.dewtheoryco.com` |

### Runtime data hygiene

`data/runtime/store.json` and `commerce.json` are copied into the Worker bundle at
build time, and local test/preview runs mutate them. Both files were snapshotted
to `Desktop\DewTheory\backups\runtime-pre-continuation-20260926\` before any local
run, restored before the deploy, and the **bundled** copies inside
`.open-next/server-functions/default/data/runtime/` were then hash-compared against
that snapshot: byte-identical. No local telemetry shipped.

## Still open (not addressed here)

1. **Three documentation panels remain on the original sage plate** —
   `blemish-spot-treatment__02__gallery02`, `lip-balm-with-spf-15__03__gallery02`,
   `sheer-protection-spf__02__gallery03`. These are manufacturer label panels
   (Drug Facts / directions) rather than product silhouettes. Measurement showed
   91% of each frame sits within 14 RGB of the plate colour, so the panel fill and
   the background are the same tone: a colour key would blacken the panel and
   destroy the regulatory text. They were deliberately left byte-identical.
   The remaining 16 skipped assets in `reports/noir-product-imagery-20260926.json`
   are unreferenced master plates and do not appear on the site.
2. **Emily's portrait and hero/lifestyle imagery** are untouched — no verified
   portrait asset exists, and generating one would fabricate a likeness.
3. **Policy pages** carry the noir token layer only; they were not individually
   art-directed.
4. **The checkout flow was not re-driven end to end** in this pass. Payment,
   intake, photo upload, and fulfillment code were not touched, and the route and
   legal-PDF smoke suites pass, but a live test-card purchase was not executed.
5. **No Git commit** — this checkout has no usable Git metadata.
