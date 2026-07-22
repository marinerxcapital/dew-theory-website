/**
 * Thin xAI (Grok) chat completions client — server-only.
 * Degrades to null when XAI_API_KEY is missing.
 */

const DEFAULT_BASE = 'https://api.x.ai/v1';

/**
 * @param {object} opts
 * @param {Array<{role: string, content: string}>} opts.messages
 * @param {string} [opts.model]
 * @param {number} [opts.temperature]
 * @param {boolean} [opts.json]
 * @returns {Promise<{ ok: true, content: string, raw?: object } | { ok: false, code: string, error: string }>}
 */
export async function xaiChat({
  messages,
  model,
  temperature = 0.2,
  json = false
} = {}) {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    return { ok: false, code: 'xai_unconfigured', error: 'XAI_API_KEY not set' };
  }

  const useModel = model || process.env.XAI_MODEL || 'grok-3';
  const base = (process.env.XAI_API_BASE || DEFAULT_BASE).replace(/\/$/, '');

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: useModel,
        messages,
        temperature,
        ...(json ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        code: 'xai_http_error',
        error: `xAI HTTP ${res.status}: ${text.slice(0, 300)}`
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { ok: true, content, raw: { id: data.id, model: data.model } };
  } catch (err) {
    return {
      ok: false,
      code: 'xai_network_error',
      error: err?.message || 'xAI request failed'
    };
  }
}

export function isXaiConfigured() {
  return Boolean(process.env.XAI_API_KEY);
}
