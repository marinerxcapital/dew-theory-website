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
