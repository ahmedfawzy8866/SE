import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { dealId, stakeholderId, assetId } = body;

  if (!dealId || !stakeholderId || !assetId) {
    return NextResponse.json(
      { error: 'Missing required fields: dealId, stakeholderId, assetId' },
      { status: 400 }
    );
  }

  try {
    await adminDb.collection('deals').doc(dealId).set({
      stakeholderId,
      assetId,
      stage: 'S9_initiated',
      initiatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, dealId, stage: 'S9_initiated' });
  } catch (err) {
    console.error('[closer/initiate] error:', err);
    return NextResponse.json({ error: 'Failed to initiate closer' }, { status: 500 });
  }
}
