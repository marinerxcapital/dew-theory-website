/**
 * Structured logging for API routes (I3).
 * Avoids logging full PII — email is allowed only when needed (truncated).
 */

function redact(value) {
  if (value == null) return value;
  if (typeof value === 'string') {
    // looks like email
    if (value.includes('@') && value.length > 3) {
      const [u, d] = value.split('@');
      return `${u.slice(0, 2)}…@${d}`;
    }
    if (value.length > 80) return value.slice(0, 80) + '…';
    return value;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (['password', 'token', 'authorization', 'cookie'].includes(k.toLowerCase())) {
        out[k] = '[redacted]';
      } else if (k.toLowerCase().includes('phone')) {
        out[k] = '[redacted]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

/**
 * @param {'info'|'warn'|'error'} level
 * @param {string} message
 * @param {Record<string, unknown>} [fields]
 */
export function log(level, message, fields = {}) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...redact(fields)
  };
  const text = JSON.stringify(line);
  if (level === 'error') console.error(text);
  else if (level === 'warn') console.warn(text);
  else console.log(text);
}

export function logInfo(message, fields) {
  log('info', message, fields);
}
export function logWarn(message, fields) {
  log('warn', message, fields);
}
export function logError(message, fields) {
  log('error', message, fields);
}
