# Skin Script product images

**Installed:** 2026-07-24  
**Package:** `DewTheory_SkinScript_Product_Implementation_Package`  
**Public base:** `/images/products/skin-script/`

## Assets

| Product (canonical id) | Production PNG |
|---|---|
| `green-tea-citrus-cleanser` | `00-green-tea-citrus-cleanser.png` |
| `mandelic-brightening-serum` | `01-mandelic-brightening-serum.png` |
| `hydrating-skin-serum` (Ageless Skin Hydrating Serum) | `02-ageless-skin-hydrating-serum.png` |
| `ageless-moisturizer` | `03-ageless-skin-moisturizer.png` |
| `botanical-bloom-hydrating-mask` | `04-botanical-bloom-hydrating-mask.png` |
| `lip-treatment-peppermint-pomegranate` | `05-ageless-lip-treatment.png` |
| `cucumber-hydration-toner` | `06-cucumber-hydration-toner.png` |
| `sheer-protection-spf` | `07-sheer-protection-spf-30.png` |

Matching `.webp` files sit beside each PNG. Dimensions: **832 × 1232** (aspect **52:77**).

Manifest copy: `public/images/products/skin-script/product-image-manifest.json`.

## Data wiring

- Canonical catalog: `data/products.json` → `images[]`, `image_alt`, `image_webp`
- Resolver: `lib/product-image.js` (`productImageSrc`, `productImageAlt`, id fallback map)
- UI: `components/ProductImage.jsx` (52/77 frame, no extra bg on photos, no color-shift filters)
- Cart: `components/CartView.jsx` thumbnails via seed catalog

Commerce IDs, prices, SKUs, and fulfillment fields were **not** changed.

## Surfaces

| Surface | Status |
|---|---|
| Home featured | ✅ ProductImage |
| Shop grid | ✅ ProductCard → ProductImage |
| PDP + related | ✅ ProductImage; OG uses productImageSrc/Alt |
| Cart | ✅ thumbnails |
| Checkout (Stripe) | N/A line images (hosted Checkout) |
| Order confirmation | text-only (unchanged) |
| Admin product form | image_url field still available |

## Rollback

```bash
git revert <commit>
# or restore from .dewtheory-backups/product-assets/<timestamp>
```
# 2026-09-29 Skin Script 252-source autonomous catalog package

The local autonomous production package completed asset QA for the full Skin Script source set.

- Source ZIP SHA256: `b74ae4fd8cd13a82459153465e06f2c2cf8ecb9b0b7c4f942a358911d2e3d5a7`
- Canonical output directory:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\final_catalog`
- Final ZIP:
  `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\output\DEW_THEORY_SKINSCRIPT_FINAL_252_CATALOG.zip`
- Final ZIP SHA256: `85c6f3261e79f2ad284fe0335710b60dcb1bac3da2429c063c0b1d7ec61f348e`
- Count: 252 standalone PNGs, one per manifest source assignment.
- QA: `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\work\FINAL_QA_REPORT.json`
  passed with 252 expected / 252 existing / 0 errors.
- Ledger: `work\dewtheory-codex-package-20260928\DEW_THEORY_SKINSCRIPT_CODEX_AUTONOMOUS_PRODUCTION_PACKAGE_V1\manifests\PROGRESS_LEDGER.csv`
- Deployment: not performed; these assets are not yet wired into the live storefront.
- Professional visual QA regenerated sources 119, 128, 135, and 238 for better readability and
  cleaner presentation.

Source duplicate note: source 049 and source 082 are byte-identical in the source ZIP. Source 082
was rendered on approved background `D` to avoid a byte-identical final PNG while preserving source
pixels.
