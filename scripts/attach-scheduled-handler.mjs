#!/usr/bin/env node
/**
 * Attach Dew Theory catalog-sync `scheduled` handler to the OpenNext worker bundle.
 * Cloudflare Cron Triggers invoke scheduled(), which POSTs /api/cron/catalog-sync.
 */
import fs from 'node:fs';
import path from 'node:path';

const dest = path.join(process.cwd(), '.open-next', 'worker.js');
if (!fs.existsSync(dest)) {
  console.error('[attach-scheduled] .open-next/worker.js missing — run OpenNext build first');
  process.exit(1);
}

let src = fs.readFileSync(dest, 'utf8');
if (src.includes('__dewTheoryCatalogSyncCron')) {
  console.log('[attach-scheduled] already attached');
  process.exit(0);
}

const importLine =
  'import { handleCatalogSyncScheduled } from "../lib/cloudflare/scheduled-catalog-sync.js";\n';
const scheduledMethod = `  async scheduled(controller, env, ctx) {
    ctx.waitUntil(handleCatalogSyncScheduled(controller, env));
  },
`;

if (!/export\s+default\s*\{/.test(src)) {
  console.error('[attach-scheduled] unexpected worker export shape; cannot attach scheduled()');
  process.exit(1);
}

src = src.replace(/export\s+default\s*\{/, `export default {\n${scheduledMethod}`);
fs.writeFileSync(dest, `/* __dewTheoryCatalogSyncCron */\n${importLine}${src}`);
console.log('[attach-scheduled] attached catalog-sync scheduled handler');
