#!/usr/bin/env node
/**
 * Provision Dew Theory commerce D1 (operator script — requires Wrangler auth).
 * Does NOT fabricate database IDs. Exits with instructions if wrangler unavailable.
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const WRANGLER = path.join(ROOT, 'node_modules', '.bin', 'wrangler');
const MIGRATION = path.join(ROOT, 'migrations', '001_commerce_schema.sql');
const WRANGLER_JSONC = path.join(ROOT, 'wrangler.jsonc');

function hasWrangler() {
  return fs.existsSync(WRANGLER);
}

function whoami() {
  try {
    const out = execSync(`"${WRANGLER}" whoami`, { stdio: 'pipe', encoding: 'utf8' });
    if (/not authenticated/i.test(out)) return false;
    // Authenticated sessions include an account email or Account ID line
    if (!/@/.test(out) && !/Account ID/i.test(out)) return false;
    return true;
  } catch {
    return false;
  }
}

const useLocal = process.argv.includes('--local');
const remoteArgs = useLocal ? [] : ['--remote'];

console.log('[setup-d1-commerce] Dew Theory commerce D1 provisioning helper');
console.log(`Timestamp: ${new Date().toISOString()}`);

if (!hasWrangler()) {
  console.error('ERROR: wrangler not found. Run npm ci in repo root first.');
  process.exit(1);
}

if (!useLocal && !whoami()) {
  console.error('ERROR: wrangler not authenticated. Run: npx wrangler login');
  console.error('For local-only dev schema: npm run setup:d1:local');
  console.error('Then re-run: npm run setup:d1');
  process.exit(2);
}

if (useLocal) {
  console.log('Mode: LOCAL D1 (dev only — not production). Skipping remote auth check.');
} else {
  console.log('Mode: REMOTE D1 (Cloudflare production account).');
}

console.log('Creating database dew-theory-commerce (skip if already exists)...');
const create = spawnSync(WRANGLER, ['d1', 'create', 'dew-theory-commerce', ...remoteArgs], {
  encoding: 'utf8'
});
console.log(create.stdout || create.stderr);

const idMatch = (create.stdout || create.stderr || '').match(
  /database_id\s*=\s*["']?([0-9a-f-]{36})/i
);
if (idMatch) {
  console.log(`\nUpdate wrangler.jsonc DEW_THEORY_D1.database_id to: ${idMatch[1]}`);
}

console.log('\nApplying migration...');
const apply = spawnSync(
  WRANGLER,
  ['d1', 'execute', 'dew-theory-commerce', ...remoteArgs, '--file', MIGRATION],
  { encoding: 'utf8', cwd: ROOT }
);
if (apply.status !== 0) {
  console.error(apply.stderr || apply.stdout);
  process.exit(apply.status || 1);
}
console.log(apply.stdout);
console.log('\nDone. Deploy with: npm run deploy');
console.log(`wrangler config: ${WRANGLER_JSONC}`);
