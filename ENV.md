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
ADMIN_SESSION_SECRET=change-me-to-a-long-random-string

# Google Calendar (optional — booking uses mock slots until freebusy is implemented)
# GOOGLE_CALENDAR_ID=
# GOOGLE_CALENDAR_CLIENT_ID=
# GOOGLE_CALENDAR_CLIENT_SECRET=
# GOOGLE_CALENDAR_REFRESH_TOKEN=

# ── Skin Script catalog + dropship (see docs/SKIN_SCRIPT_SYNC.md) ──
# mock = offline (default). http = partner API when confirmed. csv_feed = authorized export URL/path.
SKIN_SCRIPT_MODE=mock
SKIN_SCRIPT_API_BASE=
SKIN_SCRIPT_API_KEY=
SKIN_SCRIPT_ACCOUNT_ID=
SKIN_SCRIPT_FEED_URL=
# Auto-submit paid orders to supplier adapter (default true; set false to disable)
AUTO_FULFILL=true
# Cron: POST /api/cron/catalog-sync with Authorization: Bearer $CRON_SECRET
CRON_SECRET=

# ── xAI assist (optional — mapping / error classification only) ──
XAI_API_KEY=
XAI_MODEL=grok-3
# XAI_API_BASE=https://api.x.ai/v1

# ── Virtual consultation ──
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
# Transactional email (optional — without RESEND_API_KEY emails are logged to store)
# RESEND_API_KEY=
# EMAIL_FROM=Dew Theory <noreply@dewtheoryco.com>
# EMAIL_REPLY_TO=

# ── Virtual consultation ──
# Stripe Price ID for the virtual consultation (authoritative price — do not hardcode in UI)
STRIPE_VIRTUAL_CONSULTATION_PRICE_ID=
CONSULTATION_ADMIN_EMAIL=
CONSULTATION_SCHEDULING_URL=
CONSULTATION_SCHEDULER_PROVIDER=external
CONSULTATION_TIMEZONE=America/Chicago
# CONSULTATION_DISPLAY_PRICE_CENTS=9500
# CONSULTATION_DURATION_MINUTES=45
# RESEND_API_KEY=
# EMAIL_FROM=Dew Theory <noreply@dewtheoryco.com>
# EMAIL_REPLY_TO=
