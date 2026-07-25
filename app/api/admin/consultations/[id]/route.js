import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  addInternalNote,
  consultationForAdmin,
  getConsultationById,
  savePlan,
  setAppointment,
  updateConsultationStatus
} from '@/lib/consultations/service.js';
import { sendPlanReadyEmail } from '@/lib/consultations/emails.js';
import { mutateStore } from '@/lib/store.js';
import { CONSULTATION_STATUSES } from '@/lib/consultations/statuses.js';
import { getProducts } from '@/lib/products-server.js';

export async function GET(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;

  const c = getConsultationById(params.id);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    consultation: consultationForAdmin(c),
    catalog: getProducts()
      .filter((p) => p.active !== false && p.stock_status !== 'discontinued')
      .map((p) => ({ id: p.id, name: p.name, category: p.category }))
  });
}

export async function PATCH(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const c = getConsultationById(params.id);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.action === 'status') {
    if (!CONSULTATION_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const updated = updateConsultationStatus(params.id, body.status, admin.id);
    return NextResponse.json({ consultation: consultationForAdmin(updated) });
  }

  if (body.action === 'note') {
    const note = addInternalNote(params.id, admin.id, body.text);
    if (!note) return NextResponse.json({ error: 'Empty note' }, { status: 400 });
    return NextResponse.json({ note, consultation: consultationForAdmin(getConsultationById(params.id)) });
  }

  if (body.action === 'appointment') {
    const updated = setAppointment(params.id, {
      appointment_id: body.appointment_id,
      start: body.start,
      end: body.end,
      timezone: body.timezone
    });
    return NextResponse.json({ consultation: consultationForAdmin(updated) });
  }

  if (body.action === 'save_plan' || body.action === 'publish_plan') {
    const publish = body.action === 'publish_plan' || body.publish === true;
    const plan = savePlan(
      params.id,
      {
        ...body.plan,
        publish
      },
      admin.id
    );

    if (publish) {
      let planToken = plan._client_token_once;
      if (!planToken) {
        // regenerate token for resend
        const { createTokenPair } = await import('@/lib/consultations/tokens.js');
        const pair = createTokenPair();
        mutateStore((s) => {
          const idx = s.consultation_plans?.findIndex((p) => p.consultation_id === params.id);
          if (idx >= 0) {
            s.consultation_plans[idx].client_token_hash = pair.hash;
            s.consultation_plans[idx].sent_at = new Date().toISOString();
          }
          return s;
        });
        planToken = pair.token;
      } else {
        mutateStore((s) => {
          const idx = s.consultation_plans?.findIndex((p) => p.consultation_id === params.id);
          if (idx >= 0) delete s.consultation_plans[idx]._client_token_once;
          return s;
        });
      }
      const consultation = getConsultationById(params.id);
      await sendPlanReadyEmail({ consultation, planToken });
    }

    return NextResponse.json({
      plan: (() => {
        const { client_token_hash, _client_token_once, ...safe } = plan;
        return safe;
      })(),
      consultation: consultationForAdmin(getConsultationById(params.id))
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export const runtime = 'nodejs';
