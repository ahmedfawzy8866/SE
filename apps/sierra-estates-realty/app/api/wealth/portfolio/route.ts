import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { WealthService } from '@/lib/services/WealthService';
import { applyRateLimit, publicEndpointLimiter } from '@/lib/server/rate-limit';

export async function GET(request: Request) {
  const rateLimitResponse = await applyRateLimit(request, publicEndpointLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '6');
  const market = searchParams.get('market') as 'egypt' | 'uae' | undefined;

  try {
    const portfolio = await WealthService.getCuratedPortfolio(count, market);
    return NextResponse.json(portfolio);
  } catch (error: any) {
    logger.error('Portfolio fetch failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
