# DEW THEORY — Build Prompt Addendum A
**Attach alongside:** the original `DEW_THEORY_BUILD_PROMPT.md`, `data/products.json`, and `OPEN_ITEMS.md`.

This addendum does not replace the original brief — it extends it with real product data and three
new subsystems: pricing/shipping logic, an admin portal, and a Skin Script catalog pipeline. Section
numbers below are new sections, inserted logically after their counterparts in the original document.
Follow the original brief's Section 0 operating instructions (plan before code, checkpoint per page,
flag rather than guess) for everything in this addendum too.

---

## Section 5A — Pricing, Discounts, and Shipping (extends Section 5)

**Catalog.** Use `data/products.json` as the source of truth for the initial eight products. Import
it directly into the `Products` table rather than re-keying it — the file is already shaped to match
Section 9's data model, with one addition (see 9A below).

**Pricing rule.** Retail price = wholesale price × 2. This is confirmed by the client for 7 of 8
products; the 8th (Sheer Protection SPF) had no retail figure in the source document and was computed
with the same formula. Do not discount the displayed sticker price. The retail price on the product
page is always wholesale × 2 — discounts are a promo code applied at checkout, not a lower sticker
price. This preserves both the "double wholesale" instruction and the client's separate request for a
launch/referral discount, without the two colliding.

**Discount codes.** Build on Stripe's native Coupons + Promotion Codes rather than a custom discount
engine — the site already uses Stripe Checkout, and this gets redemption analytics for free in the
Stripe dashboard instead of building a second one.
- One percentage-off launch code (e.g. `DEW15`), client to set the percentage.
- Support additional referral-style codes, each attributable to a referrer. Use Stripe promotion code
  `metadata` to tag a `referrer_customer_id`; surface redemptions per code in the admin analytics
  described in Section 15.
- **Open item:** exact discount percentage/amount and whether referral codes pay out anything to the
  referrer (store credit? nothing, just tracking?) — not specified by the client. Build the mechanism;
  leave the numbers as an admin-configurable setting, not a hardcoded value.

**Shipping.** Flat $7 shipping fee, waived at $49+ order subtotal. This is a confirmed business rule,
not a placeholder.
- Apply the free-shipping threshold against the **pre-discount** subtotal. Rationale: comparing against
  the post-discount total would let a promo code push an order under $49 back into paid shipping, or
  push a sub-$49 order over the free threshold in a way the client likely didn't intend. This is a
  recommendation, not a confirmed decision — flag it in `OPEN_ITEMS.md` and make the comparison basis
  a named constant (`SHIPPING_THRESHOLD_BASIS`) so it's a one-line change if the client wants the
  opposite.
- `Orders` needs a `shipping_fee` column (see 9A) so this is visible on every order record, not just
  computed at checkout time and discarded.

---

## Section 9A — Data Model Additions (extends Section 9)

Add to the original data model:

