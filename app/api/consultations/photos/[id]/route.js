import { NextResponse } from 'next/server';
import { deletePhoto, readPhotoBytes } from '@/lib/consultations/photos.js';
import { getAdminFromCookies } from '@/lib/admin-auth.js';

export async function GET(request, { params }) {
  const id = params?.id;
  const { searchParams } = new URL(request.url);
  const intakeToken = searchParams.get('token');
  const admin = await getAdminFromCookies();

  if (!admin && !intakeToken) {
    return NextResponse.json({ error: 'Forbidden', code: 'forbidden' }, { status: 403 });
  }

  const result = readPhotoBytes(id, {
    admin: Boolean(admin),
    intakeToken
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
  }

  return new NextResponse(result.buffer, {
    status: 200,
    headers: {
      'Content-Type': result.photo.mime_type || 'application/octet-stream',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function DELETE(request, { params }) {
  const id = params?.id;
  const { searchParams } = new URL(request.url);
  const intakeToken = searchParams.get('token');
  const admin = await getAdminFromCookies();

  if (!admin && !intakeToken) {
    return NextResponse.json({ error: 'Forbidden', code: 'forbidden' }, { status: 403 });
  }

  const result = deletePhoto(id, { admin: Boolean(admin), intakeToken });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export const runtime = 'nodejs';
