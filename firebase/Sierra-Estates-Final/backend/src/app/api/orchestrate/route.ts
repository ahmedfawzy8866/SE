import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { OrchestratorService } from '@/lib/services/orchestrator';

const orchestrator = new OrchestratorService();

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();

  try {
    const result = await orchestrator.run(body);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[orchestrate] error:', err);
    return NextResponse.json({ error: 'Orchestration failed' }, { status: 500 });
  }
}
