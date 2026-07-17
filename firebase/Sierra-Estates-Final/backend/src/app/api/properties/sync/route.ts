import { NextRequest, NextResponse } from 'next/server';
import { PFIntegrationService } from '@/lib/services/PFIntegrationService';

const pfService = new PFIntegrationService();

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await pfService.syncIncomingListings();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[properties/sync] error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
