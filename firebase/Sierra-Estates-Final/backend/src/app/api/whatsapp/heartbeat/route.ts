import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';

export async function POST(req: NextRequest) {
  const secretKey = req.headers.get('x-se-secret-key');
  if (secretKey !== process.env.X_SE_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await adminDb.collection('scraperHeartbeats').add({
      ...body,
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, status: 'alive' });
  } catch (err) {
    console.error('[whatsapp/heartbeat] error:', err);
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 });
  }
}
