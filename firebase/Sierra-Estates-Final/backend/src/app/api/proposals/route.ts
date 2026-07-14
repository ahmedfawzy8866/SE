import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';

const ai = new GoogleAIService();

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { leadId, assetId } = body;

  if (!leadId || !assetId) {
    return NextResponse.json({ error: 'Missing leadId or assetId' }, { status: 400 });
  }

  try {
    const [leadSnap, assetSnap] = await Promise.all([
      adminDb.collection('leads').doc(leadId).get(),
      adminDb.collection('listings').doc(assetId).get(),
    ]);

    if (!leadSnap.exists || !assetSnap.exists) {
      return NextResponse.json({ error: 'Lead or asset not found' }, { status: 404 });
    }

    const lead = leadSnap.data()!;
    const asset = assetSnap.data()!;

    const proposalText = await ai.generateContent(
      `Generate a luxury property investment proposal for:\n\nClient: ${lead.name}\nBudget: ${lead.budget}\n\nProperty: ${asset.title}\nCompound: ${asset.compound}\nPrice: ${asset.price} EGP\nArea: ${asset.area} sqm\n\nCreate a professional, persuasive proposal highlighting investment value and ROI.`
    );

    const proposalRef = await adminDb.collection('proposals').add({
      leadId,
      assetId,
      proposalText,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: proposalRef.id, proposalText });
  } catch (err) {
    console.error('[proposals] error:', err);
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 });
  }
}
