/**
 * Stripe connection diagnostics for admin (no secret values).
 */
import { STATUS } from './status.js';
import { commerceListOrders, commerceListWebhookEvents } from '../commerce/index.js';
import { inRange } from './date-range.js';

const PROBE_TIMEOUT_MS = 8000;

export async function getStripeHealth(env = process.env, rangeOpts = null) {
  const checkedAt = new Date().toISOString();
  const secret = env.STRIPE_SECRET_KEY;
  const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const vcPrice = env.STRIPE_VIRTUAL_CONSULTATION_PRICE_ID;

  const configured = Boolean(secret && publishable);
  let mode = 'not_configured';
  if (secret?.startsWith('sk_live_')) mode = 'live';
  else if (secret?.startsWith('sk_test_')) mode = 'test';

  let apiReachable = false;
  let apiError = null;
  if (configured) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(secret, { apiVersion: '2024-11-20.acacia', timeout: PROBE_TIMEOUT_MS });
      await stripe.balance.retrieve();
      apiReachable = true;
    } catch (e) {
      apiError = String(e.message || 'Stripe API error').slice(0, 120);
    }
  }

  let status = STATUS.NOT_CONFIGURED;
  if (configured && apiReachable) status = STATUS.HEALTHY;
  else if (configured && !apiReachable) status = STATUS.DEGRADED;

  let webhookEventsInRange = 0;
  let webhookFailuresInRange = 0;
  let lastWebhookAt = null;
  let lastWebhookType = null;
  let lastPaidOrderAt = null;
  try {
    const webhooks = await commerceListWebhookEvents({ limit: 50 });
    const from = rangeOpts?.from;
    const to = rangeOpts?.to;
    const inWindow = from && to
      ? webhooks.filter((w) => inRange(w.at || w.created_at, from, to))
      : webhooks;
    webhookEventsInRange = inWindow.length;
    webhookFailuresInRange = inWindow.filter((w) => !w.processed).length;
    const last = webhooks[0];
    if (last) {
      lastWebhookAt = last.at || last.created_at;
      lastWebhookType = last.event_type || last.type;
    }
    const orders = await commerceListOrders();
    const paid = orders.find((o) =>
      ['paid', 'fulfilled', 'submitted_to_skin_script'].includes(o.status)
    );
    lastPaidOrderAt = paid?.created_at || null;
  } catch {
    /* commerce optional during probe */
  }

  return {
    id: 'stripe',
    name: 'Stripe',
    status,
    mode,
    configured,
    secretKeyConfigured: Boolean(secret),
    apiReachable,
    checkoutEnabled: configured && apiReachable,
    webhookSecretConfigured: Boolean(webhookSecret),
    consultationPriceConfigured: Boolean(vcPrice),
    webhookEventsInRange,
    webhookFailuresInRange,
    lastWebhookAt,
    lastWebhookType,
    lastPaidOrderAt,
    lastError: apiError,
    checkedAt
  };
}
