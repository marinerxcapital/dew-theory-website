/**
 * Cron auth + fail-closed apply gate for catalog sync.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { authorizeCronRequest, runCatalogSyncCron } from '../lib/catalog-sync-cron.js';
import { evaluateCatalogSyncReadiness } from '../lib/catalog-sync-readiness.js';

function headers(map) {
  return {
    get(name) {
      return map[name.toLowerCase()] ?? map[name] ?? null;
    }
  };
}

describe('authorizeCronRequest', () => {
  it('fails closed when CRON_SECRET is missing', () => {
    const r = authorizeCronRequest(headers({ authorization: 'Bearer x' }), {});
    assert.equal(r.ok, false);
    assert.equal(r.status, 503);
    assert.equal(r.code, 'cron_unconfigured');
  });

  it('rejects a missing or wrong bearer', () => {
    const env = { CRON_SECRET: 'correct-secret' };
    const missing = authorizeCronRequest(headers({}), env);
    assert.equal(missing.ok, false);
    assert.equal(missing.status, 401);
    assert.equal(missing.code, 'cron_unauthorized');

    const wrong = authorizeCronRequest(headers({ authorization: 'Bearer nope' }), env);
    assert.equal(wrong.ok, false);
    assert.equal(wrong.code, 'cron_unauthorized');
  });

  it('accepts Bearer or x-cron-secret', () => {
    const env = { CRON_SECRET: 'correct-secret' };
    const bearer = authorizeCronRequest(headers({ authorization: 'Bearer correct-secret' }), env);
    assert.equal(bearer.ok, true);
    const header = authorizeCronRequest(headers({ 'x-cron-secret': 'correct-secret' }), env);
    assert.equal(header.ok, true);
  });
});

describe('evaluateCatalogSyncReadiness', () => {
  it('does not treat mock as a live source', () => {
    const r = evaluateCatalogSyncReadiness({ SKIN_SCRIPT_MODE: 'mock', NODE_ENV: 'production' });
    assert.equal(r.live, false);
    assert.equal(r.applyAllowed, false);
    assert.equal(r.code, 'catalog_source_mock');
  });

  it('allows explicit mock apply only when flagged', () => {
    const r = evaluateCatalogSyncReadiness({
      SKIN_SCRIPT_MODE: 'mock',
      NODE_ENV: 'production',
      CATALOG_SYNC_ALLOW_MOCK_APPLY: 'true'
    });
    assert.equal(r.live, false);
    assert.equal(r.applyAllowed, true);
  });

  it('fails closed for rpa without Fly/HMAC secrets', () => {
    const r = evaluateCatalogSyncReadiness({
      SKIN_SCRIPT_MODE: 'rpa',
      NODE_ENV: 'production',
      SKIN_SCRIPT_RPA_ENABLED: 'false'
    });
    assert.equal(r.live, false);
    assert.equal(r.applyAllowed, false);
    assert.equal(r.code, 'rpa_not_configured');
  });

  it('fails closed for csv_feed without SKIN_SCRIPT_FEED_URL', () => {
    const r = evaluateCatalogSyncReadiness({
      SKIN_SCRIPT_MODE: 'csv_feed',
      NODE_ENV: 'production'
    });
    assert.equal(r.applyAllowed, false);
    assert.equal(r.code, 'feed_url_missing');
  });

  it('is ready when rpa secrets are present', () => {
    const r = evaluateCatalogSyncReadiness({
      SKIN_SCRIPT_MODE: 'rpa',
      SKIN_SCRIPT_RPA_ENABLED: 'true',
      SKIN_SCRIPT_RPA_SERVICE_URL: 'https://rpa.example.com',
      SKIN_SCRIPT_RPA_HMAC_SECRET: 'hmac'
    });
    assert.equal(r.live, true);
    assert.equal(r.applyAllowed, true);
    assert.equal(r.code, 'catalog_source_rpa_ready');
  });
});

describe('worker cron wiring', () => {
  it('declares a daily wrangler cron trigger', () => {
    const wrangler = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '..', 'wrangler.jsonc'),
      'utf8'
    );
    assert.match(wrangler, /"crons"\s*:\s*\[\s*"0 6 \* \* \*"/);
    assert.match(wrangler, /attach-scheduled-handler|catalog-sync/);
  });
});

describe('runCatalogSyncCron', () => {
  it('skips apply in production mock mode instead of using mock as live', async () => {
    const result = await runCatalogSyncCron({
      env: { SKIN_SCRIPT_MODE: 'mock', NODE_ENV: 'production' },
      record: false
    });
    assert.equal(result.ok, true);
    assert.equal(result.skipped, true);
    assert.equal(result.code, 'catalog_source_mock');
    assert.equal(result.totals.create, 0);
    assert.equal(result.totals.update, 0);
  });

  it('skips rpa when the service is not deployed', async () => {
    const result = await runCatalogSyncCron({
      env: {
        SKIN_SCRIPT_MODE: 'rpa',
        NODE_ENV: 'production',
        SKIN_SCRIPT_RPA_ENABLED: 'true'
      },
      record: false
    });
    assert.equal(result.skipped, true);
    assert.equal(result.code, 'rpa_not_configured');
  });
});
