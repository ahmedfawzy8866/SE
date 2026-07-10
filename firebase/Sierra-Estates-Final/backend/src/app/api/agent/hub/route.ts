import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { ScribeAgent } from '@/lib/agents/scribe';
import { CuratorAgent } from '@/lib/agents/curator';
import { MatchmakerAgent } from '@/lib/agents/matchmaker';
import { CloserAgent as CloserAgentLib } from '@/lib/agents/closer';

const scribe = new ScribeAgent();
const curator = new CuratorAgent();
const matchmaker = new MatchmakerAgent();
const closer = new CloserAgentLib();

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { agent, action, payload } = body;

  try {
    let result;
    switch (agent?.toLowerCase()) {
      case 'scribe':
        result = await scribe.run(action, payload);
        break;
      case 'curator':
        result = await curator.run(action, payload);
        break;
      case 'matchmaker':
        result = await matchmaker.run(action, payload);
        break;
      case 'closer':
        result = await closer.run(action, payload);
        break;
      default:
        return NextResponse.json({ error: `Unknown agent: ${agent}` }, { status: 400 });
    }
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[agent/hub] error:', err);
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}
