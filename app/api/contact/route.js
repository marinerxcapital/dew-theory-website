import { NextResponse } from 'next/server';
import { mutateStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 });
    }

    mutateStore((s) => {
      if (!s.messages) s.messages = [];
      s.messages.unshift({
        id: `msg_${Date.now()}`,
        name: body.name,
        email: body.email,
        topic: body.topic || 'general',
        message: body.message,
        created_at: new Date().toISOString(),
        read: false
      });
      return s;
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
