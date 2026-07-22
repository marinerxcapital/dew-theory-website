/**
 * HTTP Skin Script adapter stub.
 * Real partner API is not confirmed — all calls fail clearly until env is set and endpoint known.
 */

export function createHttpSkinScriptAdapter(env = process.env) {
  const base = String(env.SKIN_SCRIPT_API_BASE || '').replace(/\/$/, '');
  const key = env.SKIN_SCRIPT_API_KEY || '';
  const account = env.SKIN_SCRIPT_ACCOUNT_ID || '';

  const configured = Boolean(base && key);

  async function notConfigured(method) {
    const err = new Error(
      `Skin Script HTTP adapter not configured (${method}). Set SKIN_SCRIPT_API_BASE + SKIN_SCRIPT_API_KEY after partner confirms API.`
    );
    err.code = 'skin_script_http_unconfigured';
    throw err;
  }

  return {
    name: 'skin-script-http',
    capabilities: {
      catalog: configured,
      inventory: configured,
      dropship: configured,
      orderStatus: configured
    },

    async listCatalog() {
      if (!configured) return notConfigured('listCatalog');
      // Placeholder: real path TBD with partner docs
      const res = await fetch(`${base}/catalog`, {
        headers: {
          Authorization: `Bearer ${key}`,
          'X-Account-Id': account,
          Accept: 'application/json'
        }
      });
      if (!res.ok) {
        const err = new Error(`Skin Script catalog HTTP ${res.status}`);
        err.code = 'skin_script_http_error';
        throw err;
      }
      const data = await res.json();
      const rows = Array.isArray(data) ? data : data.products || data.items || [];
      return rows;
    },

    async getInventory(skus) {
      if (!configured) return notConfigured('getInventory');
      const res = await fetch(`${base}/inventory`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'X-Account-Id': account
        },
        body: JSON.stringify({ skus })
      });
      if (!res.ok) {
        const err = new Error(`Skin Script inventory HTTP ${res.status}`);
        err.code = 'skin_script_http_error';
        throw err;
      }
      const data = await res.json();
      return Array.isArray(data) ? data : data.items || [];
    },

    async createDropshipOrder(payload) {
      if (!configured) return notConfigured('createDropshipOrder');
      const res = await fetch(`${base}/dropship/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'X-Account-Id': account,
          'Idempotency-Key': payload.idempotency_key || payload.order_id
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`Skin Script dropship HTTP ${res.status}: ${text.slice(0, 200)}`);
        err.code = 'skin_script_http_error';
        throw err;
      }
      const data = await res.json();
      return {
        external_id: data.external_id || data.id || data.order_id,
        status: data.status || 'submitted',
        raw: { sanitized: true }
      };
    },

    async getOrderStatus(externalId) {
      if (!configured) return notConfigured('getOrderStatus');
      const res = await fetch(`${base}/dropship/orders/${encodeURIComponent(externalId)}`, {
        headers: {
          Authorization: `Bearer ${key}`,
          'X-Account-Id': account
        }
      });
      if (!res.ok) {
        const err = new Error(`Skin Script status HTTP ${res.status}`);
        err.code = 'skin_script_http_error';
        throw err;
      }
      return res.json();
    }
  };
}
