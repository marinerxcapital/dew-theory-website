import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { listConsultations, consultationForAdmin } from '@/lib/consultations/service.js';
import { nextActionLabel } from '@/lib/consultations/statuses.js';

export async function GET(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;

  const list = listConsultations().map((c) => {
    const full = consultationForAdmin(c);
    return {
      id: full.id,
      public_ref: full.public_ref,
      client_name: full.client_name,
      client_email: full.client_email,
      status: full.status,
      payment_status: full.payment_status,
      appointment_start: full.appointment_start,
      intake_submitted_at: full.intake_submitted_at,
      plan_sent_at: full.plan_sent_at,
      created_at: full.created_at,
      next_action: nextActionLabel(full)
    };
  });

  return NextResponse.json({ consultations: list });
}

export const runtime = 'nodejs';
