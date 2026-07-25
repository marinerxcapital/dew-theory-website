import { NextResponse } from 'next/server';
import {
  getConsultationByIntakeToken,
  submitIntake
} from '@/lib/consultations/service.js';
import { listPhotos, requiredSlotsMissing } from '@/lib/consultations/photos.js';
import {
  sendIntakeReadyAdminEmail,
  sendIntakeSubmittedClientEmail
} from '@/lib/consultations/emails.js';
import { PHOTO_SLOT_LABELS, REQUIRED_PHOTO_SLOTS } from '@/lib/consultations/statuses.js';
import { trackEvent } from '@/lib/store.js';

function rateLimitOk(request) {
  // Lightweight in-memory guard for hot reloads; production should use edge rate limits
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';
  const key = `intake:${ip}`;
  if (!globalThis.__vcRate) globalThis.__vcRate = new Map();
  const now = Date.now();
  const entry = globalThis.__vcRate.get(key) || { count: 0, start: now };
  if (now - entry.start > 60_000) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  globalThis.__vcRate.set(key, entry);
  return entry.count <= 40;
}

export async function GET(request, { params }) {
  if (!rateLimitOk(request)) {
    return NextResponse.json({ error: 'Too many requests', code: 'rate_limited' }, { status: 429 });
  }
  const token = params?.token;
  const consultation = getConsultationByIntakeToken(token);
  if (!consultation) {
    return NextResponse.json({ error: 'Not found', code: 'intake_not_found' }, { status: 404 });
  }
  if (consultation.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment required', code: 'payment_required' }, { status: 402 });
  }

  trackEvent('virtual_consultation_intake_started', {
    consultation_id: consultation.id
  });

  const photos = listPhotos(consultation.id).map((p) => ({
    id: p.id,
    slot: p.slot,
    mime_type: p.mime_type,
    created_at: p.created_at
  }));

  return NextResponse.json({
    public_ref: consultation.public_ref,
    client_name: consultation.client_name,
    client_email: consultation.client_email,
    status: consultation.status,
    appointment_start: consultation.appointment_start,
    intake_due_at: consultation.intake_due_at,
    intake_submitted_at: consultation.intake_submitted_at,
    intake: consultation.intake || null,
    photos,
    required_photo_slots: REQUIRED_PHOTO_SLOTS,
    photo_slot_labels: PHOTO_SLOT_LABELS,
    missing_photo_slots: requiredSlotsMissing(consultation.id)
  });
}

export async function POST(request, { params }) {
  if (!rateLimitOk(request)) {
    return NextResponse.json({ error: 'Too many requests', code: 'rate_limited' }, { status: 429 });
  }
  const token = params?.token;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'invalid_json' }, { status: 400 });
  }

  const missing = requiredSlotsMissing(
    getConsultationByIntakeToken(token)?.id || ''
  );
  // Only enforce photos on final submit (not draft)
  if (body.finalize !== false) {
    const c = getConsultationByIntakeToken(token);
    if (c) {
      const stillMissing = requiredSlotsMissing(c.id);
      if (stillMissing.length) {
        return NextResponse.json(
          {
            error: 'Upload all required photos before submitting',
            code: 'photos_required',
            missing: stillMissing
          },
          { status: 400 }
        );
      }
    }
  }

  const result = await submitIntake(token, body);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
        field: result.field,
        details: result.details
      },
      { status: result.status || 400 }
    );
  }

  if (!result.duplicate) {
    await sendIntakeSubmittedClientEmail({ consultation: result.consultation });
    await sendIntakeReadyAdminEmail({ consultation: result.consultation });
  }

  return NextResponse.json({
    ok: true,
    late: result.late,
    public_ref: result.consultation.public_ref,
    status: result.consultation.status,
    missing_hint: missing
  });
}

export const runtime = 'nodejs';
