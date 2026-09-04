/**
 * RPA service health probe for admin (server-side only).
 */
import { STATUS } from './status.js';
import { allowedRpaServiceBase } from '../internal/hmac-auth.js';

const TIMEOUT_MS = 6000;

function allowedRpaUrl(raw) {
  return allowedRpaServiceBase(raw);
}

async function fetchJson(url, timeoutMs = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 200) };
    }
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || 'fetch failed').slice(0, 120) };
  } finally {
    clearTimeout(t);
  }
}

export async function getRpaHealth(env = process.env) {
  const checkedAt = new Date().toISOString();
  const serviceUrl = allowedRpaUrl(env.SKIN_SCRIPT_RPA_SERVICE_URL);
  const hmacConfigured = Boolean(env.SKIN_SCRIPT_RPA_HMAC_SECRET);
  const rpaEnabled = env.SKIN_SCRIPT_RPA_ENABLED === 'true' || env.SKIN_SCRIPT_RPA_ENABLED === '1';
  const dryRun = env.SKIN_SCRIPT_DRY_RUN === 'true' || env.SKIN_SCRIPT_DRY_RUN === '1';
  const mode = env.SKIN_SCRIPT_MODE || 'mock';

  if (!serviceUrl) {
    return {
      id: 'skin_script_rpa',
      name: 'Skin Script RPA',
      status: rpaEnabled ? STATUS.NOT_CONFIGURED : STATUS.DISABLED,
      serviceUrlConfigured: false,
      hmacConfigured,
      rpaEnabled,
      dryRun,
      supplierMode: mode,
      health: null,
      ready: null,
      checkedAt
    };
  }

  const health = await fetchJson(`${serviceUrl}/health`);
  const ready = await fetchJson(`${serviceUrl}/ready`);

  let status = STATUS.UNKNOWN;
  if (!health.ok) status = STATUS.DEGRADED;
  else if (ready.ok && ready.body?.ready) status = STATUS.HEALTHY;
  else if (health.ok) status = STATUS.ATTENTION;

  if (!rpaEnabled) status = STATUS.DISABLED;

  return {
    id: 'skin_script_rpa',
    name: 'Skin Script RPA',
    status,
    serviceUrlConfigured: true,
    hmacConfigured,
    rpaEnabled,
    dryRun,
    supplierMode: mode,
    health: health.ok ? health.body : { error: health.error },
    ready: ready.ok ? ready.body : { error: ready.error },
    checkedAt
  };
}

export function getSkinScriptConfigHealth(env = process.env) {
  const portal = Boolean(env.SKIN_SCRIPT_PORTAL_BASE_URL || env.SKIN_SCRIPT_LOGIN_URL);
  const username = Boolean(env.SKIN_SCRIPT_USERNAME);
  const password = Boolean(env.SKIN_SCRIPT_PASSWORD);
  const account = env.SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME || 'Emily';

  let status = STATUS.NOT_CONFIGURED;
  if (portal && username && password) status = STATUS.HEALTHY;
  else if (portal) status = STATUS.ATTENTION;

  return {
    id: 'skin_script_portal',
    name: 'Skin Script portal credentials',
    status,
    portalConfigured: portal,
    portalBaseConfigured: portal,
    credentialsConfigured: username && password,
    usernameConfigured: username,
    passwordConfigured: password,
    hmacConfigured: Boolean(env.SKIN_SCRIPT_RPA_HMAC_SECRET),
    rpaUrlConfigured: Boolean(env.SKIN_SCRIPT_RPA_SERVICE_URL),
    expectedAccount: account,
    loginUrl: env.SKIN_SCRIPT_LOGIN_URL || 'https://skinscriptrx.com/my-account/',
    checkedAt: new Date().toISOString()
  };
}
