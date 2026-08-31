/**
 * Skin Script RPA adapter — delegates fulfillment to private Playwright service.
 * SKIN_SCRIPT_MODE=rpa
 */
import { signedFetch } from '../../internal/hmac-auth.js';
import { logInfo, logWarn } from '../../log.js';

function rpaEnabled(env = process.env) {
  return env.SKIN_SCRIPT_RPA_ENABLED === 'true' || env.SKIN_SCRIPT_RPA_ENABLED === '1';
}

function serviceConfigured(env = process.env) {
  return Boolean(env.SKIN_SCRIPT_RPA_SERVICE_URL && env.SKIN_SCRIPT_RPA_HMAC_SECRET);
}

export function createRpaSkinScriptAdapter(env = process.env) {
  return {
    name: 'skin-script-rpa',
    capabilities: {
      catalog: false,
      inventory: true,
      dropship: true,
      orderStatus: true
    },

    async listCatalog() {
      const err = new Error('Catalog not available via RPA adapter');
      err.code = 'rpa_catalog_unsupported';
      throw err;
    },

    async getInventory(skus) {
      if (!rpaEnabled(env) || !serviceConfigured(env)) {
        const err = new Error('RPA service not enabled or configured');
        err.code = 'rpa_not_configured';
        throw err;
      }
      const res = await signedFetch('/v1/inventory/check', {
        method: 'POST',
        body: { skus: skus || [] }
      });
      if (!res.ok) {
        const err = new Error(`RPA inventory check failed: ${res.status}`);
        err.code = 'rpa_inventory_failed';
        throw err;
      }
      const data = await res.json();
      return data.rows || [];
    },

    async createDropshipOrder(payload) {
      if (!rpaEnabled(env)) {
        const err = new Error('SKIN_SCRIPT_RPA_ENABLED is false — kill switch active');
        err.code = 'rpa_disabled';
        throw err;
      }
      if (!serviceConfigured(env)) {
        const err = new Error('RPA service URL/HMAC secret not configured');
        err.code = 'rpa_not_configured';
        throw err;
      }

      logInfo('rpa.create_dropship_order', {
        order_id: payload.order_id,
        line_count: payload.lines?.length || 0
      });

      const res = await signedFetch('/v1/fulfillment/jobs', {
        method: 'POST',
        body: {
          order_id: payload.order_id,
          idempotency_key: payload.idempotency_key || payload.order_id,
          customer: payload.customer,
          shipping_address: payload.shipping_address,
          lines: payload.lines,
          dry_run: env.SKIN_SCRIPT_DRY_RUN === 'true' || env.SKIN_SCRIPT_DRY_RUN === '1'
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.detail || data.error || `RPA job create failed: ${res.status}`);
        err.code = data.code || 'rpa_job_failed';
        throw err;
      }

      if (data.status === 'dry_run_ready') {
        return {
          external_id: data.job_id,
          status: 'dry_run_ready',
          raw: { dry_run: true, job_id: data.job_id }
        };
      }

      if (data.status === 'blocked' || data.error_code) {
        const err = new Error(data.error_message || data.error_code);
        err.code = data.error_code || 'rpa_blocked';
        throw err;
      }

      return {
        external_id: data.supplier_order_id || data.job_id,
        status: data.status || 'accepted',
        raw: {
          job_id: data.job_id,
          supplier_order_id: data.supplier_order_id,
          status: data.status
        }
      };
    },

    async getOrderStatus(externalId) {
      if (!serviceConfigured(env)) {
        return { status: 'unknown' };
      }
      try {
        const res = await signedFetch(`/v1/fulfillment/jobs/${encodeURIComponent(externalId)}`);
        if (!res.ok) return { status: 'unknown' };
        const data = await res.json();
        return {
          status: data.status || 'unknown',
          tracking_number: data.tracking_number,
          carrier: data.carrier
        };
      } catch (err) {
        logWarn('rpa.get_order_status_failed', { externalId, error: err?.message });
        return { status: 'unknown' };
      }
    }
  };
}
