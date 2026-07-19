# Polish Progress

Started: 2026-07-19T06:15:00Z
Mode: /loop
Interval: 30m

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
| F3 | pending | | |
| G1 | pending | | |
| G2 | pending | | |
| G3 | pending | | |
| G4 | pending | | |
| G5 | pending | | |
| G6 | pending | | |
| G7 | pending | | |
| H1 | pending | | |
| H2 | pending | | |
| H3 | pending | | |
| H4 | pending | | |
| I1 | pending | | |
| I2 | pending | | |
| I3 | pending | | |
| J1 | pending | | |
| J2 | pending | | |
| J3 | pending | | |
| J4 | pending | | |
| K1 | pending | | |
| K2 | pending | | |
| K3 | pending | | |
| L1 | pending | | |
| L2 | pending | | |
| L3 | pending | | |
| M1 | pending | | |
| M2 | pending | | |
| M3 | pending | | |
| N1 | pending | | |
| N2 | pending | | |
| N3 | pending | | |
| N4 | pending | | |

Status values: pending | in_progress | done | blocked | skipped
