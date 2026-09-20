/**
 * Fail-closed live-source gate for catalog sync.
 * Never treats mock as a live Skin Script source.
 */

function truthy(v) {
  return v === true || v === 'true' || v === '1';
}

function rpaServiceConfigured(env) {
  return Boolean(env.SKIN_SCRIPT_RPA_SERVICE_URL && env.SKIN_SCRIPT_RPA_HMAC_SECRET);
}

function httpConfigured(env) {
  return Boolean(env.SKIN_SCRIPT_API_BASE && env.SKIN_SCRIPT_API_KEY);
}

function feedConfigured(env) {
  return Boolean(String(env.SKIN_SCRIPT_FEED_URL || '').trim());
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{
 *   mode: string,
 *   live: boolean,
 *   applyAllowed: boolean,
 *   code: string,
 *   reason: string
 * }}
 */
export function evaluateCatalogSyncReadiness(env = process.env) {
  const mode = String(env.SKIN_SCRIPT_MODE || 'mock').toLowerCase();
  const production = String(env.NODE_ENV || '') === 'production';
  const allowMockApply = truthy(env.CATALOG_SYNC_ALLOW_MOCK_APPLY);

  if (mode === 'mock') {
    return {
      mode,
      live: false,
      applyAllowed: allowMockApply || !production,
      code: 'catalog_source_mock',
      reason: production && !allowMockApply
        ? 'Production will not apply mock catalog as live. Set SKIN_SCRIPT_MODE to rpa or csv_feed with secrets, or CATALOG_SYNC_ALLOW_MOCK_APPLY=true for an explicit mock apply.'
        : 'Mock adapter is for local/dev only. It is not a live Skin Script catalog source.'
    };
  }

  if (mode === 'rpa') {
    if (!truthy(env.SKIN_SCRIPT_RPA_ENABLED) || !rpaServiceConfigured(env)) {
      return {
        mode,
        live: false,
        applyAllowed: false,
        code: 'rpa_not_configured',
        reason:
          'SKIN_SCRIPT_MODE=rpa requires SKIN_SCRIPT_RPA_ENABLED=true plus SKIN_SCRIPT_RPA_SERVICE_URL and SKIN_SCRIPT_RPA_HMAC_SECRET. Fly RPA / portal secrets are not treated as live until set. Sync will not fall back to mock.'
      };
    }
    return {
      mode,
      live: true,
      applyAllowed: true,
      code: 'catalog_source_rpa_ready',
      reason: 'RPA catalog endpoint is configured. Portal credentials live on the RPA service, not in this Worker.'
    };
  }

  if (mode === 'csv_feed') {
    if (!feedConfigured(env)) {
      return {
        mode,
        live: false,
        applyAllowed: false,
        code: 'feed_url_missing',
        reason:
          'SKIN_SCRIPT_MODE=csv_feed requires SKIN_SCRIPT_FEED_URL pointing at an authorized CSV/JSON export (https or local file). Sync will not fall back to mock.'
      };
    }
    return {
      mode,
      live: true,
      applyAllowed: true,
      code: 'catalog_source_feed_ready',
      reason: 'Authorized feed URL is set. Planner still drops SKUs that are not on the allowlist.'
    };
  }

  if (mode === 'http') {
    if (!httpConfigured(env)) {
      return {
        mode,
        live: false,
        applyAllowed: false,
        code: 'skin_script_http_unconfigured',
        reason:
          'No official Skin Script partner API is confirmed. HTTP mode stays fail-closed until SKIN_SCRIPT_API_BASE and SKIN_SCRIPT_API_KEY are set. Sync will not fall back to mock.'
      };
    }
    return {
      mode,
      live: true,
      applyAllowed: true,
      code: 'catalog_source_http_ready',
      reason: 'HTTP adapter env is set. Official partner API is still unconfirmed — use only after wholesale provides a real endpoint.'
    };
  }

  return {
    mode,
    live: false,
    applyAllowed: false,
    code: 'supplier_mode_invalid',
    reason: `Unknown SKIN_SCRIPT_MODE "${mode}"`
  };
}

/**
 * Whether an explicit admin source override may apply (not dry-run).
 * @param {string} [source]
 * @param {NodeJS.ProcessEnv} [env]
 */
export function evaluateApplyForSource(source, env = process.env) {
  const mode = String(source || env.SKIN_SCRIPT_MODE || 'mock').toLowerCase();
  return evaluateCatalogSyncReadiness({ ...env, SKIN_SCRIPT_MODE: mode });
}
