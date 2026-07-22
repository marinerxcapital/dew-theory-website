# Edge cache setup (Phase B) — OpenNext on Cloudflare

Dew Theory uses the **small-site** OpenNext Cloudflare caching profile:

| Component | Implementation | Binding |
| --- | --- | --- |
| Incremental cache | R2 | `NEXT_INC_CACHE_R2_BUCKET` |
| Revalidation queue | Durable Object (`DOQueueHandler`) | `NEXT_CACHE_DO_QUEUE` |
| Tag cache | D1 next-mode | `NEXT_TAG_CACHE_D1` |
| Self-reference | Worker service binding | `WORKER_SELF_REFERENCE` |

Configured in:

- [`open-next.config.ts`](../open-next.config.ts)
- [`wrangler.jsonc`](../wrangler.jsonc)
- [`public/_headers`](../public/_headers) (static asset CDN headers)

Docs: [OpenNext Cloudflare caching](https://opennext.js.org/cloudflare/caching)

---

## Prerequisites

1. Cloudflare account with Workers paid plan features as needed (R2 free tier is usually enough for small sites; Durable Objects require a paid Workers plan).
2. Logged in to Wrangler:

```bash
npx wrangler login
```

3. From the repo root (`dew-theory/`).

---

## 1. Create R2 bucket

```bash
npx wrangler r2 bucket create dew-theory-opennext-cache
```

`wrangler.jsonc` already points at this bucket name via `NEXT_INC_CACHE_R2_BUCKET`.

Optional prefix (defaults to `incremental-cache`):

```bash
# Only if you want a non-default key prefix
# Set in wrangler.jsonc under "vars":
# "NEXT_INC_CACHE_R2_PREFIX": "incremental-cache"
```

---

## 2. Create D1 database (tag cache)

```bash
npx wrangler d1 create dew-theory-tag-cache
```

Copy the returned **`database_id`** into `wrangler.jsonc`.

**Provisioned (MarinerX Capital):**

| Resource | Name / ID |
|----------|-----------|
| R2 | `dew-theory-opennext-cache` |
| D1 | `dew-theory-tag-cache` · `dc68ec21-ebc6-4800-9432-59357e3d6553` |
| Domain | `dewtheoryco.com` + `www` custom domains on Worker `dew-theory` |

```jsonc
"d1_databases": [
  {
    "binding": "NEXT_TAG_CACHE_D1",
    "database_name": "dew-theory-tag-cache",
    "database_id": "dc68ec21-ebc6-4800-9432-59357e3d6553"
  }
]
```

### Schema (`revalidations` table)

`opennextjs-cloudflare deploy` / `preview` run `populateCache`, which creates this table automatically. To create it manually (remote):

```bash
npx wrangler d1 execute NEXT_TAG_CACHE_D1 --remote --command "CREATE TABLE IF NOT EXISTS revalidations (tag TEXT NOT NULL, revalidatedAt INTEGER NOT NULL, stale INTEGER, expire INTEGER default NULL, UNIQUE(tag) ON CONFLICT REPLACE);"
```

Local preview:

```bash
npx wrangler d1 execute NEXT_TAG_CACHE_D1 --local --command "CREATE TABLE IF NOT EXISTS revalidations (tag TEXT NOT NULL, revalidatedAt INTEGER NOT NULL, stale INTEGER, expire INTEGER default NULL, UNIQUE(tag) ON CONFLICT REPLACE);"
```

---

## 3. Durable Object queue + migrations

No separate create command. Wrangler applies the migration in `wrangler.jsonc` on deploy/preview:

```jsonc
"durable_objects": {
  "bindings": [
    {
      "name": "NEXT_CACHE_DO_QUEUE",
      "class_name": "DOQueueHandler"
    }
  ]
},
"migrations": [
  {
    "tag": "v1",
    "new_sqlite_classes": ["DOQueueHandler"]
  }
]
```

`DOQueueHandler` is exported from the OpenNext worker build (`.open-next/worker.js`).

---

## 4. Build, preview, deploy

```bash
# Install (already includes @opennextjs/cloudflare + wrangler)
npm install

# Local production-like preview (builds + populateCache local + wrangler dev)
npm run preview

# Deploy to Cloudflare Workers (builds + populateCache remote + deploy)
npm run deploy
```

Equivalent explicit commands:

```bash
npx opennextjs-cloudflare build
npx opennextjs-cloudflare preview
npx opennextjs-cloudflare deploy
```

`deploy` / `preview` / `upload` populate the incremental cache and ensure the D1 tag table exists. Re-run on every deploy so build-time revalidation data stays current.

Manual cache populate (after build):

```bash
npx opennextjs-cloudflare populateCache local
npx opennextjs-cloudflare populateCache remote
```

---

## 5. Optional queue tuning (vars)

Add under `vars` in `wrangler.jsonc` if needed:

| Variable | Default | Meaning |
| --- | --- | --- |
| `NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION` | `5` | Max concurrent revalidations per DO instance |
| `NEXT_CACHE_DO_QUEUE_REVALIDATION_TIMEOUT_MS` | `10000` | Revalidation timeout |
| `NEXT_CACHE_DO_QUEUE_RETRY_INTERVAL_MS` | `2000` | Retry backoff base |
| `NEXT_CACHE_DO_QUEUE_MAX_RETRIES` | `6` | Max retry attempts |
| `NEXT_CACHE_DO_QUEUE_DISABLE_SQLITE` | — | Set `"true"` only if incremental cache is strongly consistent |

Debug Next/OpenNext cache:

```bash
# .env or .dev.vars
NEXT_PRIVATE_DEBUG_CACHE=1
```

---

## 6. Static asset headers

`public/_headers` sets long-lived immutable cache for `/_next/static/*` and public media/logo files. The worker does **not** run in front of Static Assets, so `next.config` headers do not apply to those paths.

---

## 7. Package notes

No extra npm packages are required beyond what is already installed:

- `@opennextjs/cloudflare` `^1.20.1` — ships R2 / DO queue / D1 overrides under `@opennextjs/cloudflare/overrides/*`
- `wrangler` `^4.112.0` — peer dependency (already in `devDependencies`)

Optional later upgrades (not enabled for Phase B):

- `withRegionalCache(r2IncrementalCache, { mode: "long-lived" })` for faster R2 reads
- `queueCache(doQueue, …)` under heavy ISR load
- `doShardedTagCache` + `BucketCachePurge` for large sites / automatic CDN purge (needs zone + API token secrets)

---

## 8. Auth / blockers checklist

| Step | Blocker |
| --- | --- |
| `wrangler login` | Requires interactive browser OAuth — do this locally |
| `r2 bucket create` | Needs account auth; R2 may need enabling in the dashboard |
| `d1 create` | Needs account auth; paste `database_id` into `wrangler.jsonc` before deploy |
| DO migrations | Require a **paid Workers plan** (Durable Objects) |
| `npm run deploy` | Fails if `database_id` is still `REPLACE_WITH_D1_DATABASE_ID` or resources are missing |
| Interactive deploy from CI/agent | May fail without non-interactive auth (`CLOUDFLARE_API_TOKEN` + account id) |

Recommended non-interactive env for CI:

```bash
# Cloudflare API token with Workers, R2, D1 edit permissions
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
```

Do **not** commit real tokens or the production `database_id` if your policy treats it as secret (the id is not highly sensitive but is environment-specific).

---

## Quick command recap

```bash
npx wrangler login
npx wrangler r2 bucket create dew-theory-opennext-cache
npx wrangler d1 create dew-theory-tag-cache
# → paste database_id into wrangler.jsonc

npm run preview   # local
npm run deploy    # production
```
