/**
 * Fulfillment alerting — webhook + optional email via existing Resend infrastructure.
 */
import { logInfo, logWarn } from '../log.js';

/**
 * @param {object} params
 */
export async function sendFulfillmentAlert(params) {
  const {
    order_id,
    fulfillment_job_id,
    error_code,
    error_message,
    affected_skus = []
  } = params;

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com';
  const payload = {
    type: 'fulfillment_alert',
    order_id,
    fulfillment_job_id,
    error_code,
    error_message: String(error_message || '').slice(0, 500),
    affected_skus,
    admin_url: `${site.replace(/\/$/, '')}/admin/orders/${order_id}`,
    timestamp: new Date().toISOString()
  };

  logWarn('fulfillment.alert', payload);

  const webhookUrl = process.env.FULFILLMENT_ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      logInfo('fulfillment.alert_webhook_sent', { order_id, error_code });
    } catch (err) {
      logWarn('fulfillment.alert_webhook_failed', {
        order_id,
        error: err?.message || 'webhook failed'
      });
    }
  }

  const adminEmail =
    process.env.ADMIN_EMAIL || process.env.CONSULTATION_ADMIN_EMAIL || '';
  const resendKey = process.env.RESEND_API_KEY || '';
  if (adminEmail && resendKey) {
    try {
      const { sendEmail } = await import('../email.js');
      await sendEmail({
        to: adminEmail,
        subject: `[Dew Theory] Fulfillment blocked — ${error_code}`,
        text: [
          `Order: ${order_id}`,
          `Job: ${fulfillment_job_id || 'n/a'}`,
          `Code: ${error_code}`,
          `Message: ${payload.error_message}`,
          affected_skus.length ? `SKUs: ${affected_skus.join(', ')}` : '',
          `Admin: ${payload.admin_url}`
        ]
          .filter(Boolean)
          .join('\n')
      });
    } catch {
      /* email optional */
    }
  }

  return payload;
}