- **Products** — add `category` (enum: Cleanser, Exfoliant, Mask, Moisturizer, Serum, Lip Treatment,
  SPF, Toner), `wholesale_price`, `retail_price`, `sku`, `variants` (nullable array, e.g. lip
  treatment's Peppermint/Pomegranate), `active_ingredients` (array of `{name, function}`),
  `how_to_use` (text), `skin_types` (array), `conditions_addressed` (array), `source`
  (enum: `manual` | `csv_import` | `sync`, default `manual`), `skin_script_sku` (nullable text,
  reserved for a future live sync — see Section 16).
- **Orders** — add `subtotal`, `shipping_fee`, `discount_code_id` (nullable FK), `total`.
- **DiscountCodes** — `id`, `code`, `type` (`percentage` | `fixed`), `value`, `referrer_customer_id`
  (nullable FK to Customers), `max_uses` (nullable), `uses_count`, `expires_at` (nullable), `active`.
  Mirrors a Stripe Promotion Code; store the Stripe ID alongside for reconciliation.
- **Admins** — `id`, `name`, `email`, `role` (`owner` | `staff`), `auth_id` (FK to the auth provider's
  user record — do not store passwords directly), `created_at`. Distinct from `Customers`. A customer
  account must never implicitly have admin rights.
- **AuditLog** — `id`, `admin_id`, `action` (e.g. `product.update`, `discount.create`), `entity`,
  `entity_id`, `diff` (jsonb, before/after), `created_at`. Every mutation made through the admin portal
  writes one row here. This is the only place "who changed the price on X" can be answered later.

---

## Section 14 — Admin Portal

A separate, authenticated area at `/admin`, entirely distinct from the customer-facing site in Section
4. Nothing in `/admin` is reachable by a signed-in customer account — admin status is a property of the
`Admins` table, not a flag on `Customers`.

**14.1 — Authentication**
- Supabase Auth, with `/admin` routes gated server-side by a check against the `Admins` table — never
  a client-side-only check, since that can be bypassed by anyone who can read the JS bundle.
- Session via httpOnly, secure cookies. No admin token or secret ever reaches client-exposed code.
- Rate-limit login attempts. Recommend optional TOTP two-factor for admin accounts specifically, since
  this portal can create discount codes and touch pricing — flag as an open item if the client wants
  to defer it past initial launch.
- Every successful and failed admin login writes an `AuditLog` row.

**14.2 — Product management**
- Full CRUD on `Products`, matching the schema in 9A.
- This is also where Section 16's catalog import tool lives (see below) — "add a product" and "import
  products from Skin Script" are two entry points into the same underlying create/update logic, not
  two separate code paths that can drift apart.
- Stock status toggle (in stock / out of stock / discontinued) — there's no live inventory feed per
  the original brief's Section 5, so this is manually maintained.

**14.3 — Order and appointment queue**
- List view of recent orders and appointments, filterable by status.
- Order detail: line items, shipping address, discount code applied (if any), fulfillment status.
  Marking an order "submitted to Skin Script" is a manual status change here, consistent with the
  manual-fulfillment model in the original Section 5 — do not build this as if it triggers a real
  vendor order automatically.

**14.4 — Discount code management**
- Create/edit/deactivate `DiscountCodes`, backed by Stripe Promotion Codes underneath.
- Referral code creation should let an admin attach a `referrer_customer_id` and see that referrer's
  redemption count without leaving the page.

---

## Section 15 — Analytics Dashboard

Lives inside `/admin`. Pull from the site's own data first (Orders, Appointments, DiscountCodes) —
this does not depend on a third-party analytics provider to be useful on day one.

- **Revenue** — daily/weekly/monthly totals, average order value, order count. Simple time-series,
  not a forecasting tool.
- **Product performance** — units and revenue by product, and rolled up by category, so "how did
  Exfoliants do this month" is answerable without cross-referencing eight rows by hand.
- **Service/appointment utilization** — bookings by service, cancellation rate, no-show rate (if
  tracked — depends on whether Section 6's booking flow records no-shows, which is itself still an
  open item in the original brief).
- **Discount code performance** — redemptions and attributed revenue per code, with referral codes
  broken out so a referrer's impact is visible at a glance.
- **Funnel, shop side** — product page view → add to cart → checkout started → checkout completed.
- **Funnel, booking side** — booking flow started → service selected → time selected → confirmed.

**Traffic source / visitor analytics** (where visitors come from, page views outside of the funnels
above) needs a provider — this wasn't specified in either the original brief or this addendum.
Recommend Vercel Analytics (zero extra infrastructure on a Vercel deploy) as a default, but flag it in
`OPEN_ITEMS.md` as the client's call, not a made decision.

---

## Section 16 — Skin Script Catalog Pipeline

The client asked for "an easy way for Skin Script products to be deployed on the website" and,
ideally, automatic pulling. Here is what's actually buildable versus what depends on information the
client doesn't have yet.

**16.1 — Build this now: CSV/manual import (primary path)**
- An admin-portal screen: upload a CSV (columns: name, category, size, wholesale_price, description,
  ingredients — whatever a staff member can export from wherever they currently track wholesale
  costs) and map columns to the `Products` schema in 9A.
- On import, `retail_price` auto-computes at wholesale × 2 per Section 5A, editable per row before
  confirming.
- Also support single-product manual entry through the same form used for CSV row review, so this
  works even before any CSV exists.
- This path has no external dependency and should be fully functional at launch.

**16.2 — Conditional: automatic sync (do not build against assumptions)**
"Pull products from Skin Script automatically" requires Skin Script to expose *something* to pull
from — a partner API, an EDI/dropship feed, or at minimum a structured export. **No such integration
is confirmed to exist.** Do not build against an assumed Skin Script API; there is no evidence one
exists, and inventing endpoint names or auth flows would put fabricated integration code into a real
business's codebase.

Correct next step, for the client rather than the build team: ask the Skin Script wholesale rep
whether they offer any of the following, in order of how buildable each is —
1. A CSV/Excel export from their wholesale ordering portal (most common in this industry) — if so,
   16.1 already handles it, no new code needed.
2. A vendor API or webhook (less common for boutique skincare suppliers, but worth asking).
3. Nothing formal — in which case 16.1 is the permanent path, not a stopgap.

**Do not scrape skinscriptrx.com or any Skin Script retail/wholesale portal without their explicit
authorization.** Unauthorized scraping of a supplier's site would likely violate their terms of
service, and is not an appropriate substitute for either of the two paths above.

**16.3 — If a real integration is later confirmed**
Design the `Products.source` and `Products.skin_script_sku` fields from 9A now, even though nothing
populates them yet, so a sync job can be added later as an additive adapter rather than a schema
migration. This is the only piece of "build for a future API" that belongs in the codebase today — a
nullable column, not a fetch call to an endpoint that doesn't exist.

---

## Definition of Done — additions to Section 12

- [ ] `data/products.json` is imported into `Products`; all eight items display with their real
      category, price, active ingredients, and usage instructions
- [ ] Retail prices equal wholesale × 2 sitewide; no product displays a pre-discounted sticker price
- [ ] Shipping calculates correctly: $7 flat, waived at $49+ subtotal, visible as a line item at checkout
- [ ] At least one working Stripe promotion code (the launch code) applies at checkout in test mode
- [ ] `/admin` is unreachable without a row in `Admins` — verified by attempting access with a
      logged-in customer account that has no admin row
- [ ] Every product create/edit and discount code create/edit writes an `AuditLog` row
- [ ] CSV import successfully creates products from a sample file with the columns listed in 16.1
- [ ] Analytics dashboard renders real numbers from at least one seeded test order and one seeded
      test appointment — not static mock data left in the UI
