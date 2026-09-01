/**
 * Attention queue for admin command center.
 */
import { commerceListFulfillmentJobs, commerceListWebhookEvents } from '../commerce/index.js';
import { getStripeHealth } from './stripe-health.js';
import { getRpaHealth } from './rpa-health.js';
import { getCommerceHealth } from './metrics.js';
import { STATUS } from './status.js';

const ATTENTION_JOB_STATUSES = new Set([
  'blocked',
  'failed',
  'submission_ambiguous'
]);

/**
 * @returns {Promise<Array<{ id: string, severity: string, title: string, detail: string, href?: string, at?: string }>>}
 */
export async function buildAttentionQueue(env = process.env) {
  const items = [];
  const jobs = await commerceListFulfillmentJobs({ limit: 100 });

  for (const job of jobs) {
    if (!ATTENTION_JOB_STATUSES.has(job.status)) continue;
    items.push({
      id: `job_${job.id}`,
      severity: job.status === 'failed' ? 'critical' : 'attention',
      title: `Fulfillment ${job.status.replace(/_/g, ' ')}`,
      detail: job.error_message || job.error_code || job.status,
      href: `/admin/fulfillment?job=${encodeURIComponent(job.id)}`,
      at: job.updated_at
    });
  }

  const commerce = await getCommerceHealth();
  if (commerce.status === STATUS.CRITICAL || commerce.status === STATUS.DEGRADED) {
    items.push({
      id: 'commerce_health',
      severity: commerce.status === STATUS.CRITICAL ? 'critical' : 'attention',
      title: 'Commerce backend issue',
      detail: commerce.error || `Backend: ${commerce.backend}`,
      href: '/admin/system'
    });
  }

  const stripe = await getStripeHealth(env);
  if (stripe.status === STATUS.DEGRADED) {
    items.push({
      id: 'stripe_degraded',
      severity: 'attention',
      title: 'Stripe API unreachable',
      detail: stripe.lastError || 'Check Stripe keys',
      href: '/admin/integrations'
    });
  }

  const rpa = await getRpaHealth(env);
  if (env.SKIN_SCRIPT_RPA_ENABLED === 'true' && rpa.status === STATUS.DEGRADED) {
    items.push({
      id: 'rpa_down',
      severity: 'critical',
      title: 'RPA service unavailable',
      detail: rpa.ready?.error || rpa.health?.error || 'Health check failed',
      href: '/admin/integrations'
    });
  }

  const webhooks = await commerceListWebhookEvents({ limit: 20 });
  const failedWebhooks = webhooks.filter((w) => !w.processed);
  if (failedWebhooks.length > 5) {
    items.push({
      id: 'webhook_backlog',
      severity: 'attention',
      title: 'Webhook events pending',
      detail: `${failedWebhooks.length} recent events not marked processed`,
      href: '/admin/integrations'
    });
  }

  return items.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}
