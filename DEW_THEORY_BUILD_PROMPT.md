# DEW THEORY — Full Website Build Prompt
**Attach with this prompt:** the Dew Theory logo file (liquid-chrome wordmark) — provided in
`/public/logo.png` and `/public/logo.webp` in this package.

**Companion documents in this package — read all three together:**
- `DEW_THEORY_BUILD_PROMPT_ADDENDUM.md` — pricing/shipping, admin portal, analytics, Skin Script sync
- `data/products.json` — the real 8-product catalog
- `OPEN_ITEMS.md` — everything invented, assumed, or blocked; check before treating anything as fact

---

## 0. Operating Instructions

You are building a complete, production-quality, motion-first website for Dew Theory — not a template,
not a starter kit. Plan before you code, work in stages, and check your own work against this brief
before calling anything done.

Work in this order:
1. **Derive the design system from the attached logo first.** Do not invent a palette independently —
   extract it (see Section 2). A working extraction already exists in this package's `app/globals.css`
   and `tailwind.config.js` — reuse it rather than re-deriving from scratch.
2. **Plan the full information architecture** (Section 4) before writing any component.
3. **Build page-by-page**, starting with Home — already built in this package as a checkpoint. After
   each subsequent page, take a screenshot and check it against Section 2's design tokens and Section
   7's motion spec before moving to the next page.
4. **Respect `prefers-reduced-motion`** everywhere motion is specified — the reduced state is already
   implemented in `app/globals.css` and `components/MotionRoot.jsx`; extend that pattern, don't build a
   second one.
