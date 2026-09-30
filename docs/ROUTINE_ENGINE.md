# Routine engine

Canonical helpers live in `lib/routine.js`. Storefront PDP, cart upsells, shop filters, and the skin quiz all consume the same ordering so moisturizer never sorts before serum.

## Layering order (`ROUTINE_ORDER`)

1. Cleanser  
2. Toner  
3. Exfoliant  
4. Serum  
5. Eye Treatment  
6. Spot Treatment  
7. Mask  
8. Moisturizer  
9. Lip Treatment  
10. SPF  

Kits are not a daily step and remain unranked (sort last).

Sorting always uses this list via `sortByRoutineOrder` / `categoryRank`. Complements and missing-step suggestions return products already sorted by this order.

## Typed stages (`ROUTINE_STAGES`)

Conceptual Cleanse → Tone → Treat → Seal → Protect mapped onto catalog categories:

| Stage | Categories | AM | PM |
|---|---|---|---|
| Cleanse | Cleanser | yes | yes |
| Tone | Toner | yes | yes (optional) |
| Treat | Exfoliant, Serum, Eye Treatment, Spot Treatment | yes | yes |
| Mask | Mask | no (typically) | yes / as needed |
| Moisturize | Moisturizer | yes | yes |
| Lip | Lip Treatment | yes | yes (optional) |
| Protect | SPF | **yes only** | no |

SPF is the last daytime step and is excluded from PM filters / evening suggestions.

## Public helpers

| Export | Role |
|---|---|
| `getRoutineStage(product)` | Typed stage metadata for a product or category string |
| `sortByRoutineOrder(products)` | Stable sort by `ROUTINE_ORDER`, then name |
| `formatRoutinePosition(product, catalogContext?)` | PDP copy: headline, time label, neighbors |
| `suggestRoutineComplements(products, productId, opts?)` | Adjacent / later steps for a PDP |
| `suggestMissingRoutineSteps(cartItems, catalog, opts?)` | Cart gaps along the core daily path |

## UI wiring

- `components/RoutinePosition.jsx` — PDP stage visualization  
- `components/CompleteRoutine.jsx` — single “complete the routine” module (replaces separate EmilyPairsWith + related grids on PDP)  
- `components/CartView.jsx` — at most **one** missing-step recommendation  
- Shop concern chips (`CURATED_CONCERN_FILTERS` in `lib/shop-filters.js`) stay concern-first; type filters remain available  

## Honesty rules

- Do not invent ingredients, medical claims, or Emily endorsement quotes.  
- Emily notes use only authentic product fields (`emily_note`, `studio_note`, `description`); otherwise show unlabeled barrier-first guidance.  
- Shipping copy must match `lib/shipping.js` ($7 flat / free at $49+ pre-discount).  
