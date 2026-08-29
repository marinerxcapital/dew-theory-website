/**
 * Shared transactional email via Resend (optional).
 * Without RESEND_API_KEY messages are persisted to store.outbound_emails as "logged".
 */

import { mutateStore } from './store.js';

export function getEmailConfig() {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.CONSULTATION_ADMIN_EMAIL || '';
  return {
    from: process.env.EMAIL_FROM || 'Dew Theory <noreply@dewtheoryco.com>',
    replyTo: process.env.EMAIL_REPLY_TO || adminEmail || undefined,
    resendKey: process.env.RESEND_API_KEY || '',
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com').replace(/\/$/, '')
  };
}

export function recordOutboundEmail(message) {
  const row = {
    id: `em_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...message,
    created_at: new Date().toISOString(),
    status: message.status || 'queued'
  };
  mutateStore((s) => {
    if (!Array.isArray(s.outbound_emails)) s.outbound_emails = [];
    s.outbound_emails.unshift(row);
    s.outbound_emails = s.outbound_emails.slice(0, 500);
    return s;
  });
  return row;
}

/**
 * @param {{ to: string, subject: string, text: string, html?: string, tags?: string[] }} opts
 */
export async function sendEmail(opts) {
  const { to, subject, text, html, tags = [] } = opts || {};
  const cfg = getEmailConfig();

  if (!to || !subject) {
    return recordOutboundEmail({
      to: to || '',
      subject: subject || '',
      text: text || '',
      tags,
      status: 'failed',
      provider: 'none',
      error: 'missing_to_or_subject'
    });
  }

  if (cfg.resendKey) {
    try {
      const body = {
        from: cfg.from,
        to: [to],
        subject,
        text
      };
      if (html) body.html = html;
      if (cfg.replyTo) body.reply_to = cfg.replyTo;
      if (tags.length) {
        body.tags = tags.slice(0, 5).map((t) => ({
          name: 'type',
          value: String(t).slice(0, 64)
        }));
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return recordOutboundEmail({
          to,
          subject,
          text,
          tags,
          status: 'failed',
          provider: 'resend',
          error: data?.message || `HTTP ${res.status}`,
          provider_id: null
        });
      }
      return recordOutboundEmail({
        to,
        subject,
        text,
        tags,
        status: 'sent',
        provider: 'resend',
        provider_id: data?.id || null
      });
    } catch (err) {
      return recordOutboundEmail({
        to,
        subject,
        text,
        tags,
        status: 'failed',
        provider: 'resend',
        error: err?.message || 'send_failed',
        provider_id: null
      });
    }
  }

  console.info('[email]', { to, subject, tags });
  return recordOutboundEmail({
    to,
    subject,
    text,
    tags,
    status: 'logged',
    provider: 'log',
    provider_id: null
  });
}

export async function sendBookingConfirmationEmail({ appointment, service }) {
  const cfg = getEmailConfig();
  const email = appointment?.customer?.email;
  if (!email) return null;

  const when = appointment.start_time
    ? new Date(appointment.start_time).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : 'your selected time';

  const depositNote = getBookingPolicy().depositSummary;

  const subject = `Booking confirmed — ${service?.name || 'facial'} (${appointment.id})`;
  const text = [
    `Hi ${firstName(appointment.customer?.name)},`,
    '',
    'Your Dew Theory appointment is on the calendar.',
    '',
    `Service: ${service?.name || appointment.service_name || 'Facial'}`,
    `When: ${when}`,
    `Reference: ${appointment.id}`,
    depositNote ? `Deposit policy: ${depositNote}` : null,
    '',
    'Before you come in:',
    '• Arrive with a clean face when possible (no heavy makeup).',
    '• Note any new actives, prescriptions, or reactions since your last visit.',
    '• To reschedule, contact the studio with your reference number.',
    '',
    'Questions: hello@dewtheory.studio',
    '',
    '— Dew Theory · Emily Mitchener'
  ]
    .filter((line) => line !== null)
    .join('\n');

  return sendEmail({
    to: email,
    subject,
    text,
    tags: ['booking_confirmed']
  });
}

export async function sendOrderConfirmationEmail({ order }) {
  const cfg = getEmailConfig();
  const email = order?.customer?.email;
  if (!email) return null;

  const lines = (order.items || [])
    .map(
      (i) =>
        `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.quantity} — $${Number(i.unit_price).toFixed(2)}`
    )
    .join('\n');

  const subject = `Order received — ${order.id}`;
  const text = [
    `Hi ${firstName(order.customer?.name)},`,
    '',
    'Thank you for your Dew Theory order. Emily fulfills Skin Script through her wholesale account.',
    '',
    `Order: ${order.id}`,
    order.total != null ? `Total: $${Number(order.total).toFixed(2)}` : null,
    '',
    lines ? `Items:\n${lines}` : null,
    '',
    'What happens next:',
    '1. We confirm stock and submit the wholesale order.',
    '2. You receive a ship update when tracking is available (manual for now).',
    '3. Questions? Contact us with your order reference.',
    '',
    `Shop: ${cfg.siteUrl}/shop`,
    'Email: hello@dewtheory.studio',
    '',
    '— Dew Theory'
  ]
    .filter((line) => line !== null)
    .join('\n');

  return sendEmail({
    to: email,
    subject,
    text,
    tags: ['order_confirmed']
  });
}

export async function sendMembershipInterestEmail({ name, email }) {
  const cfg = getEmailConfig();
  const admin = process.env.CONSULTATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  if (admin) {
    await sendEmail({
      to: admin,
      subject: `Membership interest — ${name || email}`,
      text: [
        'Someone asked for membership news.',
        '',
        `Name: ${name || '—'}`,
        `Email: ${email}`,
        '',
        'No packages sold yet — interest list only until Emily sets terms.'
      ].join('\n'),
      tags: ['membership_interest_admin']
    });
  }
  return sendEmail({
    to: email,
    subject: 'Membership interest received — Dew Theory',
    text: [
      `Hi ${firstName(name)},`,
      '',
      'We recorded your interest in membership. When Emily publishes tiers and pricing, we will reach out.',
      'Nothing has been charged and no subscription started.',
      '',
      '— Dew Theory'
    ].join('\n'),
    tags: ['membership_interest']
  });
}

function firstName(name) {
  const n = String(name || '').trim();
  if (!n) return 'there';
  return n.split(/\s+/)[0];
}

/** Booking deposit / cancellation copy — env-driven, never invents Emily’s real policy numbers. */
export function getBookingPolicy() {
  const depositPct = Number(process.env.BOOKING_DEPOSIT_PERCENT || '');
  const cancelHours = Number(process.env.BOOKING_CANCEL_HOURS || '');
  const parts = [];
  if (Number.isFinite(depositPct) && depositPct > 0) {
    parts.push(`${depositPct}% deposit may be required to hold the slot`);
  }
  if (Number.isFinite(cancelHours) && cancelHours > 0) {
    parts.push(`please cancel at least ${cancelHours} hours ahead when possible`);
  }
  return {
    depositPercent: Number.isFinite(depositPct) && depositPct > 0 ? depositPct : null,
    cancelHours: Number.isFinite(cancelHours) && cancelHours > 0 ? cancelHours : null,
    depositSummary: parts.length ? parts.join('; ') : null,
    /** Honest storefront line when policy env not set */
    publicNote:
      parts.length > 0
        ? parts.join('. ') + '.'
        : 'Deposit and cancellation windows will appear here when Emily confirms them. Your booking is held in studio records today.'
  };
}
