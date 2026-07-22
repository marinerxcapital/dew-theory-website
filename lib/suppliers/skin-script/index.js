/**
 * Skin Script supplier factory.
 * SKIN_SCRIPT_MODE=mock|http|csv_feed (default mock)
 */

import { isSupplierMode } from '../types.js';
import { createMockSkinScriptAdapter } from './mock-adapter.js';
import { createHttpSkinScriptAdapter } from './http-adapter.js';
import { createCsvFeedSkinScriptAdapter } from './csv-feed-adapter.js';

/**
 * @param {string} [mode]
 * @param {NodeJS.ProcessEnv} [env]
 */
export function getSkinScriptAdapter(mode, env = process.env) {
  const m = String(mode || env.SKIN_SCRIPT_MODE || 'mock').toLowerCase();
  if (!isSupplierMode(m)) {
    const err = new Error(`Unknown SKIN_SCRIPT_MODE "${m}"`);
    err.code = 'supplier_mode_invalid';
    throw err;
  }
  if (m === 'http') return createHttpSkinScriptAdapter(env);
  if (m === 'csv_feed') return createCsvFeedSkinScriptAdapter(env);
  return createMockSkinScriptAdapter();
}

export { createMockSkinScriptAdapter, createHttpSkinScriptAdapter, createCsvFeedSkinScriptAdapter };
