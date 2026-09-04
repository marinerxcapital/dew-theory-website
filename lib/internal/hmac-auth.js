/**
 * HMAC-SHA256 internal service authentication (Dew Theory ↔ RPA service).
 */
import { createHmac, timingSafeEqual } from 'crypto';
import { commerceHasNonce, commerceRecordNonce } from '../commerce/index.js';

const DEFAULT_SKEW_SEC = 300;

function getSecret() {
  return process.env.SKIN_SCRIPT_RPA_HMAC_SECRET || '';
}

/**
 * @param {string} method
 * @param {string} path
 * @param {string} body
 * @param {number} [timestamp]
 * @param {string} [nonce]
 */
export function signRequest(method, path, body, timestamp, nonce) {
  const secret = getSecret();
  if (!secret) throw new Error('SKIN_SCRIPT_RPA_HMAC_SECRET not configured');
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const n = nonce ?? cryptoRandomNonce();
  const bodyDigest = createHmac('sha256', secret).update(body || '').digest('hex');
  const canonical = `${method.toUpperCase()}\n${path}\n${ts}\n${n}\n${bodyDigest}`;
  const sig = createHmac('sha256', secret).update(canonical).digest('hex');
  return { timestamp: ts, nonce: n, signature: sig, bodyDigest };
}

function cryptoRandomNonce() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * @param {Request} request
 * @param {string} rawBody
 */
export async function verifyHmacRequest(request, rawBody) {
  const secret = getSecret();
  if (!secret) {
    return { ok: false, code: 'hmac_not_configured', status: 503 };
  }

  const ts = request.headers.get('x-dew-timestamp');
  const nonce = request.headers.get('x-dew-nonce');
  const sig = request.headers.get('x-dew-signature');
  if (!ts || !nonce || !sig) {
    return { ok: false, code: 'hmac_headers_missing', status: 401 };
  }

  const skew = Number(process.env.HMAC_CLOCK_SKEW_SEC || DEFAULT_SKEW_SEC);
  const now = Math.floor(Date.now() / 1000);
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(now - tsNum) > skew) {
    return { ok: false, code: 'hmac_timestamp_invalid', status: 401 };
  }

  if (await commerceHasNonce(nonce)) {
    return { ok: false, code: 'hmac_replay', status: 401 };
  }

  const url = new URL(request.url);
  const bodyDigest = createHmac('sha256', secret).update(rawBody || '').digest('hex');
  const canonical = `${request.method.toUpperCase()}\n${url.pathname}\n${ts}\n${nonce}\n${bodyDigest}`;
  const expected = createHmac('sha256', secret).update(canonical).digest('hex');

  const a = Buffer.from(String(sig));
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, code: 'hmac_invalid', status: 401 };
  }

  await commerceRecordNonce(nonce);
  return { ok: true };
}

/**
 * Env-configured RPA base URL only — reject non-http(s) and prod localhost (SSRF guard).
 * @param {string} raw
 * @returns {string|null} origin without trailing slash
 */
export function allowedRpaServiceBase(raw) {
  if (!raw) return null;
  try {
    const u = new URL(String(raw).trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (process.env.NODE_ENV === 'production' && u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') {
      if (process.env.NODE_ENV === 'production') return null;
    }
    // Block obvious link-local / metadata hosts even from mis-set env
    if (host === '169.254.169.254' || host.endsWith('.internal')) return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Signed fetch to RPA service.
 * @param {string} path
 * @param {object} [options]
 */
export async function signedFetch(path, options = {}) {
  const base = allowedRpaServiceBase(process.env.SKIN_SCRIPT_RPA_SERVICE_URL);
  if (!base) throw new Error('SKIN_SCRIPT_RPA_SERVICE_URL not configured or not allowlisted');

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  // Path must stay relative — no scheme/host injection via path
  if (fullPath.includes('://') || fullPath.startsWith('//')) {
    throw new Error('RPA path must be relative');
  }
  const { timestamp, nonce, signature } = signRequest(method, fullPath, body);

  const res = await fetch(`${base}${fullPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-dew-timestamp': String(timestamp),
      'x-dew-nonce': nonce,
      'x-dew-signature': signature,
      ...(options.headers || {})
    },
    body: body || undefined
  });

  return res;
}
