import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';

export async function GET(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection('syncLog').orderBy('createdAt', 'desc').limit(50).get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error('[sync GET] error:', err);
    return NextResponse.json({ error: 'Failed to fetch sync logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();

  try {
    const docRef = await adminDb.collection('syncQueue').add({
      ...body,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[sync POST] error:', err);
    return NextResponse.json({ error: 'Failed to queue sync' }, { status: 500 });
  }
}
