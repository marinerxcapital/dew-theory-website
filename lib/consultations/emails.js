/**
 * Transactional consultation emails.
 * No provider currently wired — messages are recorded in store.outbound_emails
 * and logged. When RESEND_API_KEY (or similar) is set, send via HTTP.
 */
import { mutateStore } from '../store.js';
import { getConsultationConfig, getSiteUrl } from './config.js';

function recordEmail(message) {
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

async function trySend({ to, subject, text, html, tags = [] }) {
  const cfg = getConsultationConfig();
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: cfg.emailFrom,
          to: [to],
          reply_to: cfg.emailReplyTo,
          subject,
          text,
          html: html || undefined,
          tags: tags.map((t) => ({ name: 'type', value: String(t).slice(0, 64) }))
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return recordEmail({
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
      return recordEmail({
        to,
        subject,
        text,
        tags,
        status: 'sent',
        provider: 'resend',
        provider_id: data?.id || null
      });
    } catch (err) {
      return recordEmail({
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

  // Dev / no provider: persist + console (no secrets, no photo URLs)
  console.info('[consultation-email]', { to, subject, tags });
  return recordEmail({
    to,
    subject,
    text,
    tags,
    status: 'logged',
    provider: 'log',
    provider_id: null
  });
}

export async function sendPaymentReceivedEmail({ consultation, intakeToken }) {
  const site = getSiteUrl();
  const cfg = getConsultationConfig();
  const intakeUrl = `${site}/virtual-consultation/intake/${intakeToken}`;
  const scheduleUrl = cfg.schedulingUrl
    ? appendPrefill(cfg.schedulingUrl, consultation)
    : `${site}/virtual-consultation/success?session_id={CHECKOUT_SESSION_ID}`;

  const subject = `Payment received — next steps for your virtual consultation (${consultation.public_ref})`;
  const text = [
    `Hi ${firstName(consultation.client_name)},`,
    '',
    'Thank you for booking a Dew Theory Virtual Consultation with Emily.',
    '',
    'Next steps:',
    `1. Schedule your Zoom appointment: ${cfg.schedulingUrl ? scheduleUrl : 'Use the schedule button on your confirmation page.'}`,
    `2. Complete your secure intake form (at least 24 hours before your appointment): ${intakeUrl}`,
    '',
    'Your intake link is private — do not forward it. It contains a secure token for your consultation only.',
    '',
    `Reference: ${consultation.public_ref}`,
    '',
    '— Dew Theory'
  ].join('\n');

  return trySend({
    to: consultation.client_email,
    subject,
    text,
    tags: ['vc_payment_received']
  });
}

export async function sendIntakeSubmittedClientEmail({ consultation }) {
  const subject = `Intake received — ${consultation.public_ref}`;
  const text = [
    `Hi ${firstName(consultation.client_name)},`,
    '',
    'We received your virtual consultation intake. Emily will review it before your appointment.',
    '',
    consultation.intake_late
      ? 'Note: this was submitted after the preferred 24-hour deadline. Emily will still review it, but earlier submissions help her prepare.'
      : 'Thank you for submitting at least 24 hours ahead when possible.',
    '',
    `Reference: ${consultation.public_ref}`,
    '',
    '— Dew Theory'
  ].join('\n');

  return trySend({
    to: consultation.client_email,
    subject,
    text,
    tags: ['vc_intake_submitted']
  });
}

export async function sendIntakeReadyAdminEmail({ consultation }) {
  const cfg = getConsultationConfig();
  const site = getSiteUrl();
  const subject = `Intake ready for review — ${consultation.public_ref}`;
  const text = [
    'A virtual consultation intake is ready.',
    '',
    `Client: ${consultation.client_name}`,
    `Email: ${consultation.client_email}`,
    `Ref: ${consultation.public_ref}`,
    `Admin: ${site}/admin/consultations/${consultation.id}`,
    '',
    'Do not reply with clinical details in email threads that are not secure.'
  ].join('\n');

  return trySend({
    to: cfg.adminEmail,
    subject,
    text,
    tags: ['vc_intake_admin']
  });
}

export async function sendPlanReadyEmail({ consultation, planToken }) {
  const site = getSiteUrl();
  const planUrl = `${site}/virtual-consultation/plan/${planToken}`;
  const subject = `Your Dew Theory skincare plan is ready (${consultation.public_ref})`;
  const text = [
    `Hi ${firstName(consultation.client_name)},`,
    '',
    'Emily has prepared your personalized skincare plan.',
    '',
    `Open your secure plan (private link): ${planUrl}`,
    '',
    'This link contains private consultation information. Do not share it publicly.',
    'Recommended products link to the Dew Theory shop when available.',
    '',
    `Questions? Contact us: ${site}/contact`,
    '',
    '— Dew Theory'
  ].join('\n');

  return trySend({
    to: consultation.client_email,
    subject,
    text,
    tags: ['vc_plan_ready']
  });
}

function firstName(name) {
  const n = String(name || '').trim();
  if (!n) return 'there';
  return n.split(/\s+/)[0];
}

function appendPrefill(url, consultation) {
  try {
    const u = new URL(url);
    if (consultation.client_name) u.searchParams.set('name', consultation.client_name);
    if (consultation.client_email) u.searchParams.set('email', consultation.client_email);
    return u.toString();
  } catch {
    return url;
  }
}
