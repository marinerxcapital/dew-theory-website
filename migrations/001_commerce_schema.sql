-- Dew Theory commerce + fulfillment durable schema (Cloudflare D1)
-- Apply: wrangler d1 execute dew-theory-commerce --file=migrations/001_commerce_schema.sql

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session
  ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_pi
  ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS fulfillment_jobs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  supplier TEXT NOT NULL DEFAULT 'skin_script',
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_attempt_at TEXT,
  locked_at TEXT,
  locked_by TEXT,
  started_at TEXT,
  completed_at TEXT,
  error_code TEXT,
  error_message TEXT,
  supplier_order_id TEXT,
  idempotency_key TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(order_id, supplier)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillment_idempotency
  ON fulfillment_jobs(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_fulfillment_status_next
  ON fulfillment_jobs(status, next_attempt_at);

CREATE TABLE IF NOT EXISTS fulfillment_attempts (
  id TEXT PRIMARY KEY,
  fulfillment_job_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  stage TEXT,
  result TEXT,
  error_code TEXT,
  error_summary TEXT,
  supplier_order_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_attempts_job
  ON fulfillment_attempts(fulfillment_job_id);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  payload TEXT,
  at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_mappings (
  product_id TEXT PRIMARY KEY,
  skin_script_sku TEXT NOT NULL,
  supplier_product_url TEXT,
  supplier_product_name TEXT,
  supplier_size TEXT,
  variant TEXT,
  expected_wholesale_price REAL,
  verified INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  fulfillment_job_id TEXT,
  supplier_order_id TEXT,
  event_type TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_supplier_events_order
  ON supplier_order_events(order_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hmac_nonces (
  nonce TEXT PRIMARY KEY,
  seen_at TEXT NOT NULL
);
