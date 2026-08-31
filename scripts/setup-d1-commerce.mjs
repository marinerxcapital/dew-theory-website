#!/usr/bin/env node
/**
 * Provision Dew Theory commerce D1 (operator script — requires Wrangler auth).
 * Does NOT fabricate database IDs. Exits with instructions if wrangler unavailable.
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const WRANGLER_JS = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const MIGRATION = path.join(ROOT, 'migrations', '001_commerce_schema.sql');
const WRANGLER_JSONC = path.join(ROOT, 'wrangler.jsonc');
const PLACEHOLDER_D1_ID = '00000000-0000-0000-0000-000000000001';

function hasWrangler() {
  return fs.existsSync(WRANGLER_JS);
}

function whoami() {
  try {
    const out = execSync(`"${process.execPath}" "${WRANGLER_JS}" whoami`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
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

function configuredCommerceDatabaseId() {
  const config = fs.readFileSync(WRANGLER_JSONC, 'utf8');
  const commerceBinding = config.match(
    /"binding"\s*:\s*"DEW_THEORY_D1"[\s\S]*?"database_id"\s*:\s*"([0-9a-f-]{36})"/i
  );
  return commerceBinding?.[1] || null;
}

function runWrangler(args) {
  return spawnSync(process.execPath, [WRANGLER_JS, ...args], {
    encoding: 'utf8',
    cwd: ROOT
  });
}

function outputOrError(result) {
  return result.stdout || result.stderr || result.error?.message || '';
}

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

const configuredDatabaseId = configuredCommerceDatabaseId();

if (!useLocal && configuredDatabaseId && configuredDatabaseId !== PLACEHOLDER_D1_ID) {
  console.log(`Configured DEW_THEORY_D1 database_id: ${configuredDatabaseId}`);
  console.log('Skipping create; applying migration to configured remote database.');
} else {
  console.log('Creating database dew-theory-commerce (skip if already exists)...');
  const create = runWrangler(['d1', 'create', 'dew-theory-commerce']);
  console.log(outputOrError(create));
  if (create.status !== 0) {
    console.error(outputOrError(create));
    process.exit(create.status || 1);
  }

  const idMatch = outputOrError(create).match(
    /database_id\s*["']?\s*:\s*["']?([0-9a-f-]{36})|database_id\s*=\s*["']?([0-9a-f-]{36})/i
  );
  if (idMatch) {
    console.log(`\nUpdate wrangler.jsonc DEW_THEORY_D1.database_id to: ${idMatch[1] || idMatch[2]}`);
  }
}

console.log('\nApplying migration...');
const apply = runWrangler(['d1', 'execute', 'dew-theory-commerce', ...remoteArgs, '--file', MIGRATION]);
if (apply.status !== 0) {
  console.error(outputOrError(apply));
  process.exit(apply.status || 1);
}
console.log(apply.stdout);
console.log('\nDone. Deploy with: npm run deploy');
console.log(`wrangler config: ${WRANGLER_JSONC}`);
