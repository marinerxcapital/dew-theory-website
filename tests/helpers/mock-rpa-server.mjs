/**
 * Minimal mock RPA HTTP server for Node integration tests.
 * Validates HMAC via lib/internal/hmac-auth.js (same contract as Python service).
 */
import http from 'node:http';
import { verifyHmacRequest } from '../../lib/internal/hmac-auth.js';

/**
 * @param {object} [opts]
 * @param {(req: import('node:http').IncomingMessage, body: string) => object | Promise<object>} [opts.handler]
 */
export function createMockRpaServer(opts = {}) {
  /** @type {import('node:http').Server | null} */
  let server = null;
  /** @type {number} */
  let port = 0;
  /** @type {Array<{ method: string, path: string, body: object, auth: object }>} */
  const requests = [];

  async function readBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return Buffer.concat(chunks).toString();
  }

  function start() {
    return new Promise((resolve, reject) => {
      server = http.createServer(async (req, res) => {
        try {
          const bodyText = await readBody(req);
          const path = req.url?.split('?')[0] || '/';
          const url = `http://127.0.0.1:${port}${path}`;
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) headers.set(key, Array.isArray(value) ? value.join(',') : value);
          }
          const request = new Request(url, {
            method: req.method,
            headers,
            body: bodyText || undefined
          });
          const auth = await verifyHmacRequest(request, bodyText);
          let parsed = {};
          if (bodyText) {
            try {
              parsed = JSON.parse(bodyText);
            } catch {
              parsed = {};
            }
          }
          requests.push({ method: req.method || 'GET', path, body: parsed, auth });

          if (!auth.ok) {
            res.writeHead(auth.status || 401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: auth.code }));
            return;
          }

          const response =
            (await opts.handler?.(req, bodyText, parsed)) ??
            defaultHandler(path, req.method || 'GET', parsed);

          res.writeHead(response.status || 200, {
            'Content-Type': 'application/json',
            ...(response.headers || {})
          });
          res.end(JSON.stringify(response.body ?? {}));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err?.message || 'internal_error' }));
        }
      });

      server.on('error', reject);
      server.listen(0, '127.0.0.1', () => {
        port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
        resolve({ port, baseUrl: `http://127.0.0.1:${port}` });
      });
    });
  }

  function stop() {
    return new Promise((resolve) => {
      if (!server) return resolve();
      server.close(() => resolve());
    });
  }

  return { start, stop, get requests() {
    return requests;
  } };
}

function defaultHandler(path, method, body) {
  if (path === '/v1/fulfillment/jobs' && method === 'POST') {
    if (body.dry_run) {
      return { body: { status: 'dry_run_ready', job_id: 'fj_mock_dry_run' } };
    }
    return {
      body: {
        status: 'accepted',
        job_id: 'fj_mock_live',
        supplier_order_id: 'SS-MOCK-001'
      }
    };
  }
  if (path.startsWith('/v1/fulfillment/jobs/') && method === 'GET') {
    const jobId = path.split('/').pop();
    return {
      body: { job_id: jobId, status: 'submitted_to_skin_script', supplier_order_id: 'SS-MOCK-001' }
    };
  }
  if (path === '/v1/inventory/check' && method === 'POST') {
    return {
      body: {
        rows: (body.skus || []).map((sku) => ({ sku, in_stock: true, quantity: 99 }))
      }
    };
  }
  return { status: 404, body: { code: 'not_found' } };
}
