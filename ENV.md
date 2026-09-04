# Copy to .env.local

# Stripe — leave empty for mock checkout (orders paid immediately, no redirect)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Public site URL for Stripe success/cancel redirects + Open Graph
# Local:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Production (Cloudflare — dewtheoryco.com on MarinerX Capital):
NEXT_PUBLIC_SITE_URL=https://dewtheoryco.com

# Admin portal (production: must set all three; default password rejected)
ADMIN_EMAIL=admin@dewtheory.local
ADMIN_PASSWORD=dew-admin-dev
# Owner-only admin (Emily) — login email must match this exactly in production
ADMIN_OWNER_EMAIL=
ADMIN_SESSION_SECRET=change-me-to-a-long-random-string
# ADMIN_REQUIRE_TOTP=true

# Google Calendar (optional — freebusy + event create when all four set)
# GOOGLE_CALENDAR_ID=
# GOOGLE_CALENDAR_CLIENT_ID=
# GOOGLE_CALENDAR_CLIENT_SECRET=
# GOOGLE_CALENDAR_REFRESH_TOKEN=
# Optional tuning:
# GOOGLE_CALENDAR_HOURS=10,11,13,14,15,16
# GOOGLE_CALENDAR_CLOSED_DAYS=0
# GOOGLE_CALENDAR_DAYS_AHEAD=14
# GOOGLE_CALENDAR_SLOT_MINUTES=60

# Booking policy display (optional — shown on services / emails when set)
# BOOKING_DEPOSIT_PERCENT=25
# BOOKING_CANCEL_HOURS=24

# Admin 2FA (optional base32 secret for TOTP authenticator apps)
# ADMIN_TOTP_SECRET=

# Membership package prices (optional JSON array). Without this, packages show “Price set by Emily”
# MEMBERSHIP_PACKAGES_JSON=[{"id":"rhythm-care","name":"Rhythm of care","description":"…","price_cents":null,"interval":null,"perks":[]}]

# ── Skin Script catalog + dropship (see docs/SKIN_SCRIPT_SYNC.md) ──
# mock = offline (default). http = partner API. csv_feed = authorized export. rpa = Playwright service.
SKIN_SCRIPT_MODE=mock
SKIN_SCRIPT_API_BASE=
SKIN_SCRIPT_API_KEY=
SKIN_SCRIPT_ACCOUNT_ID=
SKIN_SCRIPT_FEED_URL=
# RPA production fulfillment (see docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md)
SKIN_SCRIPT_RPA_ENABLED=false
SKIN_SCRIPT_RPA_SERVICE_URL=
SKIN_SCRIPT_RPA_HMAC_SECRET=
SKIN_SCRIPT_PORTAL_BASE_URL=
SKIN_SCRIPT_LOGIN_URL=
# Login entry: https://skinscriptrx.com/my-account/ (redirects to skinscript.com session)
SKIN_SCRIPT_USERNAME=
SKIN_SCRIPT_PASSWORD=
SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME=
SKIN_SCRIPT_DRY_RUN=true
SKIN_SCRIPT_MAX_ORDER_TOTAL_CENTS=50000
SKIN_SCRIPT_MAX_LINE_QUANTITY=6
SKIN_SCRIPT_PRICE_TOLERANCE_PERCENT=5
FULFILLMENT_ALERT_WEBHOOK_URL=
FULFILLMENT_MAX_ATTEMPTS=3
# Durable commerce store: D1 on Workers (DEW_THEORY_D1 binding), file locally
# STORE_BACKEND=file
# Auto-submit paid orders to supplier adapter (default true for mock; false on production Worker)
AUTO_FULFILL=true
# Cron: POST /api/cron/catalog-sync with Authorization: Bearer $CRON_SECRET
CRON_SECRET=

# ── xAI assist (optional — mapping / error classification only) ──
XAI_API_KEY=
XAI_MODEL=grok-3
# XAI_API_BASE=https://api.x.ai/v1

# ── Virtual consultation ──
# Owner go-live (Worker secrets / Dashboard) — factual checklist:
#   1. STRIPE_VIRTUAL_CONSULTATION_PRICE_ID — Stripe Price ID (authoritative amount; never hardcode in UI)
#   2. CONSULTATION_SCHEDULING_URL — external scheduler that mints unique Zoom meetings
#   3. RESEND_API_KEY (+ verified EMAIL_FROM) — without key, emails log to store only
# Stripe Price ID for the virtual consultation (authoritative price — do not hardcode in UI)
STRIPE_VIRTUAL_CONSULTATION_PRICE_ID=
# Admin notification recipient (defaults to ADMIN_EMAIL)
CONSULTATION_ADMIN_EMAIL=
# External scheduler that creates unique Zoom meetings (Calendly, Acuity, etc.)
CONSULTATION_SCHEDULING_URL=
CONSULTATION_SCHEDULER_PROVIDER=external
CONSULTATION_TIMEZONE=America/Chicago
# Optional display-only cents when Stripe not configured (mock checkout only)
# CONSULTATION_DISPLAY_PRICE_CENTS=9500
# CONSULTATION_DURATION_MINUTES=45
# CONSULTATION_PHOTO_MAX_BYTES=10485760
# Mock VC checkout: allowed only when STRIPE_SECRET_KEY is unset AND
# (NODE_ENV !== production OR ALLOW_MOCK_CHECKOUT=true). Success UI discloses mock.
# ALLOW_MOCK_CHECKOUT=true
# Transactional email (optional — without RESEND_API_KEY emails are logged to store)
# RESEND_API_KEY=
# EMAIL_FROM=Dew Theory <noreply@dewtheoryco.com>
# EMAIL_REPLY_TO=
#
# Private consultation photo storage (Workers):
# Wrangler R2 binding CONSULTATION_PHOTOS_R2 → bucket dew-theory-consultation-photos
# (see wrangler.jsonc). Not an env secret — it is a Worker binding.
# Create the bucket once (see docs/DEPLOY_DEWTHEORYCO.md). Until the binding is
# live, code falls back to local FS (dev) or in-memory Map (Workers read-only FS).
# No public URLs; access only via authorized admin/intake routes.
# CONSULTATION_PHOTOS_R2  (binding name — not process.env; listed here for ops)
