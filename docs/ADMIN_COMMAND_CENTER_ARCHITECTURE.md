# Admin Command Center Architecture

Owner-only operational control plane for Emily (`/admin`).

## Access control

- **Owner identity:** `ADMIN_OWNER_EMAIL` (preferred) or `ADMIN_EMAIL` must match the logged-in admin row email exactly.
- **Role:** `owner`, `admin`, or `superadmin` on the `Admins` store row.
- **No fallback:** Non-owner admin rows and malformed sessions fail closed (`lib/admin-auth.js`, `lib/admin-auth-policy.js`).
- **TOTP:** `ADMIN_REQUIRE_TOTP=true` or `ADMIN_TOTP_SECRET` when mandatory (`lib/totp.js`).
- **API:** `/api/admin/*` uses `requireAdminApi` (session + same-origin for mutations).

## Data authority

| Domain | Source |
|--------|--------|
| Paid shop orders / fulfillment / supplier mappings / webhook event mirror | **D1** commerce (`lib/commerce` → `DEW_THEORY_D1`; file backend fallback for local) |
| Pending Stripe checkout (`pending_payment`) | **Was** `lib/store.js` gap (ephemeral / multi-isolate unsafe). **SuperGrok Wave 2** fixes to durable D1 pending persist (`persistPendingCheckoutOrder`) — **code on branch** `cursor/supergrok-wave0-durable-orders-e021`; not claimed production-deployed until merge + deploy + verify |
| Catalog seed | `data/products.json` (admin runtime product edits may also use file store) |
| Fulfillment jobs / attempts | D1 commerce |
| Audit log (commerce ops) | D1 commerce |
| Shop funnel events | File store `events` (`lib/store.js`) |
| Consultations / appointments | `lib/store.js` — **ephemeral risk** on Workers (isolate-local / non-durable unless separately persisted) |
| Email log | File store `outbound_emails` |
| Stripe health | Live read-only Stripe API + env presence |
| RPA health | Server-side probe to configured RPA URL (`/health`, `/ready`) |
| Deployment SHA | Runtime env when exposed |

## Admin data layer

`lib/admin/` centralizes metrics and health:

- `metrics.js` — commerce KPIs, mapping coverage, commerce health
- `stripe-health.js` — Stripe probe (no secrets returned)
- `rpa-health.js` — RPA probe with URL allowlist (no SSRF from query params)
- `attention.js` — attention queue assembly
- `dashboard.js` — command center aggregation
- `status.js` — shared status constants
- `date-range.js` — time window parsing

## Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Command center overview |
| `/admin/orders` | Order list (commerce + legacy merge) |
| `/admin/orders/[id]` | Order detail + fulfillment timeline |
| `/admin/fulfillment` | Fulfillment job operations |
| `/admin/integrations` | Stripe, RPA, email, calendar panels |
| `/admin/system` | Commerce + runtime + audit log |
| `/admin/analytics` | Revenue (commerce) + events (file store) |

## UI shell

- `components/admin/AdminShell.jsx` — responsive nav (`AdminNav.jsx`), owner header
- `components/admin/AdminPageHeader.jsx` — page title + automation mode banner
- Shared: `MetricCard`, `ConnectionPanel`, `SystemStatusBadge`

## Security notes

- Admin excluded from sitemap; `robots: noindex` on admin layout metadata.
- Health probes use server-only env URLs; responses sanitized before HTML.
- Never expose secrets, RPA HMAC, session cookies, or card data in admin UI.
