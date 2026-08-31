#!/usr/bin/env node
/**
 * Lightweight continuity guardrail — warns when commerce/fulfillment files change
 * without corresponding memory doc updates in the same commit/worktree.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const COMMERCE_PATHS = [
  'lib/commerce/',
  'lib/fulfillment/',
  'lib/dropship/',
  'lib/suppliers/skin-script/rpa-adapter.js',
  'lib/suppliers/skin-script/mapping.js',
  'services/skin-script-rpa/',
  'migrations/',
  'wrangler.jsonc'
];

const MEMORY_PATHS = [
  'DEW-THEORY-CURRENT-STATUS.md',
  'docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md',
  'OPEN_ITEMS.md'
];

function changedFiles() {
  try {
    const out = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim();
    if (!out) return [];
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const changed = changedFiles();
const commerceTouched = changed.some((f) => COMMERCE_PATHS.some((p) => f.startsWith(p) || f === p));
const memoryTouched = changed.some((f) => MEMORY_PATHS.includes(f));

if (commerceTouched && !memoryTouched) {
  const missing = MEMORY_PATHS.filter((p) => existsSync(p));
  console.warn(
    '[continuity] Commerce/fulfillment files changed but memory docs may be stale.\n' +
      `  Update at least one of: ${missing.join(', ')}`
  );
  process.exitCode = 1;
} else {
  console.log('[continuity] OK');
}
