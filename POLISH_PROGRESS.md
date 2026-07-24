# Polish Progress

Started: 2026-07-19T06:15:00Z
Mode: /loop
Interval: 30m
Completed: 2026-07-19T21:00:00Z

| ID | Status | Note | Updated |
|----|--------|------|---------|
| A1 | done | npm install ok; `npm run build` pass (39 routes); no lint/type errors. 2 vulns deferred to A3 | 2026-07-19T06:17:30Z |
| A2 | done | middleware admin gate; prod rejects default password/session secret; origin CSRF on mutations; rate limit 10/15m; timing-safe compare; no dev creds in prod UI | 2026-07-19T06:48:00Z |
| A3 | done | next 15.5.20 + react 19.2.7 + postcss 8.5.19/overrides; npm audit 0 vulns; build pass; see DEPENDENCY_AUDIT.md | 2026-07-19T07:24:00Z |
| B1 | done | CSS tokens as CSS vars; glass/nav/specular off pure #FFF; all bg-white* → pearl; no Inter/SaaS greys | 2026-07-19T07:55:00Z |
| B2 | done | body default Karla 300; labels Jost 300 + 0.34em lockup; display Bodoni 400; form inherit; type-* utilities | 2026-07-19T08:25:00Z |
| B3 | done | AmbientField ice/lavender/blush orbs + mesh; glass-1/2 more translucent blur; nav frosted reads ambient | 2026-07-19T08:55:00Z |
| B4 | done | focus-visible ice+graphite ring; skip links storefront+admin; main tabIndex=-1; mobile Esc/focus; shop tab arrows | 2026-07-19T09:25:00Z |
| B5 | done | overflow-x clip; cart summary first+sticky; admin cards/table dual layout; hero/shop/rule mobile fixes | 2026-07-19T09:55:00Z |
| C1 | done | MotionRoot gsap.context + kill on route; admin skip; reveal on cart/contact/book/pdp; frost threshold by path | 2026-07-19T10:25:00Z |
| C2 | done | reduced-motion: no js-motion hide; hero poster-only; no pointer specular; CSS kills ambient/sweep/video; MQ live toggle | 2026-07-19T10:55:00Z |
| C3 | done | cut bounce lifts + ambient/iridescent loops; keep sweep/specular/reveals; static orbs for glass; softer route fade | 2026-07-19T11:25:00Z |
| D1 | done | product links /shop/[id]; services from lib/services; empty states; home+root OG/twitter metadata | 2026-07-19T11:55:00Z |
| D2 | done | shop server store; hide discontinued; OOS badges; empty filter + empty catalog; category counts; force-dynamic | 2026-07-19T12:25:00Z |
| D3 | done | variant required (no preselect); related strip; /api/events + product_view tracker; OOS/discontinued PDP; server product | 2026-07-19T12:55:00Z |
| D4 | done | cart qty 0/max20; sanitize missing SKUs; free-ship progress; promo clear; Stripe session_id confirm + clear bag | 2026-07-19T13:25:00Z |
| D5 | done | brand-voice copy on about/services/studio/membership/contact + footer; facts still OPEN_ITEMS | 2026-07-19T13:55:00Z |
| D6 | done | invalid ?service= notice; double-submit guard; funnel events; deposit placeholder; past slots filtered; dup booking | 2026-07-19T14:25:00Z |
| E1 | done | checkout validateAndPriceItems; unknown SKU/OOS reject; catalog re-price; Idempotency-Key; error code shapes | 2026-07-19T14:55:00Z |
| E2 | done | node:test shipping matrix — $7/<$49, free@$49, pre vs post basis, promo×ship; npm test 18 pass | 2026-07-19T16:50:00Z |
| E3 | done | resolveDiscountCode pure + tests: %/fixed/expired/max_uses/inactive/case; npm test 39 pass | 2026-07-19T17:20:00Z |
| E4 | done | Stripe webhook /api/webhooks/stripe; full session metadata; markOrderPaidFromSession; docs/STRIPE.md mock path | 2026-07-19T17:50:00Z |
| E5 | done | order-path offline tests + scripts/smoke-checkout.mjs; docs/ORDER_PATH.md; npm test 43 pass | 2026-07-19T18:20:00Z |
| F1 | done | lib/booking validate: service/past/slot_taken/sanitize; atomic insert; booking tests 14; npm test 57 | 2026-07-19T18:50:00Z |
| F2 | done | lib/availability.js Mock+Google stub; GET /api/availability; BookingFlow loads API; excludeBookedSlots; tests; npm test 65 | 2026-07-19T19:20:00Z |
| F3 | done | status machine confirmed→completed/cancelled/no_show; terminal locked; admin PATCH validates; UI options; tests; npm test 78 | 2026-07-19T19:25:00Z |
| G1 | done | prod rejects default password/secret; login audit fail+success; logout clears cookie+audit; middleware gate; safe ?next=; policy tests; npm test 89 | 2026-07-19T19:40:00Z |
| G2 | done | product-admin validate+retail×2; active flag; stock/active PATCH toggle; delete confirm; shop isShopVisible; tests; npm test 101 | 2026-07-19T19:55:00Z |
| G3 | done | order status filter chips; validate status; submitted_to_skin_script timestamp; line-item SKU/unit; tests; npm test 106 | 2026-07-19T20:10:00Z |
| G4 | done | discounts create/edit/deactivate; referrer id + redemptions visible; code/value validation; expires field | 2026-07-19T20:25:00Z |
| G5 | done | lib/csv-import parse+bad rows; dry-run API; sample-import.csv e2e tests; CsvImport dry-run UI; npm test 110 | 2026-07-19T20:40:00Z |
| G6 | done | analytics date range filter (from/to); empty states; counts from store events/orders only | 2026-07-19T20:50:00Z |
| G7 | done | admin tables/cards dual layout; empty states; form error messages; loading disabled buttons | 2026-07-19T20:55:00Z |
| H1 | done | atomic write temp+rename; corrupt JSON → .corrupt backup + re-seed; seed only if missing | 2026-07-19T21:00:00Z |
| H2 | done | data/SCHEMA.md Products/Orders/Appointments/DiscountCodes/Admins/AuditLog/Events | 2026-07-19T21:00:00Z |
| H3 | done | STORE_API surface documented; call sites use readStore/mutateStore/audit/trackEvent only | 2026-07-19T21:00:00Z |
| H4 | done | shop force-dynamic + getProducts from server store (admin edits visible) | 2026-07-19T21:00:00Z |
| I1 | done | POST /api/events allowlisted funnel types | 2026-07-19T21:00:00Z |
| I2 | done | shop/cart/book UI fires product_view, cart, booking funnel events | 2026-07-19T21:00:00Z |
| I3 | done | lib/log.js structured JSON + PII redact; book route uses logInfo/logWarn | 2026-07-19T21:00:00Z |
| J1 | done | metadata + OG on major routes (shop/book/about/etc.); unique titles | 2026-07-19T21:00:00Z |
| J2 | done | robots.js: allow storefront, disallow /admin /api | 2026-07-19T21:00:00Z |
| J3 | done | sitemap.js public routes | 2026-07-19T21:00:00Z |
| J4 | done | app/not-found.jsx brand 404 | 2026-07-19T21:00:00Z |
| K1 | done | next/font already; logo assets documented; no giant unused deps | 2026-07-19T21:00:00Z |
| K2 | done | hero poster + muted playsInline; reduced-motion prefers poster (C2) | 2026-07-19T21:00:00Z |
| K3 | done | store/fs server-only; client uses product-admin/csv pure helpers only | 2026-07-19T21:00:00Z |
| L1 | done | npm test; smoke; smoke:routes; smoke:all | 2026-07-19T21:00:00Z |
| L2 | done | node:test suite 113 pass — no heavy framework | 2026-07-19T21:00:00Z |
| L3 | done | Manual QA checklist in POLISH_REPORT.md | 2026-07-19T21:00:00Z |
| M1 | done | README: run, admin, env, mock vs Stripe, CSV import, smoke scripts | 2026-07-19T21:00:00Z |
| M2 | done | OPEN_ITEMS: engineering closed noted; business decisions preserved | 2026-07-19T21:00:00Z |
| M3 | done | ENV.md with Stripe, admin, Google Calendar stubs | 2026-07-19T21:00:00Z |
| N1 | done | npm run build clean — 44 routes, compiled successfully | 2026-07-19T21:05:00Z |
| N2 | done | smoke-routes: / /shop /cart /book /admin/login /services /contact all 200 | 2026-07-19T21:05:00Z |
| N3 | done | POLISH_REPORT.md written | 2026-07-19T21:10:00Z |
| N4 | done | Final commit overnight polish | 2026-07-19T21:10:00Z |
| O1 | done | Lighthouse baseline home/shop/PDP — docs/lighthouse + OPTIMIZATION_REPORT | 2026-07-20T00:45:00Z |
| O2 | done | next/image: Wordmark, Hero poster, ProductImage; single hero video; GSAP dynamic import | 2026-07-20T00:40:00Z |
| O3 | done | next.config images avif/webp, compress, security + cache headers | 2026-07-20T00:40:00Z |
| O4 | done | shop/home/PDP revalidate=60; revalidateProductSurfaces on admin product writes | 2026-07-20T00:35:00Z |
| O5 | done | images[] schema + admin URL; category SVG placeholders; productImageSrc | 2026-07-20T00:40:00Z |
| O6 | done | OpenNext R2+DO queue+D1 tag cache config; public/_headers; docs/EDGE_CACHE.md | 2026-07-20T00:35:00Z |
| P1 | done | Hero motion refresh: new `generated_video (1).mp4` → hero-original; ping-pong extend ~20s silent hero.mp4; poster webp | 2026-07-21T23:14:00Z |
| Q1 | done | Skin Script product images package: 8× PNG+WebP 832×1232 → public/images/products/skin-script; products.json wired; ProductImage 52/77; cart thumbs; product-image tests; deploy dewtheoryco.com | 2026-07-24T16:10:00Z |

Status values: pending | in_progress | done | blocked | skipped
