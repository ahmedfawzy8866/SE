import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';

export async function GET(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection('viewingRequests').orderBy('createdAt', 'desc').limit(100).get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, requests });
  } catch (err) {
    console.error('[viewing-requests GET] error:', err);
    return NextResponse.json({ error: 'Failed to fetch viewing requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stakeholderName, stakeholderPhone, assetId, preferredDate, notes } = body;

  if (!stakeholderName || !stakeholderPhone || !assetId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const docRef = await adminDb.collection('viewingRequests').add({
      stakeholderName,
      stakeholderPhone,
      assetId,
      preferredDate: preferredDate || null,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[viewing-requests POST] error:', err);
    return NextResponse.json({ error: 'Failed to create viewing request' }, { status: 500 });
  }
}
