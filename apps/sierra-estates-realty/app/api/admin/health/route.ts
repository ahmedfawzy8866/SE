import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/server/auth-guard';
import { getSystemHealth, getMetricsSummary } from '@/lib/server/monitoring';

/**
 * GET /api/admin/health
 * System health check endpoint — admin only
 * Returns current status of all critical services and system metrics
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) return unauthorizedResponse();

  try {
    const systemHealth = await getSystemHealth();
    const metrics = getMetricsSummary();

    return NextResponse.json({
      success: true,
      health: systemHealth,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve health status',
      },
      { status: 500 }
    );
  }
}
