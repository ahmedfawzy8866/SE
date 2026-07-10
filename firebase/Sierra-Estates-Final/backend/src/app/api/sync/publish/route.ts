import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { PFIntegrationService } from '@/lib/services/PFIntegrationService';

const pfService = new PFIntegrationService();

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { unitId } = body;

  if (!unitId) {
    return NextResponse.json({ error: 'Missing unitId' }, { status: 400 });
  }

  try {
    const result = await pfService.publishListing(unitId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[sync/publish] error:', err);
    return NextResponse.json({ error: 'Failed to publish listing' }, { status: 500 });
  }
}
