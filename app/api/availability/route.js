import { NextResponse } from 'next/server';
import { listBookableSlots } from '@/lib/availability';
import { getService } from '@/lib/services';
import { readStore } from '@/lib/store';

/**
 * GET /api/availability?service_id=optional
 * Returns bookable ISO start times (mock adapter minus confirmed appointments).
 */
export async function GET(request) {
  try {
    const serviceId = request.nextUrl.searchParams.get('service_id') || undefined;
    if (serviceId && !getService(serviceId)) {
      return NextResponse.json(
        { error: 'Unknown service', code: 'service_unknown' },
        { status: 400 }
      );
    }

    const appointments = readStore().appointments || [];
    const { source, slots } = await listBookableSlots({
      serviceId,
      appointments
    });

    return NextResponse.json({
      source,
      slots,
      count: slots.length,
      code: 'availability_ok'
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || 'Could not load availability',
        code: 'availability_error'
      },
      { status: 500 }
    );
  }
}
