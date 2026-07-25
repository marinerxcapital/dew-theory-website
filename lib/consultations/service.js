/**
 * Consultation domain service — file-backed store (mirrors orders/appointments).
 */
import { mutateStore, readStore, trackEvent, audit } from '../store.js';
import { getConsultationConfig } from './config.js';
import { createPublicRef, createTokenPair, tokensMatch } from './tokens.js';
import { canSubmitIntake, isTerminalStatus } from './statuses.js';
import { validateIntakeSubmission } from './intake-schema.js';

function ensureCollections(s) {
  if (!Array.isArray(s.consultations)) s.consultations = [];
  if (!Array.isArray(s.consultation_photos)) s.consultation_photos = [];
  if (!Array.isArray(s.consultation_plans)) s.consultation_plans = [];
  if (!Array.isArray(s.outbound_emails)) s.outbound_emails = [];
  if (!Array.isArray(s.webhook_events)) s.webhook_events = [];
  return s;
}

export function listConsultations() {
  const s = ensureCollections(readStore());
  return [...s.consultations].sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });
}

export function getConsultationById(id) {
  return listConsultations().find((c) => c.id === id) || null;
}

export function getConsultationByStripeSession(sessionId) {
  if (!sessionId) return null;
  return listConsultations().find((c) => c.stripe_session_id === sessionId) || null;
}

export function getConsultationByIntakeToken(rawToken) {
  if (!rawToken) return null;
  const s = ensureCollections(readStore());
  return s.consultations.find((c) => tokensMatch(rawToken, c.intake_token_hash)) || null;
}

export function getConsultationByPlanToken(rawToken) {
  if (!rawToken) return null;
  const s = ensureCollections(readStore());
  const plan = s.consultation_plans.find((p) => tokensMatch(rawToken, p.client_token_hash));
  if (!plan) return null;
  const consultation = s.consultations.find((c) => c.id === plan.consultation_id);
  return consultation ? { consultation, plan } : null;
}

export function getPlanForConsultation(consultationId) {
  const s = ensureCollections(readStore());
  return s.consultation_plans.find((p) => p.consultation_id === consultationId) || null;
}

export function getPhotosForConsultation(consultationId) {
  const s = ensureCollections(readStore());
  return s.consultation_photos.filter(
    (p) => p.consultation_id === consultationId && !p.deleted_at
  );
}

/**
 * Create a pending consultation before or at checkout start.
 */
