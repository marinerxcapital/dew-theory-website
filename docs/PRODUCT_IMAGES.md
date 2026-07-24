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
