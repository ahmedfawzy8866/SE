import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { runMatchingForLead } from '@/lib/services/matching-engine';

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
  }

  try {
    const matches = await runMatchingForLead(leadId);
    return NextResponse.json({ success: true, matches });
  } catch (err) {
    console.error('[matching] error:', err);
    return NextResponse.json({ error: 'Matching engine failed' }, { status: 500 });
  }
}
