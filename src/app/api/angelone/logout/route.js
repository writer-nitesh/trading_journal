import { NextResponse } from 'next/server';
import { sessionStore } from '@/lib/angeloneSessionStore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { client_code } = body;
    if (!client_code) {
      return NextResponse.json({ error: 'Missing client_code' }, { status: 400 });
    }
    delete sessionStore[client_code];
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
