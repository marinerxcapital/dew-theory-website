import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Phase B edge caching (small-site profile):
 * - R2 incremental cache (ISR / data cache)
 * - Durable Object queue (time-based revalidation dedupe)
 * - D1 next-mode tag cache (on-demand revalidateTag / revalidatePath)
 *
 * See https://opennext.js.org/cloudflare/caching
 * and docs/EDGE_CACHE.md for resource creation + deploy steps.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
});