export function createPendingConsultation({ name, email, source = 'virtual-consultation' }) {
  const intake = createTokenPair();
  const id = `vc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const public_ref = createPublicRef();
  const now = new Date().toISOString();
  const cfg = getConsultationConfig();

  const consultation = {
    id,
    public_ref,
    client_name: String(name || '').trim().slice(0, 200),
    client_email: String(email || '').trim().toLowerCase().slice(0, 320),
    status: 'payment_pending',
    payment_status: 'pending',
    stripe_customer_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    stripe_price_id: cfg.priceId || null,
    amount_cents: null,
    currency: 'usd',
    appointment_provider: cfg.schedulerProvider,
    appointment_id: null,
    appointment_start: null,
    appointment_end: null,
    appointment_timezone: cfg.timezone,
    intake_token_hash: intake.hash,
    // raw token only returned once for emailing; never re-read from store
    intake_due_at: null,
    intake_submitted_at: null,
    reviewed_at: null,
    consultation_completed_at: null,
    plan_sent_at: null,
    cancelled_at: null,
    refunded_at: null,
    cancel_reason: null,
    internal_notes: [],
    source,
    environment: process.env.NODE_ENV || 'development',
    created_at: now,
    updated_at: now
  };

  mutateStore((s) => {
    ensureCollections(s);
    s.consultations.unshift(consultation);
    return s;
  });

  trackEvent('virtual_consultation_checkout_started', {
    consultation_id: id,
    public_ref
  });

  return { consultation, intakeToken: intake.token };
}

export function attachStripeSession(consultationId, session) {
  let updated = null;
  mutateStore((s) => {
    ensureCollections(s);
    const idx = s.consultations.findIndex((c) => c.id === consultationId);
    if (idx < 0) return s;
    const prev = s.consultations[idx];
    s.consultations[idx] = {
      ...prev,
      stripe_session_id: session.id,
      stripe_customer_id:
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id || prev.stripe_customer_id,
      amount_cents: session.amount_total ?? prev.amount_cents,
      currency: session.currency || prev.currency || 'usd',
      updated_at: new Date().toISOString()
    };
    updated = s.consultations[idx];
    return s;
  });
  return updated;
}

/**
 * Mark paid from Stripe webhook / success path. Idempotent.
 */
export function markConsultationPaidFromSession(session) {
  if (!session?.id) throw new Error('session required');
  const consultationId = session.metadata?.consultation_id;
  let consultation = null;
  let created = false;
  let alreadyPaid = false;

  mutateStore((s) => {
    ensureCollections(s);
    let idx = s.consultations.findIndex((c) => c.stripe_session_id === session.id);
    if (idx < 0 && consultationId) {
      idx = s.consultations.findIndex((c) => c.id === consultationId);
    }

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

    if (idx < 0) {
      created = true;
      const intake = createTokenPair();
      consultation = {
        id: consultationId || `vc_${Date.now()}`,
        public_ref: createPublicRef(),
        client_name: session.customer_details?.name || session.metadata?.client_name || '',
        client_email:
          session.customer_email ||
          session.customer_details?.email ||
          session.metadata?.client_email ||
          '',
        status: 'scheduling_pending',
        payment_status: 'paid',
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntent,
        stripe_price_id: session.metadata?.price_id || null,
        amount_cents: session.amount_total ?? null,
        currency: session.currency || 'usd',
        appointment_provider: getConsultationConfig().schedulerProvider,
        appointment_id: null,
        appointment_start: null,
        appointment_end: null,
        appointment_timezone: getConsultationConfig().timezone,
        intake_token_hash: intake.hash,
        _intake_token_once: intake.token,
        intake_due_at: null,
        intake_submitted_at: null,
        reviewed_at: null,
        consultation_completed_at: null,
        plan_sent_at: null,
        cancelled_at: null,
        refunded_at: null,
        cancel_reason: null,
        internal_notes: [],
        source: session.metadata?.source || 'virtual-consultation',
        environment: session.metadata?.environment || process.env.NODE_ENV || 'development',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
      };
      s.consultations.unshift(consultation);
      return s;
    }

    const prev = s.consultations[idx];
    alreadyPaid = prev.payment_status === 'paid';
    if (alreadyPaid) {
      consultation = prev;
      return s;
    }

    const nextStatus =
      prev.status === 'payment_pending' || prev.status === 'paid'
        ? 'scheduling_pending'
        : prev.status;

    s.consultations[idx] = {
      ...prev,
      status: nextStatus,
      payment_status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntent || prev.stripe_payment_intent_id,
      stripe_customer_id:
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id || prev.stripe_customer_id,
      amount_cents: session.amount_total ?? prev.amount_cents,
      currency: session.currency || prev.currency,
      client_name: prev.client_name || session.customer_details?.name || '',
      client_email:
        prev.client_email ||
        session.customer_email ||
        session.customer_details?.email ||
        '',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    consultation = s.consultations[idx];
    return s;
  });

  if (!alreadyPaid) {
    trackEvent('virtual_consultation_payment_completed', {
      consultation_id: consultation?.id,
      stripe_session_id: session.id
    });
  }

  return { consultation, created, alreadyPaid };
}

export function setAppointment(consultationId, { appointment_id, start, end, timezone }) {
  let updated = null;
  mutateStore((s) => {
    ensureCollections(s);
    const idx = s.consultations.findIndex((c) => c.id === consultationId);
    if (idx < 0) return s;
    const prev = s.consultations[idx];
    if (isTerminalStatus(prev.status)) return s;
    const startIso = start ? new Date(start).toISOString() : prev.appointment_start;
    let intake_due_at = prev.intake_due_at;
    if (startIso) {
      intake_due_at = new Date(new Date(startIso).getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
    s.consultations[idx] = {
      ...prev,
      appointment_id: appointment_id || prev.appointment_id,
      appointment_start: startIso,
      appointment_end: end ? new Date(end).toISOString() : prev.appointment_end,
      appointment_timezone: timezone || prev.appointment_timezone,
      intake_due_at,
      status:
        prev.status === 'scheduling_pending' || prev.status === 'paid'
          ? 'intake_pending'
          : prev.intake_submitted_at
            ? prev.status
            : 'intake_pending',
      updated_at: new Date().toISOString()
    };
    updated = s.consultations[idx];
    return s;
  });
  if (updated) {
    trackEvent('virtual_consultation_scheduled', {
      consultation_id: consultationId
    });
  }
  return updated;
}

export function submitIntake(rawToken, body) {
  const consultation = getConsultationByIntakeToken(rawToken);
  if (!consultation) {
    return { ok: false, status: 404, error: 'Intake link not found', code: 'intake_not_found' };
  }
  if (!canSubmitIntake(consultation.status)) {
    return {
      ok: false,
      status: 400,
      error: 'This consultation cannot accept intake right now',
      code: 'intake_closed'
    };
  }
  if (consultation.payment_status !== 'paid') {
    return {
      ok: false,
      status: 402,
      error: 'Payment required before intake',
      code: 'payment_required'
    };
  }

  const validated = validateIntakeSubmission(body);
  if (!validated.ok) return validated;

  // Flag late intake rather than block
  let late = false;
  if (consultation.intake_due_at) {
    late = Date.now() > new Date(consultation.intake_due_at).getTime();
  }

  let updated = null;
  mutateStore((s) => {
    ensureCollections(s);
    const idx = s.consultations.findIndex((c) => c.id === consultation.id);
    if (idx < 0) return s;
    const prev = s.consultations[idx];
    // Prevent duplicate final submissions unless admin reopened
    if (prev.intake_submitted_at && prev.status !== 'intake_pending') {
      updated = prev;
      return s;
    }
    s.consultations[idx] = {
      ...prev,
      intake: validated.intake,
      intake_submitted_at: new Date().toISOString(),
      intake_late: late,
      status: 'intake_submitted',
      client_name: validated.intake.full_name || prev.client_name,
      client_email: validated.intake.email || prev.client_email,
      updated_at: new Date().toISOString()
    };
    updated = s.consultations[idx];
    return s;
  });

  if (updated?.intake_submitted_at) {
    trackEvent('virtual_consultation_intake_submitted', {
      consultation_id: consultation.id,
      late
    });
  }

  return { ok: true, consultation: updated, late, duplicate: Boolean(consultation.intake_submitted_at) };
}

export function addInternalNote(consultationId, adminId, text) {
  const note = {
    id: `note_${Date.now()}`,
    admin_id: adminId,
    text: String(text || '').trim().slice(0, 5000),
    created_at: new Date().toISOString()
  };
  if (!note.text) return null;
  mutateStore((s) => {
    ensureCollections(s);
    const idx = s.consultations.findIndex((c) => c.id === consultationId);
    if (idx < 0) return s;
    const notes = Array.isArray(s.consultations[idx].internal_notes)
      ? s.consultations[idx].internal_notes
      : [];
    s.consultations[idx] = {
      ...s.consultations[idx],
      internal_notes: [note, ...notes],
      updated_at: new Date().toISOString()
    };
    return s;
  });
  audit(adminId, 'consultation_note', 'consultation', consultationId, { note_id: note.id });
  return note;
}

export function updateConsultationStatus(consultationId, status, adminId) {
  let updated = null;
  mutateStore((s) => {
    ensureCollections(s);
    const idx = s.consultations.findIndex((c) => c.id === consultationId);
    if (idx < 0) return s;
    const prev = s.consultations[idx];
    const patch = { status, updated_at: new Date().toISOString() };
    if (status === 'reviewed') patch.reviewed_at = new Date().toISOString();
    if (status === 'consultation_completed') {
      patch.consultation_completed_at = new Date().toISOString();
    }
    if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();
    if (status === 'refunded') {
      patch.refunded_at = new Date().toISOString();
      patch.payment_status = 'refunded';
    }
    s.consultations[idx] = { ...prev, ...patch };
    updated = s.consultations[idx];
    return s;
  });
  if (updated && adminId) {
    audit(adminId, 'consultation_status', 'consultation', consultationId, { status });
  }
  return updated;
}

export function savePlan(consultationId, planBody, adminId) {
  const planToken = createTokenPair();
  let plan = null;
  mutateStore((s) => {
    ensureCollections(s);
    const existingIdx = s.consultation_plans.findIndex((p) => p.consultation_id === consultationId);
    const now = new Date().toISOString();
    const products = Array.isArray(planBody.products)
      ? planBody.products.slice(0, 30).map((p, i) => ({
          product_id: String(p.product_id || '').trim(),
          display_name: String(p.display_name || '').trim().slice(0, 200),
          product_url: String(p.product_url || '').trim().slice(0, 500),
          usage_instructions: String(p.usage_instructions || '').trim().slice(0, 2000),
          routine_phase: String(p.routine_phase || 'morning').slice(0, 40),
          sort_order: Number.isFinite(Number(p.sort_order)) ? Number(p.sort_order) : i,
          note: String(p.note || '').trim().slice(0, 500)
        }))
      : [];

    const base = {
      consultation_id: consultationId,
      overview: String(planBody.overview || '').trim().slice(0, 8000),
      morning_routine: String(planBody.morning_routine || '').trim().slice(0, 8000),
      evening_routine: String(planBody.evening_routine || '').trim().slice(0, 8000),
      weekly_schedule: String(planBody.weekly_schedule || '').trim().slice(0, 4000),
      layering_instructions: String(planBody.layering_instructions || '').trim().slice(0, 4000),
      expectations: String(planBody.expectations || '').trim().slice(0, 4000),
      maintenance_plan: String(planBody.maintenance_plan || '').trim().slice(0, 4000),
      additional_notes: String(planBody.additional_notes || '').trim().slice(0, 4000),
      products,
      status: planBody.publish ? 'published' : 'draft',
      updated_at: now
    };

    if (existingIdx >= 0) {
      const prev = s.consultation_plans[existingIdx];
      s.consultation_plans[existingIdx] = {
        ...prev,
        ...base,
        version: (prev.version || 1) + 1,
        client_token_hash: prev.client_token_hash || planToken.hash,
        sent_at: planBody.publish ? prev.sent_at || now : prev.sent_at,
        _client_token_once: prev.client_token_hash ? undefined : planToken.token
      };
      plan = s.consultation_plans[existingIdx];
    } else {
      plan = {
        id: `plan_${Date.now()}`,
        ...base,
        version: 1,
        client_token_hash: planToken.hash,
        sent_at: planBody.publish ? now : null,
        created_at: now,
        _client_token_once: planToken.token
      };
      s.consultation_plans.unshift(plan);
    }

    const cIdx = s.consultations.findIndex((c) => c.id === consultationId);
    if (cIdx >= 0) {
      s.consultations[cIdx] = {
        ...s.consultations[cIdx],
        status: planBody.publish ? 'plan_sent' : 'plan_draft',
        plan_sent_at: planBody.publish
          ? s.consultations[cIdx].plan_sent_at || now
          : s.consultations[cIdx].plan_sent_at,
        updated_at: now
      };
    }
    return s;
  });

  if (adminId) {
    audit(adminId, planBody.publish ? 'plan_publish' : 'plan_draft', 'consultation', consultationId, {
      plan_id: plan?.id
    });
  }
  return plan;
}

/** Sanitize consultation for admin UI (includes intake, not photo bytes). */
export function consultationForAdmin(c) {
  if (!c) return null;
  const { intake_token_hash, ...rest } = c;
  return {
    ...rest,
    has_intake_token: Boolean(intake_token_hash),
    photos: getPhotosForConsultation(c.id),
    plan: getPlanForConsultation(c.id)
      ? (() => {
          const p = getPlanForConsultation(c.id);
          const { client_token_hash, _client_token_once, ...safe } = p;
          return { ...safe, has_client_token: Boolean(client_token_hash) };
        })()
      : null
  };
}

/** Public success page view — no sensitive hashes. */
export function consultationPublicSummary(c) {
  if (!c) return null;
  return {
    id: c.id,
    public_ref: c.public_ref,
    client_name: c.client_name,
    client_email: c.client_email,
    status: c.status,
    payment_status: c.payment_status,
    appointment_start: c.appointment_start,
    appointment_timezone: c.appointment_timezone,
    intake_submitted_at: c.intake_submitted_at,
    plan_sent_at: c.plan_sent_at
  };
}
