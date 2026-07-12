import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { generateOptionsPackage } from '@/lib/services/sales-engine';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/server/auth-guard';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) return unauthorizedResponse();

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const proposalId = await generateOptionsPackage(leadId);

    return NextResponse.json({ 
      success: true, 
      proposalId,
      message: 'Strategic options package generated successfully.'
    });

  } catch (error: any) {
    logger.error('Proposal API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({
      success: false,
      error: 'Failed to generate proposal'
    }, { status: 500 });
  }
}