5. Flag every place you had to invent content or made an assumption, in `OPEN_ITEMS.md` (already
   started in this package — add to it, don't replace it), rather than silently inventing business
   facts (pricing, policies, addresses). Placeholder *visual* content (stock photography, filler
   product shots) is fine and expected; placeholder *business* facts are not.
6. If a stage feels too large to complete reliably in one pass, say so and propose a smaller next step.

Do not default to generic AI-generated design patterns: no warm-cream-and-terracotta SaaS template, no
near-black-with-neon-accent template, no interchangeable Inter-font-plus-gradient-button aesthetic.

---

## 1. Business Overview

Dew Theory is a skincare brand with two integrated revenue lines on one site:

1. **Retail** — Skin Script skincare products, fulfilled manually (see Addendum Section 16 for the
   catalog pipeline — CSV/manual import is the confirmed buildable path; automatic vendor sync is
   conditional on Skin Script confirming they offer one).
2. **Services** — in-studio appointments with licensed aesthetician **Emily Mitchener**, booked
   directly through the site.

The site must sell products *and* convert visitors into booked appointments — equally weighted goals.

---

## 2. Visual Identity — "Liquid Chrome"

Already extracted and implemented in this package via k-means clustering on the logo artwork:

| Token | Hex | Role |
|---|---|---|
| `pearl` | `#F4F6F7` | Ground |
| `ivory` | `#F1ECE6` | Warm alternate band |
| `chrome` | `#828F9A` | Mercury mid-tone: labels, rules |
| `graphite` | `#2D2F3A` | Headlines, primary CTA |
| `ice` | `#C4DAE9` | Cool highlight |
| `lavender` | `#CECDE1` | Opal highlight |
| `blush` | `#DEC2CF` | Warm highlight |
| `charcoal` | `#24262C` | Body text only |

Type: Bodoni Moda (display), Jost 300 tracked to `0.34em` (labels), Karla 300 (body). No pure black,
no pure white, no saturated color.

**Known gap, flagged by self-review, not yet fixed in this package:** the glass surfaces
(`.glass-1`/`.glass-2` in `app/globals.css`) are currently translucent panels over a flat background —
there isn't enough visual content behind them for the blur to actually refract anything, so "very
glassy" per the original brief isn't fully delivered yet. Worth revisiting once real product/studio
photography exists to blur against.

Full rationale and every other token in `app/globals.css`, `tailwind.config.js`, and `README.md`.

---

## 3. Technical Stack

- **Framework:** Next.js (already scaffolded in this package, App Router)
- **Styling:** Tailwind CSS, custom tokens (already configured)
- **Animation:** GSAP + ScrollTrigger (already wired via `components/MotionRoot.jsx`)
- **Backend/data:** Supabase — not yet connected in this package; schema in Section 9 + Addendum 9A
- **Payments:** Stripe Checkout — not yet connected; see Addendum Section 5A for discount code approach
- **Booking:** Google Calendar sync for Emily's availability + automated confirmation emails/SMS
- **Hosting:** Vercel (this package builds clean with `npm run build`)

Push all files to the GitHub repository `marinerxcapital/dew-theory-website` (private, `main` branch).
Commit incrementally per checkpoint, not one final dump.

---

## 4. Site Architecture

| Page | Status in this package | Core job |
|---|---|---|
| **Home** | Built | Brand thesis, hero motion moment, entry points into Shop and Book Now |
| **Shop** | Styled stub | Browse Skin Script products by category, filter, add to cart |
| **Product Detail** | Not started | Single product — imagery, description, ingredients, price, add to cart |
| **Cart / Checkout** | Styled stub | Review, Stripe checkout, order confirmation |
| **About Emily** | Styled stub | Emily Mitchener's bio, credentials, philosophy |
| **Services** | Styled stub | Full service/treatment menu with pricing and durations |
| **Book Now** | Styled stub | Calendar-based appointment booking flow |
| **Studio** | Styled stub | Location, hours, photos of the space |
| **Membership** | Styled stub | Membership value prop, tiers, sign-up — Open Item, build page, don't invent terms |
| **Contact** | Styled stub | Form + studio contact details |
| **Admin Portal** | Not started — spec only | See Addendum Section 14 |
| **Analytics Dashboard** | Not started — spec only | See Addendum Section 15 |

The nav and cart/booking-drawer are glass-panel elements present on every page (already built for nav).

---

## 5. E-Commerce / Dropship Functional Spec

See Addendum Section 5A for pricing, discount codes, and shipping — this section covers the rest.

- Product catalog: name, category, price, description, ingredient list, images, stock status —
  schema in Section 9, extended in Addendum 9A. Real data in `data/products.json`.
- Cart: persistent across session, editable quantities, subtotal calculation.
- Checkout: Stripe-powered, collects shipping address, sends order confirmation email.
- **Fulfillment model:** manual. Orders generate an internal admin notification for manual submission
  to Skin Script (see Addendum Section 16 for the catalog side of this — importing products is
  separate from submitting orders).
- No customer-facing promise of real-time shipment tracking.

---

## 6. Booking System Functional Spec

- Service menu pulled from the Services page data (name, price, duration) — still placeholder data,
  see `OPEN_ITEMS.md`.
- Calendar view reflecting Emily's real availability via Google Calendar sync.
- Booking flow: select service → select time → enter contact info → confirm.
- Automated confirmation (email at minimum, SMS if feasible) and a reminder notification.
- Cancellation/reschedule flow — deposit %/cutoff window is an Open Item; build the UI to support a
  policy without hardcoding unconfirmed numbers.

---

## 7. Motion & Interaction Specification

Already implemented in this package: pointer-tracked specular hero highlight, scroll reveals with
stagger, nav frosting on scroll, route cross-fade, and a full `prefers-reduced-motion` branch. Extend
this pattern to the remaining pages rather than building a second motion system.

**7.3 — Discipline.** No animation should exist that doesn't serve legibility, hierarchy, or the
brand's material language. If in doubt, cut it.

---

## 8. Content & Copy

Write real copy in Dew Theory's voice — warm, minimal, elevated, never salesy or exclamatory. Where
real business content doesn't exist yet, write placeholder copy clearly marked in `OPEN_ITEMS.md` that
still reads as finished prose. Product copy for the 8 catalog items is real — see `data/products.json`.

---

## 9. Minimum Data Model

Base model — see Addendum Section 9A for the admin/discount/audit additions.

- **Products** — id, name, category, price, description, ingredients, images[], stock_status
- **Orders** — id, customer_id, items[], total, status, shipping_address, created_at
- **Services** — id, name, price, duration_minutes, description
- **Appointments** — id, customer_id, service_id, start_time, status, calendar_event_id
- **Customers** — id, name, email, phone, created_at

---

## 10. Assets

**Provided, in `/public`:** `logo.png` / `logo.webp` (wordmark), `logo-mark.webp` (nav crop),
`hero.mp4` (web-optimized, 848×1072 portrait, ~20s silent ping-pong loop) /
`hero-original.mp4` (untouched source cut), `hero-poster.webp` (reduced-motion / LCP).
**Not yet provided:** product photography, studio photography, a photo of Emily Mitchener.

---

## 11. Open Items — Flag, Don't Guess

See `OPEN_ITEMS.md` in this package — it is the living version of this section, already populated
with everything resolved and everything still open as of this package's build.

---

## 12. Definition of Done

Base checklist — see Addendum for the admin/analytics/catalog additions.

- [ ] Every page in Section 4 exists, is linked, and is fully responsive down to mobile
- [ ] All files pushed to `marinerxcapital/dew-theory-website` on `main`, committed incrementally
- [ ] Design tokens from Section 2 are applied consistently sitewide
- [ ] Signature motion moment (7.1) is built and screenshotted for self-review
- [ ] Sitewide motion (7.2) is consistent and respects `prefers-reduced-motion`
- [ ] Checkout completes end-to-end in Stripe test mode
- [ ] Booking flow completes end-to-end against calendar availability
- [ ] Keyboard focus states are visible throughout
- [ ] `OPEN_ITEMS.md` lists every assumption or placeholder made during the build
- [ ] No lorem ipsum in visible copy

---

## 13. Deliverable

All code pushed to `marinerxcapital/dew-theory-website` on `main`. Provide the production-host preview
URL where checkout and booking can actually be tested. State clearly, in your final summary, which
sections above you followed exactly and which you had to interpret.
