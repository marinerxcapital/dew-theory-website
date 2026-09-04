/**
 * Virtual consultation configuration — price from Stripe Price ID, not hardcoded UI.
 */

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function getConsultationConfig() {
  const priceId = process.env.STRIPE_VIRTUAL_CONSULTATION_PRICE_ID || '';
  const schedulingUrl = process.env.CONSULTATION_SCHEDULING_URL || '';
  const schedulerProvider = process.env.CONSULTATION_SCHEDULER_PROVIDER || 'external';
  const timezone = process.env.CONSULTATION_TIMEZONE || 'America/Chicago';
  const adminEmail =
    process.env.CONSULTATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@dewtheory.local';
  const emailFrom = process.env.EMAIL_FROM || 'Dew Theory <noreply@dewtheoryco.com>';
  const emailReplyTo = process.env.EMAIL_REPLY_TO || adminEmail;
  const durationMinutes = Number(process.env.CONSULTATION_DURATION_MINUTES || 45);
  // Display-only fallback when Stripe Price not yet configured (never used for charge amount)
  const displayPriceCents = Number(process.env.CONSULTATION_DISPLAY_PRICE_CENTS || 0);

  // Mock paid path only when Stripe secret is absent AND not production,
  // unless owner explicitly opts in (staging Workers without Stripe).
  const allowMockExplicit = process.env.ALLOW_MOCK_CHECKOUT === 'true';
  const mockCheckoutAllowed =
    !process.env.STRIPE_SECRET_KEY &&
    (process.env.NODE_ENV !== 'production' || allowMockExplicit);

  return {
    priceId,
    schedulingUrl,
    schedulerProvider,
    timezone,
    adminEmail,
    emailFrom,
    emailReplyTo,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 45,
    displayPriceCents:
      Number.isFinite(displayPriceCents) && displayPriceCents > 0 ? displayPriceCents : null,
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY && priceId),
    mockCheckoutAllowed
  };
}

/** Public, non-secret subset safe for client pages. */
export function getPublicConsultationConfig() {
  const c = getConsultationConfig();
  return {
    timezone: c.timezone,
    durationMinutes: c.durationMinutes,
    displayPriceCents: c.displayPriceCents,
    stripeConfigured: c.stripeConfigured,
    schedulingConfigured: Boolean(c.schedulingUrl)
  };
}
