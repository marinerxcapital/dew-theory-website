import SystemStatusBadge from './SystemStatusBadge';

function pushRow(rows, k, v) {
  if (v === undefined || v === null) return;
  rows.push({ k, v: typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v) });
}

export default function ConnectionPanel({ connection }) {
  if (!connection) return null;
  const rows = [];

  pushRow(rows, 'Backend', connection.backend);
  pushRow(rows, 'Mode', connection.mode);
  pushRow(rows, 'Configured', connection.configured);
  pushRow(rows, 'Secret key', connection.secretKeyConfigured ? 'Configured' : connection.configured === false ? 'Missing' : undefined);
  pushRow(rows, 'RPA enabled', connection.rpaEnabled);
  pushRow(rows, 'Dry run', connection.dryRun);
  pushRow(rows, 'API reachable', connection.apiReachable);
  pushRow(rows, 'Checkout enabled', connection.checkoutEnabled);
  pushRow(rows, 'Webhook secret', connection.webhookSecretConfigured ? 'Set' : connection.webhookSecretConfigured === false ? 'Missing' : undefined);
  pushRow(rows, 'D1 available', connection.d1Available);
  pushRow(rows, 'Paid orders', connection.paidOrderCount);
  pushRow(rows, 'Fulfillment jobs', connection.fulfillmentJobCount);
  pushRow(rows, 'Mappings', connection.mappingCount);
  pushRow(rows, 'Verified mappings', connection.verifiedMappingCount);
  pushRow(rows, 'Catalog products', connection.catalogProductCount);
  pushRow(rows, 'Last paid order', connection.lastPaidOrderAt);
  pushRow(rows, 'Last fulfillment job', connection.lastFulfillmentJobAt);
  pushRow(rows, 'Webhook events (range)', connection.webhookEventsInRange);
  pushRow(rows, 'Webhook failures', connection.webhookFailuresInRange);
  pushRow(rows, 'Last webhook', connection.lastWebhookAt);
  pushRow(rows, 'Last webhook type', connection.lastWebhookType);
  pushRow(rows, 'Portal configured', connection.portalConfigured);
  pushRow(rows, 'Username configured', connection.usernameConfigured);
  pushRow(rows, 'Password configured', connection.passwordConfigured);
  pushRow(rows, 'HMAC configured', connection.hmacConfigured);
  pushRow(rows, 'Service URL', connection.serviceUrlConfigured ? 'Configured' : connection.serviceUrlConfigured === false ? 'Missing' : undefined);
  pushRow(rows, 'Reachable', connection.reachable);
  pushRow(rows, 'Ready', connection.ready);
  pushRow(rows, 'Session authenticated', connection.sessionAuthenticated);
  pushRow(rows, 'Challenge detected', connection.challengeDetected);
  pushRow(rows, 'Last verified', connection.lastVerifiedAt);
  pushRow(rows, 'From domain', connection.fromConfigured);
  pushRow(rows, 'Site URL', connection.siteUrl);
  pushRow(rows, 'Commit SHA', connection.commitSha);
  pushRow(rows, 'SKIN_SCRIPT_MODE', connection.skinScriptMode);
  pushRow(rows, 'Owner email configured', connection.ownerEmailConfigured);
  pushRow(rows, 'TOTP policy', connection.totpPolicy);
  if (connection.lastError) {
    pushRow(rows, 'Last error', connection.lastError);
  }
  if (connection.error) {
    pushRow(rows, 'Error', connection.error);
  }
  if (connection.checkedAt) {
    pushRow(rows, 'Checked', new Date(connection.checkedAt).toLocaleString());
  }

  return (
    <article className="glass-1 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg font-normal text-forest">{connection.name}</h3>
        <SystemStatusBadge status={connection.status} />
      </div>
      <dl className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-4 font-body text-xs font-light">
            <dt className="text-muted">{r.k}</dt>
            <dd className="text-right text-forest max-w-[60%] truncate">{r.v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
