import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { validateAppointmentStatusTransition } from '@/lib/appointment-status';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PATCH(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  const body = await request.json();
  const before = readStore().appointments.find((a) => a.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const nextStatus = body.status ?? before.status;
  const transition = validateAppointmentStatusTransition(before.status, nextStatus);
  if (!transition.ok) {
    return NextResponse.json(
      {
        error: transition.error,
        code: transition.code,
        allowed: transition.allowed
      },
      { status: transition.status || 400 }
    );
  }

  let after;
  mutateStore((s) => {
    const idx = s.appointments.findIndex((a) => a.id === params.id);
    after = {
      ...s.appointments[idx],
      status: transition.to,
      updated_at: new Date().toISOString()
    };
    s.appointments[idx] = after;
    return s;
  });

  if (!transition.noop) {
    audit(admin.id, 'appointment.status_update', 'Appointments', params.id, {
      before: before.status,
      after: after.status
    });
  }

  return NextResponse.json({ appointment: after });
}
