import { NextResponse } from 'next/server';
import { authorizeIntakeUpload, storePhoto } from '@/lib/consultations/photos.js';

export async function POST(request) {
  try {
    const form = await request.formData();
    const token = String(form.get('token') || '');
    const slot = String(form.get('slot') || '');
    const file = form.get('file');

    const auth = authorizeIntakeUpload(token, slot);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File required', code: 'file_required' }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);
    const result = await storePhoto({
      consultationId: auth.consultation.id,
      slot,
      buffer,
      claimedMime: file.type,
      originalName: file.name
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
    }

    return NextResponse.json({ ok: true, photo: result.photo });
  } catch (err) {
    return NextResponse.json(
      { error: 'Upload failed', code: 'upload_failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
