-- Stripe catalog mappings (no secrets). One Dew product_id → current Stripe Product/Price.
CREATE TABLE IF NOT EXISTS stripe_catalog_mappings (
  product_id TEXT PRIMARY KEY,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  unit_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  skin_script_sku TEXT,
  stripe_mode TEXT NOT NULL CHECK (stripe_mode IN ('test', 'live')),
  active INTEGER NOT NULL DEFAULT 1,
  synced_at TEXT,
  catalog_hash TEXT,
  pricing_policy_hash TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_stripe_catalog_mode_active
  ON stripe_catalog_mappings (stripe_mode, active);
